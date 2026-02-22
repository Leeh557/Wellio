import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  type User,
  type Doctor,
  type Appointment,
  type UserRole,
} from '@/constants/mockData';
import {
  loginUser,
  registerUser,
  logoutUser,
  subscribeToAuthChanges,
  getAuthErrorMessage,
  type FirebaseUser,
} from '@/services/auth';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from '@/services/userService';
import {
  addDoctorToFirestore,
  updateDoctorInFirestore,
  deleteDoctorFromFirestore,
  subscribeToDoctors,
} from '@/services/doctorService';
import {
  addAppointmentToFirestore,
  updateAppointmentStatusInFirestore,
  subscribeToAllAppointments,
  subscribeToUserAppointments,
} from '@/services/appointmentService';

// Admin emails — users registering with these emails get the 'admin' role
const ADMIN_EMAILS = ['admin@test.com'];

interface AppState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  doctors: Doctor[];
  appointments: Appointment[];
  isLoading: boolean;
  authInitialized: boolean;
}

type AppAction =
  | { type: 'SET_AUTH_USER'; payload: { user: User | null; firebaseUser: FirebaseUser | null } }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_INITIALIZED'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: { name: string; email: string } }
  | { type: 'SET_DOCTORS'; payload: Doctor[] }
  | { type: 'ADD_DOCTOR'; payload: Doctor }
  | { type: 'UPDATE_DOCTOR'; payload: Doctor }
  | { type: 'DELETE_DOCTOR'; payload: string }
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT_STATUS'; payload: { id: string; status: Appointment['status'] } };

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => Promise<void>;
  updateUser: (name: string, email: string) => void;
  addDoctor: (doctor: Omit<Doctor, 'id'>) => Promise<void>;
  updateDoctor: (doctor: Doctor) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  getDoctorById: (id: string) => Doctor | undefined;
  getAppointmentsByUser: (email: string) => Appointment[];
  getAppointmentsByStatus: (status: string) => Appointment[];
}

