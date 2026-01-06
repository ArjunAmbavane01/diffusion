import { isAuthenticated } from "@/lib/auth/auth-server"
import { redirect } from "next/navigation";

export default async function DashboardPage() {

    const session = await isAuthenticated();
    if (!session) redirect("/auth/login");

    return (
        <div>
            User Dashboard
        </div>
    )
}
