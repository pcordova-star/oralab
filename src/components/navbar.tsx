
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, Calendar, Users, Home, LogOut, LogIn } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.replace("/");
    }
  };

  // En modo abierto, todos los ítems de navegación están siempre visibles
  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/booking", label: "Agenda", icon: Calendar },
    { href: "/reception", label: "Recepción", icon: Users },
    { href: "/teens", label: "TEENS", icon: Activity },
  ];

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
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-green-600 uppercase">Acceso Libre</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-red-50 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login Staff
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
