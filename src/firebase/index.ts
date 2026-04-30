
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore'

// Caché para las instancias de los servicios
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

/**
 * Inicializa los servicios de Firebase de forma robusta.
 * Configura Firestore para usar long-polling si es necesario, 
 * evitando errores de aserción interna en entornos de proxy.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }

  if (!firestoreInstance) {
    // initializeFirestore nos permite configurar opciones experimentales de conexión
    // que resuelven los "INTERNAL ASSERTION FAILED" en entornos de Cloud Workstation.
    firestoreInstance = initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
    });
  }

  return {
    firebaseApp,
    auth: authInstance,
    firestore: firestoreInstance
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
