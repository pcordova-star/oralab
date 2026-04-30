"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"receptionist" | "teens">("receptionist");
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1. Crear perfil de usuario
      const userRef = doc(db, "users", user.uid);
      const userData = {
        id: user.uid,
        email: user.email,
        fullName: fullName,
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDoc(userRef, userData).catch((err) => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: userRef.path,
          operation: "create",
          requestResourceData: userData
        }));
      });

      // 2. Crear marcador de rol para seguridad (RBAC)
      const roleCollection = role === "receptionist" ? "roles_receptionist" : "roles_teens";
      const roleRef = doc(db, roleCollection, user.uid);
      
      setDoc(roleRef, { active: true }).catch((err) => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: roleRef.path,
          operation: "create",
          requestResourceData: { active: true }
        }));
      });

      toast({
        title: "Cuenta creada",
        description: `Bienvenido(a), ${fullName}. Has sido registrado como ${role === 'receptionist' ? 'Recepcionista' : 'TEENS'}.`,
      });

      router.push(role === "receptionist" ? "/reception" : "/teens");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: error.message || "No se pudo crear la cuenta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <Card className="max-w-md w-full rounded-3xl shadow-xl border-none">
          <CardHeader className="space-y-1 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Registro de Staff</CardTitle>
            <CardDescription>
              Crea tu cuenta de funcionario para acceder a la gestión clínica.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input 
                  id="fullName" 
                  placeholder="Ej: Juan Pérez" 
                  required 
                  className="rounded-xl h-12"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Institucional</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nombre@oralab.cl" 
                  required 
                  className="rounded-xl h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <Label>Rol en el Laboratorio</Label>
                <RadioGroup 
                  value={role} 
                  onValueChange={(v: any) => setRole(v)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="receptionist" id="role-receptionist" className="peer sr-only" />
                    <Label
                      htmlFor="role-receptionist"
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all cursor-pointer text-center"
                    >
                      <span className="font-bold">Recepcionista</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="teens" id="role-teens" className="peer sr-only" />
                    <Label
                      htmlFor="role-teens"
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all cursor-pointer text-center"
                    >
                      <span className="font-bold">TEENS</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-lg font-semibold mt-6" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                Registrarse
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Link href="/login" className="text-primary font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
