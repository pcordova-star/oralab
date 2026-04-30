'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Client-side Firebase provider.
 * Always renders the provider to ensure hooks work during SSR.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const services = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services?.firebaseApp}
      auth={services?.auth}
      firestore={services?.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}