"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Heart } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { ImageCard } from "../dashboard/image-card";

export default function SavedGallery() {

    const savedGenerations = useQuery(api.generations.getSavedGenerations);
    const toggleSave = useMutation(api.generations.toggleSave).withOptimisticUpdate(
        (localStore, args) => {
            const currentGenerations = localStore.getQuery(api.generations.getSavedGenerations);
            if (currentGenerations !== undefined) {
                const updatedGenerations = currentGenerations.map((gen) =>
                    gen._id === args.id
                        ? { ...gen, isSaved: !gen.isSaved, updatedAt: Date.now() }
                        : gen
                );
                localStore.setQuery(api.generations.getSavedGenerations, {}, updatedGenerations);
            }
        }
    );

    const deleteGeneration = useMutation(api.generations.deleteGeneration).withOptimisticUpdate(
        (localStore, args) => {
            const currentGenerations = localStore.getQuery(api.generations.getSavedGenerations);
            if (currentGenerations !== undefined) {
                const updatedGenerations = currentGenerations.filter((gen) => gen._id !== args.id);
                localStore.setQuery(api.generations.getSavedGenerations, {}, updatedGenerations);
            }
        }
    );

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const handleDelete = useCallback(async (id: Id<"generations">) => {
        try {
            await deleteGeneration({ id });
            toast.success("Generation deleted successfully");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete generation";
            toast.error(errorMessage);
        }
    }, [deleteGeneration]);

    const handleToggleSave = useCallback(async (id: Id<"generations">) => {
        try {
            await toggleSave({ id });
        } catch (error) {
            toast.error("Failed to update");
        }
    }, [toggleSave]);

    const savedGenerationsCount = useMemo(() => savedGenerations?.length ?? 0, [savedGenerations?.length]);

    if (savedGenerations === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (savedGenerationsCount === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Heart className="size-16 opacity-20 stroke-1" />
                    <p className="text-lg font-medium">No saved images yet</p>
                    <p className="text-muted-foreground">
                        Save your favorite generations to find them here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 max-w-7xl mx-auto mt-16 py-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl tracking-tight">Saved Images</h1>
                <p className="text-muted-foreground">
                    {savedGenerationsCount} {savedGenerationsCount === 1 ? "image" : "images"}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {savedGenerations.map((gen) => (
                    <ImageCard
                        key={gen._id}
                        generation={gen}
                        isHovered={hoveredId === gen._id}
                        onHover={setHoveredId}
                        onDelete={handleDelete}
                        onToggleSave={handleToggleSave}
                    />
                ))}
            </div>
        </div>
    );
}