import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import {
  type User,
  type Doctor,
  type Appointment,
  type UserRole,
  initialDoctors,
  initialAppointments,
} from '@/constants/mockData';

interface AppState {
  user: User | null;
  doctors: Doctor[];
  appointments: Appointment[];
  isLoading: boolean;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_DOCTOR'; payload: Doctor }
  | { type: 'UPDATE_DOCTOR'; payload: Doctor }
  | { type: 'DELETE_DOCTOR'; payload: string }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT_STATUS'; payload: { id: string; status: Appointment['status'] } };

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  updateDoctor: (doctor: Doctor) => void;
  deleteDoctor: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  getDoctorById: (id: string) => Doctor | undefined;
  getAppointmentsByUser: (email: string) => Appointment[];
  getAppointmentsByStatus: (status: string) => Appointment[];
}

const initialState: AppState = {
  user: null,
  doctors: initialDoctors,
  appointments: initialAppointments,
  isLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
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
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [...state.appointments, action.payload],
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

  const login = useCallback((email: string, _password: string): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !_password) return false;

    let role: UserRole = 'user';
    let name = 'Patient';

    if (trimmedEmail === 'admin@test.com') {
      role = 'admin';
      name = 'Admin';
    } else if (trimmedEmail === 'user@test.com') {
      role = 'user';
      name = 'John Doe';
    } else {
      role = 'user';
      name = trimmedEmail.split('@')[0];
    }

    dispatch({
      type: 'LOGIN',
      payload: { email: trimmedEmail, role, name },
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const addDoctor = useCallback((doctor: Omit<Doctor, 'id'>) => {
    const newDoctor: Doctor = {
      ...doctor,
      id: `doc-${Date.now()}`,
    };
    dispatch({ type: 'ADD_DOCTOR', payload: newDoctor });
  }, []);

  const updateDoctor = useCallback((doctor: Doctor) => {
    dispatch({ type: 'UPDATE_DOCTOR', payload: doctor });
  }, []);

  const deleteDoctor = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DOCTOR', payload: id });
  }, []);

  const addAppointment = useCallback(
    (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
      const newAppointment: Appointment = {
        ...appointment,
        id: `apt-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
    },
    []
  );

  const updateAppointmentStatus = useCallback(
    (id: string, status: Appointment['status']) => {
      dispatch({ type: 'UPDATE_APPOINTMENT_STATUS', payload: { id, status } });
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
        logout,
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
