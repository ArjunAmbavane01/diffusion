"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { authClient } from "@/lib/auth/auth-client";
import { signUpSchema } from "@/lib/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import z from "zod";
import { handleGoogleAuth } from "@/lib/auth/googleAuth";

export default function SignUpPage() {
  
  const [isAuthPending, startAuthTransition] = useTransition();
  const [isGoogleAuthPending, startGoogleAuthTransition] = useTransition();

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof signUpSchema>) => {
    startAuthTransition(async () => {
      await authClient.signUp.email({
        name: data.name,
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
        <CardTitle>Sign up</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
                  <Spinner /> Sign up
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </FieldGroup>
        </form>
        <div className="text-center mt-2">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link href={"/auth/login"} className="hover:underline">
            Log in
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
