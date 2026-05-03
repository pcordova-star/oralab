
"use client";

import Link from "next/link";
import { Activity } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">
                Oralab<span className="text-secondary">Flow</span>
              </span>
            </Link>
          </div>
          
          <div className="text-sm font-medium text-muted-foreground italic">
            Salud Digestiva Avanzada
          </div>
        </div>
      </div>
    </nav>
  );
}
