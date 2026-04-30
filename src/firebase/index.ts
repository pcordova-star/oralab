
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore'

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
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null } as any;
  }

  // 1. Initialize App
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  // 2. Initialize Auth
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }

  // 3. Initialize Firestore with specific settings for Cloud IDEs
  if (!firestoreInstance) {
    try {
      firestoreInstance = initializeFirestore(firebaseApp, {
        experimentalAutoDetectLongPolling: true,
      });
    } catch (e) {
      // If already initialized, fallback to getFirestore
      firestoreInstance = getFirestore(firebaseApp);
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
