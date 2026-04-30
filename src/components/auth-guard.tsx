
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
 * Simplificado para evitar bucles de redirección.
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
    // Si no hay usuario, enviar a login
    if (!isUserLoading && !user) {
      router.replace("/login");
      return;
    }

    // Una vez cargado el perfil, verificar el rol
    if (!isUserLoading && !isUserDataLoading && user && userData) {
      if (userData.role !== requiredRole) {
        // Si tiene el otro rol de staff, enviarlo a su panel correcto
        if (userData.role === "receptionist" || userData.role === "teens") {
          router.replace(userData.role === "receptionist" ? "/reception" : "/teens");
        } else {
          // Si no tiene rol de staff, fuera
          router.replace("/");
        }
      }
    } else if (!isUserLoading && !isUserDataLoading && user && !userData) {
      // Usuario autenticado pero sin perfil (error de registro)
      router.replace("/");
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router, requiredRole]);

  if (isUserLoading || isUserDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Solo renderizar si el rol coincide exactamente
  if (user && userData?.role === requiredRole) {
    return <>{children}</>;
  }

  return null;
}
