"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, Image as ImageIcon, Info, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export default function ImageGallery() {
    const generations = useQuery(api.generations.getUserGenerations);
    const deleteGeneration = useMutation(api.generations.deleteGeneration);

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

    if (generations.length === 0) {
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
                    {generations.length} {generations.length === 1 ? "creation" : "creations"}
                </p>
            </div>


            <div className="flex-1 min-h-0 overflow-y-auto pr-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                    {generations.map((gen) => (
                        <Card
                            key={gen._id}
                            className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-primary/50 p-0"
                            onMouseEnter={() => setHoveredId(gen._id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div className="relative aspect-square bg-muted">
                                {gen.status === "processing" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-20">
                                        <Loader2 className="size-10 animate-spin text-primary mb-3" />
                                        <p className="text-sm font-medium">Generating...</p>
                                        <div className="w-32 h-1 bg-muted rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
                                        </div>
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
                                {gen.canvasImageUrl && (
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
        </div>
    );
}