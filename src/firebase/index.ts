
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, getFirestore as getFirestoreStandard } from 'firebase/firestore'

// Global variables to hold instances across HMR cycles
let firebaseApp: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

/**
 * Robustly initializes Firebase services.
 * Implements a strict singleton pattern to avoid "INTERNAL ASSERTION FAILED"
 * during Next.js Hot Module Replacement (HMR).
 */
export function initializeFirebase() {
  // Initialize App (Works on both client and server)
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  // Initialize Auth (Client-side mostly, but safe on server)
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }

  // Initialize Firestore
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
      // Server-side initialization
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
