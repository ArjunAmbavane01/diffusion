"use client"

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner';
import { LogOut } from 'lucide-react';

export default function LogoutBtn() {
    const { isLoggingOut, handleLogout } = useAuth();
    return (
        <Button
            onClick={handleLogout}
            variant={"ghost"}
            className="flex items-center justify-start gap-2 w-full hover:text-destructive">
            <LogOut className="size-4 group-hover:text-destructive" />
            {isLoggingOut ? <Spinner /> : "Log out"}
        </Button>
    )
}
