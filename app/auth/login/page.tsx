"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/auth-client";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { handleGoogleAuth } from "@/lib/auth/googleAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import z from "zod";

export default function LoginPage() {

  const [isAuthPending, startAuthTransition] = useTransition();
  const [isGoogleAuthPending, startGoogleAuthTransition] = useTransition();

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    startAuthTransition(async () => {
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
        fetchOptions: {
          onSuccess: () => {
            form.reset();
            router.push("/");
          },
          onError: (err) => {
            toast.error(err.error.message);
          },
        },
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="john@doe.com"
                    type="email"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="*****"
                    type="password"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button disabled={isAuthPending}>
              {isAuthPending ? (
                <>
                  <Spinner /> Continue
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </FieldGroup>
        </form>
        <div className="text-center mt-2">
          <span className="text-muted-foreground">
            New to Diffusion?{" "}
          </span>
          <Link href={"/auth/sign-up"} className="hover:underline">
            Sign up
          </Link>
        </div>
        <div className="flex flex-col gap-3 w-full my-3">
          <Separator className="my-2 relative">
            <h6 className="text-muted-foreground bg-card px-3 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
              OR
            </h6>
          </Separator>
          <Button
            onClick={()=>handleGoogleAuth(startGoogleAuthTransition)}
            variant={"outline"}
            size={"lg"}
            disabled={isGoogleAuthPending}
            className="w-full"
          >
            <Image src={"/logos/google-logo.svg"} alt={"Google logo"} width={20} height={20} className="size-4 mr-1" />
            {isGoogleAuthPending ? <Spinner /> : "Google"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
