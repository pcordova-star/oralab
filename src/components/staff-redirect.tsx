
"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { doc } from "firebase/firestore";

/**
 * Redirige al personal fuera de páginas públicas hacia sus dashboards.
 * Utiliza el campo 'role' del documento de usuario para máxima fiabilidad.
 */
export function StaffRedirect() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => 
    (user && db) ? doc(db, "users", user.uid) : null
  , [db, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (user && !isUserLoading && !isUserDataLoading && userData) {
      if (userData.role === "receptionist") {
        router.replace("/reception");
      } else if (userData.role === "teens") {
        router.replace("/teens");
      }
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router]);

  return null;
}
