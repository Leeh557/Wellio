export type UserRole = 'user' | 'admin';

export interface User {
  email: string;
  role: UserRole;
  name: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  bio: string;
  experience: number;
  rating: number;
  patients: number;
  location: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  createdAt: string;
}

export const initialDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating cardiovascular diseases. She specializes in preventive cardiology and heart failure management, utilizing the latest diagnostic tools and evidence-based treatments.',
    experience: 15,
    rating: 4.9,
    patients: 2340,
    location: 'Heart Care Center, New York',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Neurologist',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Dr. Michael Chen is a renowned neurologist specializing in neurodegenerative diseases and stroke management. With a decade of research experience at Johns Hopkins, he brings cutting-edge treatment approaches to patient care.',
    experience: 12,
    rating: 4.8,
    patients: 1890,
    location: 'Neuro Wellness Clinic, Boston',
    available: true,
  },
  {
    id: '3',
    name: 'Dr. Emily Williams',
    specialty: 'Dermatologist',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Dr. Emily Williams is a leading dermatologist known for her expertise in cosmetic and medical dermatology. She has published numerous papers on skin cancer prevention and innovative treatment methods for chronic skin conditions.',
    experience: 10,
    rating: 4.7,
    patients: 3120,
    location: 'Skin Health Institute, Los Angeles',
    available: true,
  },
  {
    id: '4',
    name: 'Dr. James Brown',
    specialty: 'Orthopedic Surgeon',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    bio: 'Dr. James Brown is an experienced orthopedic surgeon specializing in sports medicine and joint replacement. He has worked with professional athletes and is recognized for his minimally invasive surgical techniques.',
    experience: 18,
    rating: 4.9,
    patients: 2780,
    location: 'Sports Medicine Center, Chicago',
    available: true,
  },
  {
    id: '5',
    name: 'Dr. Lisa Anderson',
    specialty: 'Pediatrician',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    bio: 'Dr. Lisa Anderson is a compassionate pediatrician dedicated to providing comprehensive healthcare for children from birth through adolescence. She focuses on developmental milestones and preventive care strategies.',
    experience: 8,
    rating: 4.8,
    patients: 4200,
    location: 'Children\'s Wellness Center, San Francisco',
    available: true,
  },
  {
    id: '6',
    name: 'Dr. Robert Taylor',
    specialty: 'Ophthalmologist',
    image: 'https://randomuser.me/api/portraits/men/36.jpg',
    bio: 'Dr. Robert Taylor is a skilled ophthalmologist with expertise in cataract surgery, glaucoma treatment, and LASIK procedures. He is committed to preserving and improving his patients\' vision using state-of-the-art technology.',
    experience: 14,
    rating: 4.6,
    patients: 1950,
    location: 'Vision Care Center, Seattle',
    available: true,
  },
];

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    doctorId: '1',
    patientName: 'John Doe',
    patientEmail: 'user@test.com',
    patientPhone: '+1 555-0101',
    date: '2025-02-15',
    time: '10:00 AM',
    status: 'Approved',
    notes: 'Regular heart checkup',
    createdAt: '2025-02-10T09:00:00Z',
  },
  {
    id: 'apt-2',
    doctorId: '3',
    patientName: 'John Doe',
    patientEmail: 'user@test.com',
    patientPhone: '+1 555-0101',
    date: '2025-02-20',
    time: '2:30 PM',
    status: 'Pending',
    notes: 'Skin rash consultation',
    createdAt: '2025-02-12T14:00:00Z',
  },
  {
    id: 'apt-3',
    doctorId: '2',
    patientName: 'Jane Smith',
    patientEmail: 'jane@test.com',
    patientPhone: '+1 555-0202',
    date: '2025-02-18',
    time: '11:00 AM',
    status: 'Pending',
    notes: 'Recurring headaches',
    createdAt: '2025-02-11T11:00:00Z',
  },
];
