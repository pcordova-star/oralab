
"use client";

import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole: "receptionist" | "teens";
}

/**
 * MODO DESARROLLO: Pasarela que permite el acceso sin verificación de rol.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}
