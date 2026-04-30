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

  const roleCollection = requiredRole === "receptionist" ? "roles_receptionist" : "roles_teens";
  
  const roleDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, roleCollection, user.uid);
  }, [firestore, user, roleCollection]);

  const { data: roleData, isLoading: isRoleLoading } = useDoc(roleDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!isUserLoading && user && !isRoleLoading && !roleData) {
      // User is logged in but doesn't have the required role marker
      router.push("/");
    }
  }, [user, isUserLoading, roleData, isRoleLoading, router]);

  if (isUserLoading || isRoleLoading) {
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
