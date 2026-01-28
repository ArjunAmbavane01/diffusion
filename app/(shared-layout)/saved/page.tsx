import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/auth-server"
import SavedGallery from "@/components/web/saved/saved-gallery";

export default async function SavedGalleryPage() {

    const session = await isAuthenticated();
    if (!session) redirect("/auth/login");

    return <SavedGallery />
}
