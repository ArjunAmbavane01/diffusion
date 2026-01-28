import { Suspense } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import UserMenu from "./user-menu";
import UserMenuSkeleton from "./user-menu-skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className='flex place-items-center fixed top-0 inset-x-0 w-full h-16 px-5 bg-sidebar/80 backdrop-blur-md border-b z-50'>
      <div className='flex justify-between items-center size-full max-w-7xl mx-auto'>
        <div className="flex items-center gap-3">
          <h3 className="text-xl mr-8"><span className="text-primary">D</span>iffusion</h3>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "text-base font-normal")}>
            Studio
          </Link>
          <Link
            href="/saved"
            className={cn(buttonVariants({ variant: "ghost" }), "text-base font-normal")}
          >
            Saved
          </Link>
        </div>
        <div className='flex items-center gap-2 h-full'>
          <div className='flex items-center gap-3'>
            <ModeToggle />
          </div>
          <div className='h-[50%] w-px rounded-full bg-muted' />
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </nav>
  )
}
