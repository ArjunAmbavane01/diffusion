"use client"

import { promptSchema } from '@/lib/schemas/prompt.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { z } from "zod";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Button } from '@/components/ui/button';
import { Eraser, Pen, Redo, Send, Trash2, Undo } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

export default function GenerationPanel() {

    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const canvasRef = useRef<ReactSketchCanvasRef>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const generateUploadUrl = useMutation(api.generations.generateImageUploadUrl);
    const createGeneration = useMutation(api.generations.createGeneration);

    const form = useForm<z.infer<typeof promptSchema>>({
        resolver: zodResolver(promptSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            prompt: ""
        },
    })

    const onSubmit = async (formData: z.infer<typeof promptSchema>) => {
        if (!canvasRef.current) return;
        setIsGenerating(true);
        try {
            const canvasDataUrl = await canvasRef.current.exportImage('jpeg');
            const imageUploadUrl = await generateUploadUrl();
            const imageBlob = await fetch(canvasDataUrl).then(r => r.blob());

            const uploadRes = await fetch(imageUploadUrl, {
                method: "POST",
                body: imageBlob
            });

            if (!uploadRes.ok) throw new Error("Image upload failed. Please try again");

            const { storageId } = await uploadRes.json() as { storageId: Id<"_storage"> };

            await createGeneration({
                prompt: formData.prompt,
                canvasImageStorageId: storageId,
            });
            toast.success("Image generation started!");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Some unexpected error occured. Please try again"
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    }

    const handleUndo = () => canvasRef.current?.undo();

    const handleRedo = () => canvasRef.current?.redo();

    const handleClearCanvas = () => canvasRef.current?.clearCanvas();

    const toggleEraser = () => {
        setIsErasing(!isErasing);
        if (!isErasing) canvasRef.current?.eraseMode(true);
        else canvasRef.current?.eraseMode(false);
    };

    return (
        <div className="col-span-1 flex flex-col gap-8 justify-center items-center h-full">
            <div className='w-full relative h-80'>
                {!mounted ? (
                    <Skeleton className="size-full" />
                ) : (
                    <>
                        <ReactSketchCanvas
                            ref={canvasRef}
                            strokeWidth={4}
                            strokeColor={resolvedTheme === 'dark' ? '#e8e8e8' : '#000000'}
                            canvasColor={resolvedTheme === 'dark' ? '#121212' : '#f1f5f9'}
                            className='relative overflow-hidden border-border!'
                        />
                        <div className='flex items-center gap-2 absolute top-3 right-3'>
                            <Button
                                type="button"
                                variant={isErasing ? "default" : "outline"}
                                size="icon-sm"
                                onClick={toggleEraser}
                            >
                                {isErasing ? <Pen /> : <Eraser />}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={handleUndo}
                            >
                                <Undo />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={handleRedo}
                            >
                                <Redo />
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                onClick={handleClearCanvas}
                            >
                                <Trash2 />
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <Card className="w-full border-l">
                <CardContent>
                    <form id='prompt-form' onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="prompt"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="prompt" className='text-sm mb-1'>
                                            Describe what you want to generate
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            id="prompt"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter your prompt"
                                            autoComplete="off"
                                            rows={3}
                                            className="resize-none h-20 overflow-y-auto"
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (e.target.value.length >= 3) {
                                                    form.clearErrors("prompt");
                                                }
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button
                        size={"lg"}
                        type="submit"
                        form="prompt-form"
                        disabled={isGenerating}
                        className='flex-1'
                    >
                        {isGenerating ? (
                            <>
                                <Spinner />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Send />
                                Generate
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
