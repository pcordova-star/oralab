
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function Logo() {
  return (
    <div className="flex items-center gap-2 group">
      <div className="relative flex items-center justify-center w-10 h-10">
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
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const isAdminPage = pathname?.startsWith('/reception') || pathname?.startsWith('/admin');

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Sesión cerrada",
        description: "Has salido del panel administrativo correctamente.",
      });
      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión.",
      });
    }
  };

  // HEADER SIMPLIFICADO PARA ADMIN
  if (isAdminPage) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/reception">
              <Logo />
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full border border-primary/5">
                Panel Administrativo
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-full h-10 px-4 border border-red-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // HEADER PÚBLICO ESTÁNDAR
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2 lg:gap-6 mr-2">
              <Link href="/home-test">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm font-black text-secondary hover:text-primary uppercase tracking-widest border border-secondary/20 rounded-full px-4">
                  Mi Test (En Casa)
                </Button>
              </Link>
              <Link href="/agreements">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm font-black text-primary hover:text-secondary uppercase tracking-widest">
                  Convenios
                </Button>
              </Link>
              <Link href="/sunvou">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary">
                  Tecnología Sunvou
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm font-bold text-muted-foreground hover:text-primary">
                  Cómo funciona
                </Button>
              </Link>
            </div>
            <Link href="/booking">
              <Button size="sm" className="rounded-full font-bold shadow-sm bg-primary hover:bg-primary/90 text-xs md:text-sm">
                Agendar Examen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
