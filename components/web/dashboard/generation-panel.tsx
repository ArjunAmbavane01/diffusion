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
import { Eraser, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';

export default function GenerationPanel() {

    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const generateUploadUrl = useMutation(api.generations.generateImageUploadUrl);
    const createGeneration = useMutation(api.generations.createGeneration);

    const form = useForm<z.infer<typeof promptSchema>>({
        resolver: zodResolver(promptSchema),
        defaultValues: {
            prompt: ""
        },
    })

    const onSubmit = async (formData: z.infer<typeof promptSchema>) => {
        if (!canvasRef.current) return;
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

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Some unexpected error occured. Please try again"
            toast.error(errorMessage);
        }
    }

    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    return (
        <div className="col-span-1 flex flex-col gap-8 justify-center items-center h-full">
            {mounted && (
                <ReactSketchCanvas
                    ref={canvasRef}
                    style={{
                        border: '0.0625rem solid #9c9c9c',
                        borderRadius: '0.25rem',
                        overflow: 'hidden',
                    }}
                    strokeWidth={4}
                    strokeColor={resolvedTheme === 'dark' ? '#e8e8e8' : '#000000'}
                    canvasColor={resolvedTheme === 'dark' ? '#121212' : '#f1f5f9'}
                    className='w-full h-80!'
                />
            )}
            <Card className="w-full">
                <CardContent>
                    <form id='prompt-form' onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="prompt"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="prompt" className='text-sm'>
                                            Prompt
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            id="prompt"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter your prompt"
                                            autoComplete="off"
                                            rows={3}
                                            className="resize-none h-18 overflow-y-auto"
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
                    <Field orientation="horizontal">
                        <Button size={"lg"} type="button" variant="outline" onClick={() => form.reset()}>
                            <Eraser />
                            Clear
                        </Button>
                        <Button size={"lg"} type="submit" form="prompt-form" className='flex-1'>
                            <Send />
                            Generate Image
                        </Button>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    )
}
