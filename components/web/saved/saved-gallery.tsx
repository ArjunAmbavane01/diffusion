"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, Trash2, Heart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function SavedGallery() {

    const savedGenerations = useQuery(api.generations.getSavedGenerations);
    const deleteGeneration = useMutation(api.generations.deleteGeneration);
    const toggleSave = useMutation(api.generations.toggleSave);

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<Id<"generations"> | null>(null);

    const handleDelete = async (id: Id<"generations">) => {
        try {
            setDeletingId(id);
            await deleteGeneration({ id });
            toast.success("Generation deleted successfully");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete generation";
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };


    const handleToggleSave = async (id: Id<"generations">, currentSavedState: boolean) => {
        try {
            await toggleSave({ id });
        } catch (error) {
            toast.error("Failed to update");
        }
    };


    if (savedGenerations === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (savedGenerations.length === 0) {
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
        <div className="flex flex-col gap-10 max-w-7xl h-[calc(100vh-4rem)] mx-auto mt-16 py-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl tracking-tight">Saved Images</h1>
                <p className="text-muted-foreground mt-2">
                    {savedGenerations.length} {savedGenerations.length === 1 ? "image" : "images"}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {savedGenerations.map((gen) => (
                    <Card
                        key={gen._id}
                        className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-primary/50 p-0"
                        onMouseEnter={() => setHoveredId(gen._id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <div className="relative aspect-square bg-muted">
                            {(gen.status === "processing" || (gen.status === "completed" && !gen.resultImageUrl)) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-20">
                                    <Loader2 className="size-10 animate-spin text-primary relative z-10" />
                                    <p className="text-sm font-medium mt-4">Creating magic...</p>
                                    <p className="text-xs text-muted-foreground mt-1 animate-pulse">This may take some seconds</p>
                                </div>
                            )}

                            {gen.status === "failed" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-sm z-20">
                                    <AlertCircle className="size-10 text-destructive mb-3" />
                                    <p className="text-sm font-medium text-destructive">
                                        Generation Failed
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Please try again
                                    </p>
                                </div>
                            )}

                            {/* Canvas Image (background) */}
                            {(gen.status === "processing" || gen.status === "queued") && gen.canvasImageUrl && (
                                <Image
                                    src={gen.canvasImageUrl}
                                    alt="Canvas sketch"
                                    fill
                                    className="object-cover opacity-20"
                                />
                            )}

                            {/* Result Image */}
                            {gen.status === "completed" && gen.resultImageUrl && (
                                <Image
                                    src={gen.resultImageUrl}
                                    alt={gen.prompt}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            )}

                            {gen.status === "completed" && hoveredId === gen._id && (
                                <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent z-30 flex flex-col justify-end p-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Prompt</p>
                                            <p className="text-sm text-white font-medium line-clamp-3">
                                                {gen.prompt}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Created</p>
                                            <p className="text-xs text-white">
                                                {new Date(gen.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(gen.status === "completed" || gen.status === "failed") && (
                                <div className="absolute top-3 right-3 flex gap-2 items-center z-40">
                                    <Button
                                        variant={"ghost"}
                                        size={"icon"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleSave(gen._id, gen.isSaved || false);
                                        }}
                                        className="rounded-sm bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Heart
                                            className={`size-4 transition-all ${gen.isSaved
                                                ? "fill-red-500 text-red-500"
                                                : "text-muted-foreground"
                                                }`}
                                        />
                                    </Button>
                                    <Button
                                        variant={"destructive"}
                                        size={"icon"}
                                        onClick={() => handleDelete(gen._id)}
                                        disabled={deletingId === gen._id}
                                        className="rounded-sm opacity-0 group-hover:opacity-100"
                                    >
                                        {deletingId === gen._id ? (
                                            <Spinner className="size-4" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}