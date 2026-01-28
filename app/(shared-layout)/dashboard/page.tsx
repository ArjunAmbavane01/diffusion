import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/auth-server"
import Dashboard from "@/components/web/dashboard/dashboard";

export default async function DashboardPage() {

    const session = await isAuthenticated();
    if (!session) redirect("/auth/login");

    return <Dashboard />
}
