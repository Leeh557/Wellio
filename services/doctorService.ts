import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Doctor } from '@/constants/mockData';

const DOCTORS_COLLECTION = 'doctors';

/**
 * Firestore doctor document shape (extends the app Doctor type)
 */
export interface FirestoreDoctor extends Doctor {
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Add a new doctor to Firestore
 * Returns the created doctor with its Firestore-generated ID
 */
export async function addDoctorToFirestore(
  doctor: Omit<Doctor, 'id'>
): Promise<Doctor> {
  const docRef = await addDoc(collection(db, DOCTORS_COLLECTION), {
    ...doctor,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    ...doctor,
    id: docRef.id,
  };
}

/**
 * Update an existing doctor in Firestore
 */
export async function updateDoctorInFirestore(doctor: Doctor): Promise<void> {
  const { id, ...data } = doctor;
  const docRef = doc(db, DOCTORS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a doctor from Firestore
 */
export async function deleteDoctorFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, DOCTORS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Get a single doctor by ID
 */
export async function getDoctorFromFirestore(id: string): Promise<Doctor | null> {
  const docRef = doc(db, DOCTORS_COLLECTION, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Doctor;
}

/**
 * Get all doctors (one-time fetch)
 */
export async function getAllDoctorsFromFirestore(): Promise<Doctor[]> {
  const q = query(collection(db, DOCTORS_COLLECTION), orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Doctor[];
}

/**
 * Subscribe to real-time doctor list updates
 * Returns an unsubscribe function
 */
export function subscribeToDoctors(
  callback: (doctors: Doctor[]) => void
): Unsubscribe {
  const q = query(collection(db, DOCTORS_COLLECTION), orderBy('name'));

  return onSnapshot(q, (snapshot) => {
    const doctors: Doctor[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Doctor[];
    callback(doctors);
  });
}
