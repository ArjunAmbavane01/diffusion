import { Suspense } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import UserMenu from "./user-menu";
import UserMenuSkeleton from "./user-menu-skeleton";

export default function Navbar() {
  return (
    <nav className='flex place-items-center fixed top-0 inset-x-0 w-full h-16 px-5 bg-sidebar/80 backdrop-blur-md border-b z-50'>
      <div className='flex justify-between items-center size-full max-w-7xl mx-auto'>
        <h3 className="text-xl"><span className="text-primary">D</span>iffusion</h3>
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