const initialState: AppState = {
  user: null,
  firebaseUser: null,
  doctors: [],
  appointments: [],
  isLoading: false,
  authInitialized: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTH_USER':
      return {
        ...state,
        firebaseUser: action.payload.firebaseUser,
        user: action.payload.user,
        authInitialized: true,
      };
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, firebaseUser: null, appointments: [] };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user
          ? { ...state.user, name: action.payload.name, email: action.payload.email }
          : null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH_INITIALIZED':
      return { ...state, authInitialized: action.payload };
    case 'SET_DOCTORS':
      return { ...state, doctors: action.payload };
    case 'ADD_DOCTOR':
      return { ...state, doctors: [...state.doctors, action.payload] };
    case 'UPDATE_DOCTOR':
      return {
        ...state,
        doctors: state.doctors.map((d) =>
          d.id === action.payload.id ? action.payload : d
        ),
      };
    case 'DELETE_DOCTOR':
      return {
        ...state,
        doctors: state.doctors.filter((d) => d.id !== action.payload),
      };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
      };
    case 'UPDATE_APPOINTMENT_STATUS':
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.payload.id
            ? { ...a, status: action.payload.status }
            : a
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Listen to Firebase auth state changes and fetch user profile from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            const user: User = {
              email: profile.email,
              role: profile.role,
              name: profile.name,
            };
            dispatch({
              type: 'SET_AUTH_USER',
              payload: { user, firebaseUser },
            });
          } else {
            const email = firebaseUser.email ?? '';
            const role: UserRole = ADMIN_EMAILS.includes(email.toLowerCase())
              ? 'admin'
              : 'user';
            const name = firebaseUser.displayName ?? email.split('@')[0] ?? 'User';
            await createUserProfile(firebaseUser.uid, email, name, role);
            dispatch({
              type: 'SET_AUTH_USER',
              payload: {
                user: { email, role, name },
                firebaseUser,
              },
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          const email = firebaseUser.email ?? '';
          const role: UserRole = ADMIN_EMAILS.includes(email.toLowerCase())
            ? 'admin'
            : 'user';
          const name = firebaseUser.displayName ?? email.split('@')[0] ?? 'User';
          dispatch({
            type: 'SET_AUTH_USER',
            payload: {
              user: { email, role, name },
              firebaseUser,
            },
          });
        }
      } else {
        dispatch({
          type: 'SET_AUTH_USER',
          payload: { user: null, firebaseUser: null },
        });
      }
    });
    return unsubscribe;
  }, []);

  // Subscribe to real-time doctor list from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToDoctors((doctors) => {
      dispatch({ type: 'SET_DOCTORS', payload: doctors });
    });
    return unsubscribe;
  }, []);

  // Subscribe to real-time appointments from Firestore
  // Admin sees all appointments; users see only their own
  useEffect(() => {
    if (!state.user || !state.authInitialized) return;

    let unsubscribe: (() => void) | undefined;

    if (state.user.role === 'admin') {
      unsubscribe = subscribeToAllAppointments((appointments) => {
        dispatch({ type: 'SET_APPOINTMENTS', payload: appointments });
      });
    } else {
      unsubscribe = subscribeToUserAppointments(state.user.email, (appointments) => {
        dispatch({ type: 'SET_APPOINTMENTS', payload: appointments });
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [state.user?.email, state.user?.role, state.authInitialized]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const fbUser = await loginUser(email.trim(), password);

        // Immediately fetch the user profile from Firestore to get the role
        const profile = await getUserProfile(fbUser.uid);
        let role: UserRole = 'user';
        let userName = email.trim().split('@')[0];

        if (profile) {
          role = profile.role;
          userName = profile.name;
        } else {
          // Fallback: determine role from admin emails list
          role = ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? 'admin' : 'user';
        }

        // Dispatch the user immediately so the app state is correct before redirect
        dispatch({
          type: 'SET_AUTH_USER',
          payload: {
            user: { email: email.trim().toLowerCase(), role, name: userName },
            firebaseUser: fbUser,
          },
        });

        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, role };
      } catch (error: any) {
        dispatch({ type: 'SET_LOADING', payload: false });
        const errorMessage = getAuthErrorMessage(error.code);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        const role: UserRole = ADMIN_EMAILS.includes(trimmedEmail) ? 'admin' : 'user';

        const fbUser = await registerUser(trimmedEmail, password, trimmedName);
        await createUserProfile(fbUser.uid, trimmedEmail, trimmedName, role);

        // Dispatch the user immediately so the app state is correct before redirect
        dispatch({
          type: 'SET_AUTH_USER',
          payload: {
            user: { email: trimmedEmail, role, name: trimmedName },
            firebaseUser: fbUser,
          },
        });

        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, role };
      } catch (error: any) {
        dispatch({ type: 'SET_LOADING', payload: false });
        const errorMessage = getAuthErrorMessage(error.code);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await logoutUser();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateUser = useCallback(
    (name: string, email: string) => {
      dispatch({ type: 'UPDATE_USER', payload: { name, email } });
      if (state.firebaseUser) {
        updateUserProfile(state.firebaseUser.uid, { name, email }).catch((err) =>
          console.error('Failed to update user profile in Firestore:', err)
        );
      }
    },
    [state.firebaseUser]
  );

  const addDoctor = useCallback(async (doctor: Omit<Doctor, 'id'>) => {
    try {
      await addDoctorToFirestore(doctor);
    } catch (error) {
      console.error('Failed to add doctor:', error);
      throw error;
    }
  }, []);

  const updateDoctor = useCallback(async (doctor: Doctor) => {
    try {
      await updateDoctorInFirestore(doctor);
    } catch (error) {
      console.error('Failed to update doctor:', error);
      throw error;
    }
  }, []);

  const deleteDoctor = useCallback(async (id: string) => {
    try {
      await deleteDoctorFromFirestore(id);
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      throw error;
    }
  }, []);

  const addAppointment = useCallback(
    async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
      try {
        // Save to Firestore — the real-time listener will update local state
        await addAppointmentToFirestore(appointment);
      } catch (error) {
        console.error('Failed to add appointment:', error);
        throw error;
      }
    },
    []
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: Appointment['status']) => {
      try {
        // Update in Firestore — the real-time listener will update local state
        await updateAppointmentStatusInFirestore(id, status);
      } catch (error) {
        console.error('Failed to update appointment status:', error);
        throw error;
      }
    },
    []
  );

  const getDoctorById = useCallback(
    (id: string) => state.doctors.find((d) => d.id === id),
    [state.doctors]
  );

  const getAppointmentsByUser = useCallback(
    (email: string) =>
      state.appointments.filter((a) => a.patientEmail === email),
    [state.appointments]
  );

  const getAppointmentsByStatus = useCallback(
    (status: string) => {
      if (status === 'All') return state.appointments;
      return state.appointments.filter((a) => a.status === status);
    },
    [state.appointments]
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addAppointment,
        updateAppointmentStatus,
        getDoctorById,
        getAppointmentsByUser,
        getAppointmentsByStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
