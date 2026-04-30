
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

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Verificamos el rol requerido para esta página
  const roleCollection = requiredRole === "receptionist" ? "roles_receptionist" : "roles_teens";
  const roleDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, roleCollection, user.uid);
  }, [firestore, user, roleCollection]);

  // También verificamos el rol contrario para evitar bucles de redirección
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
    // Si ya terminó de cargar todo y el usuario no tiene el rol de esta página
    if (!isUserLoading && user && !isRoleLoading && !isOtherRoleLoading && !roleData) {
      if (otherRoleData) {
        // Si tiene el OTRO rol de staff, enviarlo a su panel correcto en lugar de al home
        const targetPath = requiredRole === "receptionist" ? "/teens" : "/reception";
        router.replace(targetPath);
      } else {
        // Si no tiene ningún rol de staff, enviarlo al home
        router.replace("/");
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

  if (!user || !roleData) {
    return null;
  }

  return <>{children}</>;
}
