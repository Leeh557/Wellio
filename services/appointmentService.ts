import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Appointment } from '@/constants/mockData';

const APPOINTMENTS_COLLECTION = 'appointments';

/**
 * Create a new appointment in Firestore
 * Returns the created appointment with its Firestore-generated ID
 */
export async function addAppointmentToFirestore(
  appointment: Omit<Appointment, 'id' | 'createdAt'>
): Promise<Appointment> {
  const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
    ...appointment,
    createdAt: serverTimestamp(),
  });

  return {
    ...appointment,
    id: docRef.id,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Update an appointment's status in Firestore
 */
export async function updateAppointmentStatusInFirestore(
  id: string,
  status: Appointment['status']
): Promise<void> {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an appointment from Firestore
 */
export async function deleteAppointmentFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Subscribe to ALL appointments in real-time (for admin)
 * Ordered by creation date (newest first)
 */
export function subscribeToAllAppointments(
  callback: (appointments: Appointment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const appointments: Appointment[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        doctorId: data.doctorId,
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        patientPhone: data.patientPhone,
        date: data.date,
        time: data.time,
        status: data.status,
        notes: data.notes,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Appointment;
    });
    callback(appointments);
  });
}

/**
 * Subscribe to appointments for a specific patient (by email)
 * Ordered by creation date (newest first)
 */
export function subscribeToUserAppointments(
  patientEmail: string,
  callback: (appointments: Appointment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('patientEmail', '==', patientEmail),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const appointments: Appointment[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        doctorId: data.doctorId,
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        patientPhone: data.patientPhone,
        date: data.date,
        time: data.time,
        status: data.status,
        notes: data.notes,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Appointment;
    });
    callback(appointments);
  });
}
