import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { generationStatus } from "./validators";

export const runGeneration = internalAction({
    args: { generationId: v.id("generations") },
    handler: async (ctx, args) => {

        await ctx.runMutation(internal.actions.updateStatus, {
            id: args.generationId,
            status: "processing"
        })
        const gen = await ctx.runQuery(internal.actions.getGeneration, {
            id: args.generationId,
        });

        // TODO: call your LLM / image model here
        // const resultBuffer = await callModel(gen.prompt, gen.canvasImageStorageId)

        // await ctx.storage.store(resultBuffer) → resultStorageId

        await ctx.runMutation(internal.actions.updateStatus, {
            id: args.generationId,
            status: "completed",
        });
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