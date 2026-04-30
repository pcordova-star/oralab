
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Inicializa los servicios de Firebase.
 * En desarrollo y en el entorno de Studio, preferimos usar la configuración explícita.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      // Intentamos inicializar con la config explícita primero para asegurar conectividad en desarrollo
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      // Fallback a inicialización automática si falla la anterior (útil en producción App Hosting)
      firebaseApp = initializeApp();
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
