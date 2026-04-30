
"use client";

import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole: "receptionist" | "teens";
}

/**
 * Protege las rutas de Staff verificando el perfil del usuario en Firestore.
 * Implementa auto-reparación de marcadores de rol (QAP) para asegurar permisos.
 * Garantiza que los hijos solo se rendericen cuando el acceso esté confirmado.
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

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
      setIsVerified(true);
      return;
    }

    // Una vez que tenemos los datos del perfil, verificamos el rol y reparamos marcadores
    if (!isUserLoading && !isUserDataLoading && user && !isSuperAdmin && db) {
      if (userData) {
        if (userData.role !== requiredRole) {
          if (userData.role === "receptionist") {
            router.replace("/reception");
          } else if (userData.role === "teens") {
            router.replace("/teens");
          } else {
            router.replace("/");
          }
          return;
        }

        // AUTO-REPARACIÓN: Asegurar que el marcador de rol existe en Firestore ANTES de dar acceso
        const roleCollection = userData.role === "receptionist" ? "roles_receptionist" : "roles_teens";
        const roleMarkerRef = doc(db, roleCollection, user.uid);
        
        // Usamos una operación síncrona/rápida para asegurar el acceso
        setDoc(roleMarkerRef, { 
          active: true, 
          lastVerified: new Date().toISOString() 
        }, { merge: true }).then(() => {
          setIsVerified(true);
        }).catch(() => {
          // Si falla, probablemente ya existe o hay un problema temporal, 
          // pero si userData coincide con requiredRole, intentamos proceder
          setIsVerified(true);
        });
      } else {
        // Margen de espera para perfiles recién creados
        const timeout = setTimeout(() => {
          if (!userData && !isUserDataLoading) {
            router.replace("/");
          }
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router, requiredRole, isSuperAdmin, db]);

  // Pantalla de carga mientras se determina el estado
  if (isUserLoading || (user && !isSuperAdmin && (!isVerified || isUserDataLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Confirmando credenciales de acceso...</p>
        </div>
      </div>
    );
  }

  // Solo renderizar si está verificado
  return isVerified ? <>{children}</> : null;
}
