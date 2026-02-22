import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import type { Doctor } from '@/constants/mockData';

const specialtyIcons: Record<string, string> = {
  Cardiologist: 'heart',
  Neurologist: 'pulse',
  Dermatologist: 'leaf',
  'Orthopedic Surgeon': 'fitness',
  Pediatrician: 'happy',
  Ophthalmologist: 'eye',
};

function DoctorCard({ doctor, onPress }: { doctor: Doctor; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.doctorCard} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: doctor.image }} style={styles.doctorImage} contentFit="cover" />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName} numberOfLines={1}>
          {doctor.name}
        </Text>
        <View style={styles.specialtyRow}>
          <Ionicons
            name={(specialtyIcons[doctor.specialty] || 'medical') as keyof typeof Ionicons.glyphMap}
            size={14}
            color={Colors.primary}
          />
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
        </View>
        <View style={styles.doctorMeta}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
          <Text style={styles.experienceText}>{doctor.experience} yrs exp</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

export default function UserDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, doctors } = useApp();
  const [search, setSearch] = useState('');

  const filteredDoctors = useMemo(() => {
    if (!search.trim()) return doctors;
    const term = search.toLowerCase();
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.specialty.toLowerCase().includes(term)
    );
  }, [doctors, search]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{greeting} 👋</Text>
                <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
              </View>
              <TouchableOpacity style={styles.notifButton}>
                <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={Colors.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search doctors or specialties..."
                placeholderTextColor={Colors.textLight}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Quick Access Banner */}
            <View style={styles.banner}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Book Your Next{'\n'}Appointment</Text>
                <Text style={styles.bannerSubtitle}>
                  Find specialists and book instantly
                </Text>
              </View>
              <View style={styles.bannerIcon}>
                <Ionicons name="medical" size={40} color="rgba(255,255,255,0.9)" />
              </View>
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Doctors</Text>
              <Text style={styles.sectionCount}>{filteredDoctors.length} found</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => router.push(`/doctor/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No doctors found</Text>
            <Text style={styles.emptyText}>Try adjusting your search criteria</Text>
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
  listContent: {
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
  greeting: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.surface,
    marginBottom: 6,
    lineHeight: 26,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  bannerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  sectionCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  doctorName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
    marginBottom: 2,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  doctorSpecialty: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8860B',
  },
  experienceText: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
