import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { showImagePickerOptions, type UploadResult } from '@/services/imageUpload';
import { updateUserProfile } from '@/services/userService';

interface MenuItemProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  subtitle: string;
  onPress: () => void;
}

function MenuItem({ icon, iconColor, iconBg, label, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

export default function AdminProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, firebaseUser, logout, updateUser } = useApp();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string }>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of the admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handlePhotoUpload = () => {
    showImagePickerOptions(
      () => setIsUploadingPhoto(true),
      async (result: UploadResult) => {
        setProfileImage(result.url);
        setIsUploadingPhoto(false);
        // Save to Firestore
        if (firebaseUser) {
          try {
            await updateUserProfile(firebaseUser.uid, { photoURL: result.url });
          } catch (error) {
            console.error('Failed to save profile photo:', error);
          }
        }
      },
      (error: Error) => {
        setIsUploadingPhoto(false);
        if (error.message !== 'Image selection cancelled' && error.message !== 'Photo capture cancelled') {
          Alert.alert('Upload Failed', 'Failed to upload photo. Please try again.');
        }
      }
    );
  };

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditErrors({});
    setShowEditModal(true);
  };

  const validateEdit = (): boolean => {
    const errors: { name?: string; email?: string } = {};
    if (!editName.trim()) {
      errors.name = 'Name is required';
    }
    if (!editEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editEmail.trim())) {
      errors.email = 'Please enter a valid email';
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = () => {
    if (!validateEdit()) return;
    updateUser(editName.trim(), editEmail.trim().toLowerCase());
    setShowEditModal(false);
    Alert.alert('Success', 'Your personal info has been updated.');
  };

  const handleMenuPress = (item: string) => {
    if (item === 'edit') {
      openEditModal();
    } else {
      Alert.alert(item, 'This feature will be available soon.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>ADMIN PANEL</Text>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={handlePhotoUpload}
              disabled={isUploadingPhoto}
              activeOpacity={0.7}
            >
              {isUploadingPhoto ? (
                <ActivityIndicator size="large" color={Colors.surface} />
              ) : profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Text style={styles.avatarText}>
                  {user ? getInitials(user.name) : '?'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraBadge} onPress={handlePhotoUpload} disabled={isUploadingPhoto}>
              <Ionicons name="camera" size={12} color={Colors.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.name || 'Administrator'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-outline" size={12} color="#6C63FF" />
            <Text style={styles.roleBadgeText}>Administrator</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              iconColor={Colors.primary}
              iconBg={Colors.primaryLight}
              label="Edit Personal Info"
              subtitle="Update your name and email"
              onPress={() => handleMenuPress('edit')}
            />
          </View>
        </View>

        {/* Administration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="settings-outline"
              iconColor="#6C63FF"
              iconBg="#EEECFF"
              label="System Settings"
              subtitle="App configuration and preferences"
              onPress={() => handleMenuPress('System Settings')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="document-text-outline"
              iconColor="#FF9500"
              iconBg="#FFF3E0"
              label="Security Logs"
              subtitle="Review access and activity logs"
              onPress={() => handleMenuPress('Security Logs')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="people-circle-outline"
              iconColor="#34C759"
              iconBg="#E8F9EE"
              label="Account Management"
              subtitle="Manage user accounts and roles"
              onPress={() => handleMenuPress('Account Management')}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>WELLIO Admin v1.0.0</Text>
      </ScrollView>

      {/* Edit Personal Info Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Personal Info</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Preview */}
            <View style={styles.modalAvatarSection}>
              <View style={styles.modalAvatar}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.modalAvatarImage} contentFit="cover" />
                ) : (
                  <Text style={styles.modalAvatarText}>
                    {editName ? getInitials(editName) : '?'}
                  </Text>
                )}
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <View style={[styles.modalInputContainer, editErrors.name ? styles.modalInputError : null]}>
                <Ionicons name="person-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={(t) => {
                    setEditName(t);
                    if (editErrors.name) setEditErrors((e) => ({ ...e, name: undefined }));
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="words"
                />
              </View>
              {editErrors.name && <Text style={styles.modalErrorText}>{editErrors.name}</Text>}
            </View>

            {/* Email Input */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Email Address</Text>
              <View style={[styles.modalInputContainer, editErrors.email ? styles.modalInputError : null]}>
                <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.modalInput}
                  value={editEmail}
                  onChangeText={(t) => {
                    setEditEmail(t);
                    if (editErrors.email) setEditErrors((e) => ({ ...e, email: undefined }));
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {editErrors.email && <Text style={styles.modalErrorText}>{editErrors.email}</Text>}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
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

  // Profile Card
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.surface,
    letterSpacing: 1,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEECFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  roleBadgeText: {
    ...Typography.caption,
    color: '#6C63FF',
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },

  // Menu Card
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 72,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.15)',
  },
  logoutText: {
    ...Typography.bodyBold,
    color: Colors.error,
    fontSize: 16,
  },
  versionText: {
    ...Typography.caption,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  modalSaveText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  modalAvatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
  },
  modalAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.surface,
    letterSpacing: 1,
  },
  modalInputGroup: {
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: Spacing.sm,
  },
  modalInputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  modalErrorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
});
