import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface RecentItemProps {
  title: string;
  subtitle: string;
  time: string;
  status: string;
  statusColor: string;
  statusBg: string;
}

function RecentItem({ title, subtitle, time, status, statusColor, statusBg }: RecentItemProps) {
  return (
    <View style={styles.recentItem}>
      <View style={styles.recentItemLeft}>
        <Text style={styles.recentTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.recentSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      <View style={styles.recentItemRight}>
        <View style={[styles.recentBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.recentBadgeText, { color: statusColor }]}>{status}</Text>
        </View>
        <Text style={styles.recentTime}>{time}</Text>
      </View>
    </View>
  );
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { doctors, appointments } = useApp();

  const stats = useMemo(() => {
    const pending = appointments.filter((a) => a.status === 'Pending').length;
    const approved = appointments.filter((a) => a.status === 'Approved').length;
    const rejected = appointments.filter((a) => a.status === 'Rejected').length;
    return {
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      pending,
      approved,
      rejected,
    };
  }, [doctors, appointments]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [appointments]);

  const statusColorMap: Record<string, { color: string; bg: string }> = {
    Pending: { color: '#B8860B', bg: Colors.warningLight },
    Approved: { color: '#1B7A3D', bg: Colors.successLight },
    Rejected: { color: Colors.error, bg: Colors.errorLight },
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Admin Panel</Text>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="people"
          label="Total Doctors"
          value={stats.totalDoctors}
          color={Colors.primary}
          bgColor={Colors.primaryLight}
        />
        <StatCard
          icon="calendar"
          label="Appointments"
          value={stats.totalAppointments}
          color="#6C63FF"
          bgColor="#EEECFF"
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          icon="time"
          label="Pending"
          value={stats.pending}
          color="#B8860B"
          bgColor={Colors.warningLight}
        />
        <StatCard
          icon="checkmark-circle"
          label="Approved"
          value={stats.approved}
          color="#1B7A3D"
          bgColor={Colors.successLight}
        />
        <StatCard
          icon="close-circle"
          label="Rejected"
          value={stats.rejected}
          color={Colors.error}
          bgColor={Colors.errorLight}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/doctor-form')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Add Doctor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/appointments')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="clipboard-outline" size={22} color="#B8860B" />
            </View>
            <Text style={styles.actionText}>Manage Appts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/doctors')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="people-outline" size={22} color="#1B7A3D" />
            </View>
            <Text style={styles.actionText}>View Doctors</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Appointments</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/appointments')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentCard}>
          {recentAppointments.length === 0 ? (
            <Text style={styles.emptyText}>No appointments yet</Text>
          ) : (
            recentAppointments.map((apt, index) => {
              const doctor = doctors.find((d) => d.id === apt.doctorId);
              const sc = statusColorMap[apt.status] || { color: Colors.textLight, bg: Colors.inputBg };
              return (
                <React.Fragment key={apt.id}>
                  <RecentItem
                    title={apt.patientName}
                    subtitle={doctor?.name || 'Unknown Doctor'}
                    time={apt.date}
                    status={apt.status}
                    statusColor={sc.color}
                    statusBg={sc.bg}
                  />
                  {index < recentAppointments.length - 1 && <View style={styles.recentDivider} />}
                </React.Fragment>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
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
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  viewAllText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  recentItemLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  recentTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 14,
  },
  recentSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentItemRight: {
    alignItems: 'flex-end',
  },
  recentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  recentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  recentTime: {
    ...Typography.caption,
    color: Colors.textLight,
    fontSize: 11,
  },
  recentDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});
