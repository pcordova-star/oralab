
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, getFirestore as getFirestoreStandard } from 'firebase/firestore'

// Variables globales para persistir instancias
let firebaseApp: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

/**
 * Inicialización robusta de Firebase para Oralab.
 * Removido 'use client' para permitir ejecución segura en Server Actions (IA).
 */
export function initializeFirebase() {
  // Inicializar App
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  // Inicializar Auth
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }

  // Inicializar Firestore
  if (!firestoreInstance) {
    if (typeof window !== 'undefined') {
      try {
        firestoreInstance = initializeFirestore(firebaseApp, {
          experimentalAutoDetectLongPolling: true,
        });
      } catch (e) {
        firestoreInstance = getFirestoreStandard(firebaseApp);
      }
    } else {
      firestoreInstance = getFirestoreStandard(firebaseApp);
    }
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
