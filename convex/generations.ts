import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { internal } from "./_generated/api";

export const createGeneration = mutation({
    args: { prompt: v.string(), canvasImageStorageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);

        if (!user) throw new ConvexError("User not authenticated");

        const createGenerationId = await ctx.db.insert("generations", {
            prompt: args.prompt,
            canvasImageStorageId: args.canvasImageStorageId,
            status: "queued",
            userId: user._id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // run llm action
        await ctx.scheduler.runAfter(0, internal.actions.runGeneration, {
            generationId: createGenerationId,
            prompt: args.prompt
        })
    },
})

export const generateImageUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("User not authenticated");

        return await ctx.storage.generateUploadUrl();
    },
});

export const getUserGenerations = query({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("User not authenticated");

        const generations = await ctx.db
            .query("generations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        // Get URLs for images
        return await Promise.all(
            generations.map(async (gen) => ({
                ...gen,
                canvasImageUrl: await ctx.storage.getUrl(gen.canvasImageStorageId),
                resultImageUrl: gen.resultImageStorageId
                    ? await ctx.storage.getUrl(gen.resultImageStorageId)
                    : null,
            }))
        );
    },
});