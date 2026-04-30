"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { doc } from "firebase/firestore";

/**
 * Redirige al personal fuera de páginas públicas hacia sus dashboards.
 * El correo control@pcgoperacion.com es redirigido a recepción por defecto.
 */
export function StaffRedirect() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const isSuperAdmin = user?.email === "control@pcgoperacion.com";

  const userDocRef = useMemoFirebase(() => 
    (user && db) ? doc(db, "users", user.uid) : null
  , [db, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (user && !isUserLoading) {
      if (isSuperAdmin) {
        // Super Admin siempre tiene acceso a dashboards, lo enviamos a recepción
        router.replace("/reception");
        return;
      }

      if (!isUserDataLoading && userData) {
        if (userData.role === "receptionist") {
          router.replace("/reception");
        } else if (userData.role === "teens") {
          router.replace("/teens");
        }
      }
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router, isSuperAdmin]);

  return null;
}