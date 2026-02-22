import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
// @ts-ignore - getReactNativePersistence is available in the RN build but not in the web types
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyAW0f-_CUuhCZkgbfVogbaTXKCmpFJwZns',
  authDomain: 'wellio-tz.firebaseapp.com',
  projectId: 'wellio-tz',
  storageBucket: 'wellio-tz.firebasestorage.app',
  messagingSenderId: '136174505851',
  appId: '1:136174505851:web:c73c2ed00b15bbf08837de',
  measurementId: 'G-E4Z81D1XGL',
};

// Initialize Firebase (prevent re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence for React Native
function getFirebaseAuth(): Auth {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  // On native, try initializeAuth first; if already initialized, fall back to getAuth
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Auth was already initialized (e.g., during hot reload)
    return getAuth(app);
  }
}

const auth: Auth = getFirebaseAuth();

// Initialize Firestore
const db: Firestore = getFirestore(app);

export { app, auth, db };
export default app;
