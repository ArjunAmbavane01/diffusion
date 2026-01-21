import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    generations: defineTable({
        userId: v.string(),
        prompt: v.string(),
        canvasImageStorageId: v.id("_storage"),
        resultImageStorageId: v.optional(v.id("_storage")),
        status: v.union(
            v.literal("queued"),
            v.literal("processing"),
            v.literal("completed"),
            v.literal("failed"),
        ),
    }).index("by_user", ["userId"])
})