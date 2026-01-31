import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { generationStatus } from "./validators";
import Replicate from "replicate";

export const runGeneration = internalAction({
    args: { generationId: v.id("generations"), prompt: v.string() },
    handler: async (ctx, args) => {

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
                image: `data:image/png;base64,${canvasImageBase64}`,
                prompt: `${args.prompt}, high quality illustration, rich details, professional concept art, cinematic lighting, expressive style`,
                negative_prompt: "wrong anatomy, extra limbs, wrong pose, low quality, blurry, messy, chaotic, distorted",
                image_resolution: "512",
                scale: 9,
                strength: 0.7,
            };

            const output = await replicate.run(
                "jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613",
                { input }
            );

            const arr = output as unknown as { url: () => string }[];
            const resultUrl = arr[1].url();

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