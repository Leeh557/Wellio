import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import type { Appointment } from '@/constants/mockData';

const statusColors: Record<Appointment['status'], { bg: string; text: string; icon: string }> = {
  Pending: { bg: Colors.warningLight, text: '#B8860B', icon: 'time-outline' },
  Approved: { bg: Colors.successLight, text: '#1B7A3D', icon: 'checkmark-circle-outline' },
  Rejected: { bg: Colors.errorLight, text: Colors.error, icon: 'close-circle-outline' },
};

function AppointmentCard({ appointment, doctorName, doctorImage, doctorSpecialty }: {
  appointment: Appointment;
  doctorName: string;
  doctorImage: string;
  doctorSpecialty: string;
}) {
  const status = statusColors[appointment.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Image source={{ uri: doctorImage }} style={styles.doctorImage} contentFit="cover" />
        <View style={styles.cardInfo}>
          <Text style={styles.doctorName} numberOfLines={1}>{doctorName}</Text>
          <Text style={styles.specialty}>{doctorSpecialty}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon as keyof typeof Ionicons.glyphMap} size={14} color={status.text} />
          <Text style={[styles.statusText, { color: status.text }]}>{appointment.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{appointment.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{appointment.time}</Text>
        </View>
      </View>

      {appointment.notes ? (
        <View style={styles.notesContainer}>
          <Ionicons name="document-text-outline" size={14} color={Colors.textLight} />
          <Text style={styles.notesText} numberOfLines={2}>{appointment.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function MyAppointments() {
  const insets = useSafeAreaInsets();
  const { user, appointments, getDoctorById } = useApp();

  const userAppointments = useMemo(() => {
    if (!user) return [];
    return appointments
      .filter((a) => a.patientEmail === user.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, user]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>{userAppointments.length} appointment{userAppointments.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={userAppointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const doctor = getDoctorById(item.doctorId);
          return (
            <AppointmentCard
              appointment={item}
              doctorName={doctor?.name || 'Unknown Doctor'}
              doctorImage={doctor?.image || ''}
              doctorSpecialty={doctor?.specialty || ''}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No Appointments Yet</Text>
            <Text style={styles.emptyText}>
              Book your first appointment from the Home tab
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  doctorName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
  },
  specialty: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  cardBottom: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    gap: 6,
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  notesText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 6,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
