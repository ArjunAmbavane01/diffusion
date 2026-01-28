import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { generationStatus } from "./validators";

export default defineSchema({
    generations: defineTable({
        userId: v.string(),
        prompt: v.string(),
        canvasImageStorageId: v.id("_storage"),
        resultImageStorageId: v.optional(v.id("_storage")),
        status: generationStatus,
        createdAt: v.number(),
        updatedAt: v.number(),
        isSaved: v.optional(v.boolean()),
    })
    .index("by_user", ["userId"])
    .index("by_user_saved", ["userId", "isSaved", "createdAt"])
})