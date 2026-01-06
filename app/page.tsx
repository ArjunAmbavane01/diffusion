"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {

  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen max-w-7xl mx-auto w-full">
      Hey there
      <Button
        onClick={() => router.push("/dashboard")}
      >
        Get Started
      </Button>

    </div>
  );
}
