import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso restringido",
  robots: { index: false, follow: false, nocache: true },
};

export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
