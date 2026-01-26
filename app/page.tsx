"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {

  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <div className="flex justify-center items-center h-screen w-full relative overflow-hidden bg-white">

      {/* Gradient BG  */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #ec4899 100%)`,
          backgroundSize: "100% 100%",
        }}
      />

      <div className="flex flex-col items-center gap-8 z-50 px-4 w-full">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-serif text-7xl md:text-9xl font-medium text-black tracking-tight">
            Diffusion
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl text-center">
            Draw, prompt, and generate AI art in seconds.
          </p>
        </div>
        <Button
          variant={"default"}
          size={"lg"}
          className="px-8 py-5 text-base relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            animation: "fadeInUp 0.8s ease-out 0.4s backwards"
          }}
          onClick={() => router.push("/dashboard")}
        >
          <div
            className={`absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-900 ${isHovered ? 'translate-x-full' : ''
              }`}
            style={{
              transform: isHovered ? 'translateX(80%)' : 'translateX(-80%)'
            }}
          />

          <span className="relative flex items-center gap-2">
            Get Started
            <ArrowRight
              className={`transition-transform duration-300 ${isHovered ? 'translate-x-2' : 'translate-x-0'
                }`}
              size={20}
            />
          </span>
        </Button>
      </div>
    </div>
  );
}
