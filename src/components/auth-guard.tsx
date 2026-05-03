
"use client";

import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole: "receptionist" | "teens";
}

/**
 * MODO ABIERTO: Este componente actúa como una pasarela simple.
 * Ignora el rol requerido y renderiza el contenido directamente para facilitar el desarrollo.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}
