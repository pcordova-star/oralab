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
 * Protege rutas de Staff verificando la autenticación y la existencia del rol en Firestore.
 * Evita bucles infinitos esperando a que los datos de rol estén completamente cargados.
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const roleCollection = requiredRole === "receptionist" ? "roles_receptionist" : "roles_teens";
  const roleDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, roleCollection, user.uid);
  }, [firestore, user, roleCollection]);

  const otherRoleCollection = requiredRole === "receptionist" ? "roles_teens" : "roles_receptionist";
  const otherRoleDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, otherRoleCollection, user.uid);
  }, [firestore, user, otherRoleCollection]);

  const { data: roleData, isLoading: isRoleLoading } = useDoc(roleDocRef);
  const { data: otherRoleData, isLoading: isOtherRoleLoading } = useDoc(otherRoleDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // IMPORTANTE: Solo actuar cuando la carga de datos haya finalizado completamente
    const allLoadingFinished = !isUserLoading && !isRoleLoading && !isOtherRoleLoading;
    
    if (allLoadingFinished && user) {
      if (!roleData) {
        if (otherRoleData) {
          // El usuario tiene el rol contrario, redirigir a su panel correcto
          const targetPath = requiredRole === "receptionist" ? "/teens" : "/reception";
          router.replace(targetPath);
        } else {
          // El usuario no tiene ningún rol de staff, enviarlo al home
          router.replace("/");
        }
      }
    }
  }, [user, isUserLoading, roleData, isRoleLoading, otherRoleData, isOtherRoleLoading, router, requiredRole]);

  if (isUserLoading || isRoleLoading || isOtherRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay usuario o no tiene el rol, no renderizar nada mientras ocurre la redirección del useEffect
  if (!user || !roleData) {
    return null;
  }

  return <>{children}</>;
}
