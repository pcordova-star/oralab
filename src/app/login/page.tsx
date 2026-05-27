
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar, Logo } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail, ArrowRight, Activity, UserPlus } from "lucide-react";

const ADMIN_EMAIL = "admin@oralab.cl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user && user.email === ADMIN_EMAIL) {
      router.push("/reception");
    }
  }, [user, isUserLoading, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;

    if (email !== ADMIN_EMAIL) {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "Solo cuentas administrativas pueden acceder a este panel.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Bienvenido",
        description: "Acceso concedido al panel de recepción.",
      });
      router.push("/reception");
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        toast({
          variant: "destructive",
          title: "Error de acceso",
          description: "Credenciales inválidas. Si es tu primera vez, usa el botón de crear cuenta abajo.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Ocurrió un error al intentar iniciar sesión.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateAdmin() {
    if (!auth || email !== ADMIN_EMAIL) return;
    
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Cuenta Creada",
        description: "Se ha creado la cuenta administrativa exitosamente.",
      });
      router.push("/reception");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al crear cuenta",
        description: error.message || "No se pudo crear la cuenta inicial.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-primary/10">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto scale-125">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Acceso Personal</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para gestionar las reservas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="correo@oralab.cl"
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    className="pl-10 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold rounded-xl" 
                  disabled={isLoading}
                >
                  {isLoading ? "Validando..." : "Entrar al Sistema"}
                  {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>

                {email === ADMIN_EMAIL && (
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-10 text-sm font-medium rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/5"
                    onClick={handleCreateAdmin}
                    disabled={isLoading || password.length < 6}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    ¿Primer acceso? Crear cuenta Admin
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
