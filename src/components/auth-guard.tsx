
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
 * El correo control@pcgoperacion.com tiene bypass total.
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const isSuperAdmin = user?.email === "control@pcgoperacion.com";

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

    // Si es Super Admin, saltamos las verificaciones de rol
    if (!isUserLoading && user && isSuperAdmin) {
      return;
    }

    // Una vez que tenemos los datos del perfil, verificamos el rol para staff normal
    if (!isUserLoading && !isUserDataLoading && user && !isSuperAdmin) {
      if (userData) {
        if (userData.role !== requiredRole) {
          if (userData.role === "receptionist") {
            router.replace("/reception");
          } else if (userData.role === "teens") {
            router.replace("/teens");
          } else {
            router.replace("/");
          }
        }
      } else {
        // Documento no encontrado o carga lenta: dar un margen de espera antes de redirigir
        const timeout = setTimeout(() => {
          if (!userData && !isUserDataLoading) {
            router.replace("/");
          }
        }, 5000);
        return () => clearTimeout(timeout);
      }
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router, requiredRole, isSuperAdmin]);

  // Pantalla de carga mientras se determina el estado
  if (isUserLoading || (user && !isSuperAdmin && isUserDataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Verificando acceso administrativo...</p>
        </div>
      </div>
    );
  }

  // Renderizar si es super admin o el rol coincide
  if (user && (isSuperAdmin || userData?.role === requiredRole)) {
    return <>{children}</>;
  }

  return null;
}
