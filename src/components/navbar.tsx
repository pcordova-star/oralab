"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, Calendar, Users, Home, Settings } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Web", icon: Home },
    { href: "/booking", label: "Agenda Online", icon: Calendar },
    { href: "/reception", label: "Recepción", icon: Users },
    { href: "/teens", label: "Panel TEENS", icon: Activity },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">
              Oralab<span className="text-secondary">Flow</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:bg-muted rounded-full">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}