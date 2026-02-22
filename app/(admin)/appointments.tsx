import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import type { Appointment } from '@/constants/mockData';

const filterTabs = ['All', 'Pending', 'Approved', 'Rejected'] as const;

const statusStyles: Record<Appointment['status'], { bg: string; text: string; icon: string }> = {
  Pending: { bg: Colors.warningLight, text: '#B8860B', icon: 'time-outline' },
  Approved: { bg: Colors.successLight, text: '#1B7A3D', icon: 'checkmark-circle-outline' },
  Rejected: { bg: Colors.errorLight, text: Colors.error, icon: 'close-circle-outline' },
};

function AppointmentModerateCard({
  appointment,
  doctorName,
  onApprove,
  onReject,
}: {
  appointment: Appointment;
  doctorName: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  const status = statusStyles[appointment.status];

  return (
    <View style={styles.card}>
      {/* Status & Doctor */}
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon as keyof typeof Ionicons.glyphMap} size={14} color={status.text} />
          <Text style={[styles.statusText, { color: status.text }]}>{appointment.status}</Text>
        </View>
      </View>

      {/* Patient Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>Patient:</Text>
          <Text style={styles.infoValue}>{appointment.patientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="medical-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>Doctor:</Text>
          <Text style={styles.infoValue}>{doctorName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>{appointment.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>Time:</Text>
          <Text style={styles.infoValue}>{appointment.time}</Text>
        </View>
        {appointment.notes ? (
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Notes:</Text>
            <Text style={[styles.infoValue, { flex: 1 }]} numberOfLines={2}>{appointment.notes}</Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      {appointment.status === 'Pending' && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.approveButton} onPress={onApprove} activeOpacity={0.7}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.surface} />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function AppointmentModeration() {
  const insets = useSafeAreaInsets();
  const { appointments, doctors, updateAppointmentStatus } = useApp();
  const [activeFilter, setActiveFilter] = useState<(typeof filterTabs)[number]>('All');

  const filteredAppointments = useMemo(() => {
    const list = activeFilter === 'All'
      ? appointments
      : appointments.filter((a) => a.status === activeFilter);
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [appointments, activeFilter]);

  const tabCounts = useMemo(() => ({
    All: appointments.length,
    Pending: appointments.filter((a) => a.status === 'Pending').length,
    Approved: appointments.filter((a) => a.status === 'Approved').length,
    Rejected: appointments.filter((a) => a.status === 'Rejected').length,
  }), [appointments]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>MODERATE</Text>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        {filterTabs.map((tab) => {
          const isActive = tab === activeFilter;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
              <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                  {tabCounts[tab]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const doctor = doctors.find((d) => d.id === item.doctorId);
          return (
            <AppointmentModerateCard
              appointment={item}
              doctorName={doctor?.name || 'Unknown Doctor'}
              onApprove={() => updateAppointmentStatus(item.id, 'Approved')}
              onReject={() => updateAppointmentStatus(item.id, 'Rejected')}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="clipboard-outline" size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No Appointments</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'All'
                ? 'No appointments have been made yet'
                : `No ${activeFilter.toLowerCase()} appointments`}
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
    paddingBottom: Spacing.sm,
  },
  headerLabel: {
    ...Typography.small,
    color: Colors.primary,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    gap: 4,
    ...Shadows.sm,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.surface,
  },
  tabCount: {
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  tabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabCountTextActive: {
    color: Colors.surface,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 55,
  },
  infoValue: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: 11,
    gap: 6,
  },
  approveButtonText: {
    ...Typography.bodyBold,
    color: Colors.surface,
    fontSize: 14,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    paddingVertical: 11,
    gap: 6,
  },
  rejectButtonText: {
    ...Typography.bodyBold,
    color: Colors.error,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyIcon: {
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
  },
});
