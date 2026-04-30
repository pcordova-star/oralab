"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { initiateEmailSignIn } from "@/firebase/non-blocking-login";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Activity, LogIn, UserPlus, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const auth = useAuth();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function handleRedirect() {
      if (user && db) {
        setIsPending(true);
        
        // Caso especial: Super Admin
        if (user.email === "control@pcgoperacion.com") {
          toast({
            title: "Acceso Administrador",
            description: "Bienvenido al centro de control global de OralabFlow.",
          });
          router.replace("/reception");
          return;
        }

        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const role = userData.role;
            
            toast({
              title: "Sesión iniciada",
              description: `Bienvenido(a), ${userData.fullName || 'Usuario'}.`,
            });
            
            if (role === "receptionist") {
              router.replace("/reception");
            } else if (role === "teens") {
              router.replace("/teens");
            } else {
              router.replace("/");
            }
          } else {
            // Si el documento no existe pero el mail no es admin, algo salió mal
            setIsPending(false);
          }
        } catch (error) {
          console.error("Error al obtener el rol:", error);
          setIsPending(false);
        }
      }
    }

    handleRedirect();
  }, [user, db, router, toast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setIsPending(true);
    initiateEmailSignIn(auth, email, password);
    
    setTimeout(() => {
      if (!user) {
        setIsPending(false);
      }
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-none">
          <CardHeader className="space-y-1 text-center pt-10">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Bienvenido Staff</CardTitle>
            <CardDescription>
              Ingresa tus credenciales de funcionario Oralab.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nombre@oralab.cl" 
                  required 
                  className="rounded-xl h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="rounded-xl h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-lg font-semibold mt-4" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                {isPending ? "Verificando..." : "Iniciar Sesión"}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t text-center space-y-3">
              <p className="text-sm text-muted-foreground">¿Eres un funcionario nuevo?</p>
              <Button variant="outline" className="w-full h-11 rounded-xl" asChild disabled={isPending}>
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" /> Crear cuenta de Staff
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}