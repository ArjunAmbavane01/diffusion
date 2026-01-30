"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image as ImageIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ImageCard } from "./image-card";

export default function ImageGallery() {
    const generations = useQuery(api.generations.getUserGenerations);

    const toggleSave = useMutation(api.generations.toggleSave).withOptimisticUpdate(
        (localStore, args) => {
            const currentGenerations = localStore.getQuery(api.generations.getUserGenerations);
            if (currentGenerations !== undefined) {
                const updatedGenerations = currentGenerations.map((gen) =>
                    gen._id === args.id
                        ? { ...gen, isSaved: !gen.isSaved, updatedAt: Date.now() }
                        : gen
                );
                localStore.setQuery(api.generations.getUserGenerations, {}, updatedGenerations);
            }
        }
    );

    const deleteGeneration = useMutation(api.generations.deleteGeneration).withOptimisticUpdate(
        (localStore, args) => {
            const currentGenerations = localStore.getQuery(api.generations.getUserGenerations);
            if (currentGenerations !== undefined) {
                const updatedGenerations = currentGenerations.filter((gen) => gen._id !== args.id);
                localStore.setQuery(api.generations.getUserGenerations, {}, updatedGenerations);
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

    const handleDownload = useCallback(async (id: Id<"generations">, url: string, prompt: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${prompt.slice(0, 50).replace(/[^a-z0-9]/gi, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            toast.success("Image downloaded successfully");
        } catch (error) {
            toast.error("Failed to download image");
        }
    }, []);

    const generationCount = useMemo(() => generations?.length ?? 0, [generations?.length]);

    if (generations === undefined) {
        return (
            <div className="col-span-2 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Spinner className="size-8" />
                    Loading your creations...
                </div>
            </div>
        );
    }

    if (generationCount === 0) {
        return (
            <div className="col-span-2 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4 ">
                    <ImageIcon className="size-16 opacity-20 stroke-1" />
                    <p className="text-lg font-medium">No generations yet</p>
                    <p className="text-muted-foreground">Start by drawing and generating your first image</p>
                </div>
            </div>
        );
    }

    return (
        <div className="col-span-2 h-full flex flex-col gap-3 p-5 bg-background rounded-2xl min-h-0">
            <div className="pb-3 border-b border-border/50">
                <h2 className="text-xl tracking-tight">Your Gallery</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    {generationCount} {generationCount === 1 ? "creation" : "creations"}
                </p>
            </div>


            <div className="flex-1 min-h-0 overflow-y-auto pr-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                    {generations.map((gen) => (
                        <ImageCard
                            key={gen._id}
                            generation={gen}
                            isHovered={hoveredId === gen._id}
                            onHover={setHoveredId}
                            onDelete={handleDelete}
                            onToggleSave={handleToggleSave}
                            onDownload={handleDownload}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}