"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { doc } from "firebase/firestore";

/**
 * Componente que redirige a los usuarios Staff fuera de las páginas públicas
 * hacia sus respectivos dashboards de gestión.
 */
export function StaffRedirect() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  // Referencias a los marcadores de rol
  const receptionistRef = useMemoFirebase(() => 
    (user && db) ? doc(db, "roles_receptionist", user.uid) : null
  , [db, user]);
  
  const teensRef = useMemoFirebase(() => 
    (user && db) ? doc(db, "roles_teens", user.uid) : null
  , [db, user]);

  const { data: isReceptionist, isLoading: loadingRec } = useDoc(receptionistRef);
  const { data: isTeens, isLoading: loadingTeens } = useDoc(teensRef);

  useEffect(() => {
    if (user && !isUserLoading && !loadingRec && !loadingTeens) {
      if (isReceptionist) {
        router.replace("/reception");
      } else if (isTeens) {
        router.replace("/teens");
      }
    }
  }, [user, isUserLoading, isReceptionist, isTeens, loadingRec, loadingTeens, router]);

  return null;
}
