import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const getUserDetails = query({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        return {
            name: user?.name,
            email: user?.email,
            image: user?.image,
        };
    }
})