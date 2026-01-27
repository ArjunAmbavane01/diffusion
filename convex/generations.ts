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
            status: "processing",
            userId: user._id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isSaved: false,
        });

        // run llm action
        await ctx.scheduler.runAfter(0, internal.actions.runGeneration, {
            generationId: createGenerationId,
            prompt: args.prompt
        })

        return createGenerationId;
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

export const deleteGeneration = mutation({
    args: { id: v.id("generations") },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("User not authenticated");

        const generation = await ctx.db.get(args.id);

        if (!generation) throw new ConvexError("Generation not found");
        if (generation.userId !== user._id) throw new ConvexError("Unauthorized to delete this generation");

        // Delete stored images
        if (generation.canvasImageStorageId) await ctx.storage.delete(generation.canvasImageStorageId);
        if (generation.resultImageStorageId) await ctx.storage.delete(generation.resultImageStorageId);

        // Delete generation record
        await ctx.db.delete(args.id);
    },
});

export const toggleSave = mutation({
    args: { id: v.id("generations") },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("User not authenticated");

        const generation = await ctx.db.get(args.id);
        if (!generation) throw new ConvexError("Generation not found");
        if (generation.userId !== user._id) throw new ConvexError("Unauthorized");

        await ctx.db.patch(args.id, {
            isSaved: !generation.isSaved,
            updatedAt: Date.now(),
        });
    },
});

export const getSavedGenerations = query({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("User not authenticated");

        const generations = await ctx.db
            .query("generations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("isSaved"), true))
            .order("desc")
            .collect();

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