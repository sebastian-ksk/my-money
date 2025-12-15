import firebaseApp from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Lazy initialization for Firebase - only initializes on client side
let authInstance: firebaseApp.auth.Auth | null = null;
let firestoreInstance: firebaseApp.firestore.Firestore | null = null;
let isInitialized = false;

function initFirebase() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isInitialized) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    if (!firebaseApp.apps.length) {
      firebaseApp.initializeApp(firebaseConfig);
    }

    authInstance = firebaseApp.auth();
    // Firestore se conecta automáticamente a la base de datos default del proyecto
    firestoreInstance = firebaseApp.firestore();
    isInitialized = true;
  }
}

function getAuth(): firebaseApp.auth.Auth {
  initFirebase();
  if (!authInstance) {
    throw new Error(
      'Firebase Auth is not available. Make sure you are on the client side.'
    );
  }
  return authInstance;
}

function getFirestore(): firebaseApp.firestore.Firestore {
  initFirebase();
  if (!firestoreInstance) {
    throw new Error(
      'Firestore is not available. Make sure you are on the client side.'
    );
  }
  return firestoreInstance;
}

function getFirebase(): typeof firebaseApp {
  initFirebase();
  if (typeof window === 'undefined') {
    throw new Error(
      'Firebase is not available. Make sure you are on the client side.'
    );
  }
  return firebaseApp;
}

// Export with Proxies that bind methods correctly
export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_target, prop) {
    const instance = getAuth();
    const value = (instance as unknown as Record<string | symbol, unknown>)[
      prop
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export const firestore = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop) {
    const instance = getFirestore();
    const value = (instance as unknown as Record<string | symbol, unknown>)[
      prop
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export const firebase = new Proxy({} as ReturnType<typeof getFirebase>, {
  get(_target, prop) {
    const instance = getFirebase();
    const value = (instance as unknown as Record<string | symbol, unknown>)[
      prop
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export default firebase;
