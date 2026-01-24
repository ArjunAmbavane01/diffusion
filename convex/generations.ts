import { mutation } from "./_generated/server";
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
            prompt:args.prompt
        })

        // return createGenerationId;
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
