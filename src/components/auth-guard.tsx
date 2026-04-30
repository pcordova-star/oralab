
"use client";

import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { doc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole: "receptionist" | "teens";
}

/**
 * Protege las rutas de Staff verificando el perfil del usuario en Firestore.
 * Mejorado para prevenir bucles de redirección durante estados de carga.
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  useEffect(() => {
    // Si la autenticación terminó y no hay usuario, ir a login
    if (!isUserLoading && !user) {
      router.replace("/login");
      return;
    }

    // Una vez que tenemos los datos del perfil, verificamos el rol
    if (!isUserLoading && !isUserDataLoading && user) {
      if (userData) {
        if (userData.role !== requiredRole) {
          // Si tiene un rol de staff distinto, enviarlo a su panel correcto
          if (userData.role === "receptionist") {
            router.replace("/reception");
          } else if (userData.role === "teens") {
            router.replace("/teens");
          } else {
            router.replace("/");
          }
        }
      } else {
        // Usuario autenticado pero sin documento de perfil aún
        // Esperamos un momento o redirigimos si persiste el estado nulo
        const timeout = setTimeout(() => {
          if (!userData) router.replace("/");
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router, requiredRole]);

  // Pantalla de carga mientras se determina el estado
  if (isUserLoading || isUserDataLoading || (user && !userData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Verificando credenciales Oralab...</p>
        </div>
      </div>
    );
  }

  // Solo renderizar el contenido si el rol coincide
  if (user && userData?.role === requiredRole) {
    return <>{children}</>;
  }

  return null;
}
