import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { UserRole } from '@/constants/mockData';

/**
 * Firestore user document shape
 * Collection: "users"
 * Document ID: Firebase Auth UID
 */
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  photoURL?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
}

/**
 * Create a new user document in Firestore after registration
 */
export async function createUserProfile(
  uid: string,
  email: string,
  name: string,
  role: UserRole = 'user'
): Promise<UserProfile> {
  const userRef = doc(db, 'users', uid);
  const profile: UserProfile = {
    uid,
    email: email.toLowerCase(),
    name,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);
  return profile;
}

/**
 * Get a user profile from Firestore by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { uid: snapshot.id, ...snapshot.data() } as UserProfile;
}

/**
 * Update a user's profile fields
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'name' | 'email' | 'phone' | 'photoURL'>>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update a user's role (admin only operation)
 */
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get all registered users (admin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    uid: docSnap.id,
    ...docSnap.data(),
  })) as UserProfile[];
}
