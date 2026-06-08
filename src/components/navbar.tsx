
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <div className="flex items-center gap-2 group">
      <div className="relative flex items-center justify-center w-10 h-10">
        {/* Isotipo único: Una 'O' que representa aire/flujo y ciencia */}
        <svg 
          viewBox="0 0 40 40" 
          className="w-full h-full transform group-hover:rotate-12 transition-transform duration-300"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="18" className="stroke-primary" strokeWidth="4" />
          <path 
            d="M10 20C10 14.4772 14.4772 10 20 10V10C25.5228 10 30 14.4772 30 20C30 25.5228 25.5228 30 20 30" 
            className="stroke-secondary" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          <path 
            d="M15 20H25M20 15V25" 
            className="stroke-primary" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black text-primary tracking-tighter italic leading-none">
          Oralab
        </span>
        <span className="text-[8px] font-bold text-secondary uppercase tracking-[0.2em]">
          Breath Diagnostics
        </span>
      </div>
    </div>
  );
}

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6 mr-6">
              <Link href="/sunvou" className="text-sm font-black text-primary hover:text-secondary uppercase tracking-widest transition-colors">
                Tecnología Sunvou
              </Link>
              <Link href="/how-it-works" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                Cómo funciona
              </Link>
            </div>
            <Link href="/booking">
              <Button variant="primary" size="sm" className="rounded-full font-bold shadow-sm">
                Agendar Examen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
