import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { loginSchema, signUpSchema } from "@/lib/schemas/auth.schema";
import z from "zod";

export const useAuth = () => {

    const [isAuthPending, startAuthTransition] = useTransition();
    const [isGoogleAuthPending, startGoogleAuthTransition] = useTransition();

    const router = useRouter();

    const handleLogin = (data: z.infer<typeof loginSchema>) => {
        startAuthTransition(async () => {
            await authClient.signIn.email({
                email: data.email,
                password: data.password,
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/");
                    },
                    onError: (err) => {
                        toast.error(err.error.message);
                    },
                },
            });
        });
    }

    const handleSignUp = (data: z.infer<typeof signUpSchema>) => {
        startAuthTransition(async () => {
            await authClient.signUp.email({
                name: data.name,
                email: data.email,
                password: data.password,
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/");
                    },
                    onError: (err) => {
                        toast.error(err.error.message);
                    },
                },
            });
        });
    }

    const signInWithGoogle = () => {
        startGoogleAuthTransition(async () => {
            try {
                await authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                    fetchOptions: {
                        onSuccess: () => {
                            router.push("/");
                        },
                        onError: (err) => {
                            toast.error(err.error.message);
                        },
                    },
                });
            } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Something went wrong")
            }
        })
    }

    return {
        isAuthPending,
        startAuthTransition,
        isGoogleAuthPending,
        startGoogleAuthTransition,
        handleLogin,
        handleSignUp,
        signInWithGoogle
    }

}