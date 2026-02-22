import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { getAllUsers, updateUserRole, type UserProfile } from '@/services/userService';

function UserCard({ user, onToggleRole }: { user: UserProfile; onToggleRole: () => void }) {
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = user.role === 'admin';

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.avatar, isAdmin && styles.avatarAdmin]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
        </View>
        <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
          <Ionicons
            name={isAdmin ? 'shield-checkmark' : 'person'}
            size={12}
            color={isAdmin ? '#6C63FF' : Colors.primary}
          />
          <Text style={[styles.roleBadgeText, isAdmin ? styles.roleBadgeTextAdmin : styles.roleBadgeTextUser]}>
            {isAdmin ? 'Admin' : 'User'}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.roleButton, isAdmin ? styles.demoteButton : styles.promoteButton]}
          onPress={onToggleRole}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isAdmin ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
            size={16}
            color={isAdmin ? Colors.error : '#6C63FF'}
          />
          <Text style={[styles.roleButtonText, isAdmin ? styles.demoteText : styles.promoteText]}>
            {isAdmin ? 'Demote to User' : 'Promote to Admin'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function UserManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promote' : 'demote';

    Alert.alert(
      `${action === 'promote' ? 'Promote' : 'Demote'} User`,
      `Are you sure you want to ${action} ${user.name} to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: action === 'demote' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await updateUserRole(user.uid, newRole);
              // Refresh the list
              await loadUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to update user role.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>ADMINISTRATION</Text>
          <Text style={styles.headerTitle}>User Accounts</Text>
        </View>
        <Text style={styles.countBadge}>{users.length}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <UserCard user={item} onToggleRole={() => handleToggleRole(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={48} color={Colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>No Users</Text>
              <Text style={styles.emptyText}>No registered users found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerCenter: {
    flex: 1,
  },
  headerLabel: {
    ...Typography.small,
    color: Colors.primary,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  countBadge: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarAdmin: {
    backgroundColor: '#6C63FF',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
  cardInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  roleBadgeAdmin: {
    backgroundColor: '#EEECFF',
  },
  roleBadgeUser: {
    backgroundColor: Colors.primaryLight,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roleBadgeTextAdmin: {
    color: '#6C63FF',
  },
  roleBadgeTextUser: {
    color: Colors.primary,
  },
  cardActions: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  promoteButton: {
    backgroundColor: '#EEECFF',
  },
  demoteButton: {
    backgroundColor: Colors.errorLight,
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  promoteText: {
    color: '#6C63FF',
  },
  demoteText: {
    color: Colors.error,
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
  },
});
