import { TransitionStartFunction } from "react";
import { toast } from "sonner";
import { authClient } from "./auth-client";

export const handleGoogleAuth = async (startGoogleAuthTransition: TransitionStartFunction) => {
    startGoogleAuthTransition(
        async () => {
            try {
                await new Promise(res => setTimeout(res, 5000));
                // await signInWithGoogle();

                const { data, error } = await authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/hub",
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
        }
    )
};