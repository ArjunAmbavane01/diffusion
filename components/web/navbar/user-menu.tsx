import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/kbd";
import { UserCircle2 } from "lucide-react";
import { fetchAuthQuery } from "@/lib/auth/auth-server";
import { api } from "@/convex/_generated/api";
import LogoutBtn from "../buttons/logout-btn";

export default async function UserMenu() {
    
    const user = await fetchAuthQuery(api.user.getUserDetails);
    if(!user) throw new Error("User not found");

    const userInitials = user.name?.split(" ").map(w => w[0]).join("").slice(0, 2);
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-2 px-3 text-sm hover:bg-accent/30 transition cursor-pointer">
                    <div className="flex justify-center items-center size-7 rounded-full overflow-hidden">
                        {
                            user.image ?
                                <Image src={user.image} alt="User image" width={40} height={40} className="size-full" />
                                :
                                <Avatar className="size-full rounded-full">
                                    <AvatarImage src={user.image ?? undefined} alt="User image" />
                                    <AvatarFallback>{userInitials}</AvatarFallback>
                                </Avatar>
                        }
                    </div>
                    {user.name}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuItem className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <UserCircle2 className="size-4" />
                        Profile
                    </div>
                    <div className="flex items-center gap-1">
                        <Kbd>⌘</Kbd><Kbd>P</Kbd>
                    </div>
                </DropdownMenuItem>
                <LogoutBtn />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
