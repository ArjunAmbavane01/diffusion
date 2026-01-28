import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { AlertCircle, Heart, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo } from "react";

export const ImageCard = memo(function ImageCard({
    generation: gen,
    isHovered,
    onHover,
    onDelete,
    onToggleSave,
}: {
    generation: any;
    isHovered: boolean;
    onHover: (id: string | null) => void;
    onDelete: (id: Id<"generations">) => void;
    onToggleSave: (id: Id<"generations">) => void;
}) {
    const formattedDate = useMemo(
        () =>
            new Date(gen.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
        [gen.createdAt]
    );

    const isProcessing = gen.status === "processing" || (gen.status === "completed" && !gen.resultImageUrl);
    const isFailed = gen.status === "failed";
    const isCompleted = gen.status === "completed";

    const handleMouseEnter = useCallback(() => onHover(gen._id), [gen._id, onHover]);
    const handleMouseLeave = useCallback(() => onHover(null), [onHover]);
    const handleSaveClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onToggleSave(gen._id);
        },
        [gen._id, onToggleSave]
    );
    const handleDeleteClick = useCallback(() => onDelete(gen._id), [gen._id, onDelete]);

    return (
        <Card
            className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-primary/50 p-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="relative aspect-square bg-muted">
                {/* Processing State */}
                {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-20">
                        <Loader2 className="size-10 animate-spin text-primary relative z-10" />
                        <p className="text-sm font-medium mt-4">Creating magic...</p>
                        <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                            This may take some seconds
                        </p>
                    </div>
                )}

                {/* Failed State */}
                {isFailed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-sm z-20">
                        <AlertCircle className="size-10 text-destructive mb-3" />
                        <p className="text-sm font-medium text-destructive">Generation Failed</p>
                        <p className="text-xs text-muted-foreground mt-1">Please try again</p>
                    </div>
                )}

                {/* Canvas Image (background) */}
                {(gen.status === "processing" || gen.status === "queued") && gen.canvasImageUrl && (
                    <Image
                        src={gen.canvasImageUrl}
                        alt="Canvas sketch"
                        fill
                        sizes="(max-width: 1280px) 50vw, 33vw"
                        className="object-cover opacity-20"
                    />
                )}

                {/* Result Image */}
                {isCompleted && gen.resultImageUrl && (
                    <Image
                        src={gen.resultImageUrl}
                        alt={gen.prompt}
                        fill
                        sizes="(max-width: 1280px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority={false}
                        loading="lazy"
                    />
                )}

                {/* Hover Overlay with Details */}
                {isCompleted && isHovered && (
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent z-30 flex flex-col justify-end p-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Prompt</p>
                                <p className="text-sm text-white font-medium line-clamp-3">{gen.prompt}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Created</p>
                                <p className="text-xs text-white">{formattedDate}</p>
                            </div>
                        </div>
                    </div>
                )}

                {(isCompleted || isFailed) && (
                    <div className="absolute top-3 right-3 flex gap-2 items-center z-40">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSaveClick}
                            className="rounded-sm bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Heart
                                className={`size-4 transition-all ${
                                    gen.isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"
                                }`}
                            />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleDeleteClick}
                            className="rounded-sm opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.generation._id === nextProps.generation._id &&
        prevProps.generation.isSaved === nextProps.generation.isSaved &&
        prevProps.generation.status === nextProps.generation.status &&
        prevProps.generation.resultImageUrl === nextProps.generation.resultImageUrl &&
        prevProps.isHovered === nextProps.isHovered
    );
});