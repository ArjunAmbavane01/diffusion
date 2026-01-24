import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { generationStatus } from "./validators";
import Replicate from "replicate";

export const runGeneration = internalAction({
    args: { generationId: v.id("generations"), prompt: v.string() },
    handler: async (ctx, args) => {

        await ctx.runMutation(internal.actions.updateStatus, {
            id: args.generationId,
            status: "processing"
        })
        const gen = await ctx.runQuery(internal.actions.getGeneration, {
            id: args.generationId,
        });

        if (!gen) throw new Error("Generation not found");

        try {

            const canvasImageUrl = await ctx.storage.getUrl(gen.canvasImageStorageId);
            if (!canvasImageUrl) throw new Error("Canvas image not found");
            // Fetch the canvas image
            const canvasImageResponse = await fetch(canvasImageUrl);
            const canvasImageBuffer = await canvasImageResponse.arrayBuffer();
            const canvasImageBase64 = btoa(
                String.fromCharCode(...new Uint8Array(canvasImageBuffer))
            );

            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN!,
            });

            const input = {
                image: `data:image/jpeg;base64,${canvasImageBase64}`,
                prompt: args.prompt,
                image_resolution: "512",
                strength: "1",
                scale: 7,
                n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
            };

            console.log("Calling Replicate...")
            const output = await replicate.run("jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117", { input });

            const arr = output as unknown as { url: () => string }[];
            const resultUrl = arr[1].url();

            console.log("Result URL:", resultUrl);

            // fetch result image
            const res = await fetch(resultUrl);
            const buffer = await res.arrayBuffer();
            const bytes = new Uint8Array(buffer);

            const resultStorageId = await ctx.storage.store(new Blob([bytes]));

            await ctx.runMutation(internal.actions.saveResult, {
                id: args.generationId,
                resultImageStorageId: resultStorageId,
                status: "completed"
            });
            console.log("Stored to Convex:", resultStorageId);

        } catch (err: unknown) {
            console.error("runGeneration failed:", err);

            await ctx.runMutation(internal.actions.updateStatus, {
                id: args.generationId,
                status: "failed",
            });

            throw err;
        }
    },
})

export const updateStatus = internalMutation({
    args: {
        id: v.id("generations"), status: generationStatus
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
})

export const getGeneration = internalQuery({
    args: { id: v.id("generations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const saveResult = internalMutation({
    args: {
        id: v.id("generations"),
        resultImageStorageId: v.id("_storage"),
        status: generationStatus
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            resultImageStorageId: args.resultImageStorageId,
            updatedAt: Date.now(),
            status: args.status,
        });
    },
});