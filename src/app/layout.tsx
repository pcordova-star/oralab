import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { WhatsAppFAB } from '@/components/whatsapp-fab';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Oralab | Test de aire espirado SIBO e intolerancias en Chile',
    template: '%s',
  },
  description: 'Test de aire espirado para SIBO, IMO e intolerancias a lactosa y fructosa. Medición de hidrógeno y metano, con opción de realizar el test a domicilio.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: SITE_URL,
    siteName: 'Oralab',
    title: 'Oralab | Test de aire espirado SIBO e intolerancias',
    description: 'Estudia SIBO, IMO e intolerancias con un test de aire espirado simple y no invasivo. Opción a domicilio.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <FirebaseClientProvider>
          {children}
          <Toaster />
          <WhatsAppFAB />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
