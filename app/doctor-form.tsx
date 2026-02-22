import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

const defaultImages = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
];

export default function DoctorFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getDoctorById, addDoctor, updateDoctor } = useApp();

  const isEdit = !!id;
  const existingDoctor = id ? getDoctorById(id) : undefined;

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingDoctor) {
      setName(existingDoctor.name);
      setSpecialty(existingDoctor.specialty);
      setBio(existingDoctor.bio);
      setExperience(String(existingDoctor.experience));
      setLocation(existingDoctor.location);
      setImage(existingDoctor.image);
    }
  }, [existingDoctor]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!specialty.trim()) newErrors.specialty = 'Specialty is required';
    if (!bio.trim()) newErrors.bio = 'Bio is required';
    if (!experience.trim()) newErrors.experience = 'Experience is required';
    else if (isNaN(Number(experience))) newErrors.experience = 'Must be a number';
    if (!location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const doctorImage = image.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];

    if (isEdit && existingDoctor) {
      updateDoctor({
        ...existingDoctor,
        name: name.trim(),
        specialty: specialty.trim(),
        bio: bio.trim(),
        experience: Number(experience),
        location: location.trim(),
        image: doctorImage,
      });
      Alert.alert('Success', 'Doctor updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      addDoctor({
        name: name.trim(),
        specialty: specialty.trim(),
        bio: bio.trim(),
        experience: Number(experience),
        location: location.trim(),
        image: doctorImage,
        rating: 4.5,
        patients: 0,
        available: true,
      });
      Alert.alert('Success', 'Doctor added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    icon: string,
    options?: {
      placeholder?: string;
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric';
      error?: string;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          options?.multiline && styles.textAreaContainer,
          options?.error ? styles.inputError : null,
        ]}
      >
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={Colors.textLight}
          style={options?.multiline ? { marginTop: 2 } : undefined}
        />
        <TextInput
          style={[styles.input, options?.multiline && styles.textArea]}
          placeholder={options?.placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor={Colors.textLight}
          value={value}
          onChangeText={(t) => {
            onChange(t);
            if (options?.error) {
              setErrors((e) => {
                const copy = { ...e };
                delete copy[label.toLowerCase().replace(/\s/g, '')];
                return copy;
              });
            }
          }}
          multiline={options?.multiline}
          numberOfLines={options?.multiline ? 4 : 1}
          textAlignVertical={options?.multiline ? 'top' : 'center'}
          keyboardType={options?.keyboardType}
        />
      </View>
      {options?.error ? <Text style={styles.errorText}>{options.error}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Doctor' : 'Add Doctor'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Icon */}
        <View style={styles.iconSection}>
          <View style={styles.formIcon}>
            <Ionicons name={isEdit ? 'create' : 'person-add'} size={32} color={Colors.primary} />
          </View>
          <Text style={styles.iconLabel}>
            {isEdit ? 'Update doctor details' : 'Fill in the doctor\'s information'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {renderInput('Name', name, setName, 'person-outline', {
            placeholder: 'Dr. Full Name',
            error: errors.name,
          })}
          {renderInput('Specialty', specialty, setSpecialty, 'medical-outline', {
            placeholder: 'e.g. Cardiologist',
            error: errors.specialty,
          })}
          {renderInput('Experience', experience, setExperience, 'time-outline', {
            placeholder: 'Years of experience',
            keyboardType: 'numeric',
            error: errors.experience,
          })}
          {renderInput('Location', location, setLocation, 'location-outline', {
            placeholder: 'Clinic name, City',
            error: errors.location,
          })}
          {renderInput('Bio', bio, setBio, 'document-text-outline', {
            placeholder: 'Write a brief biography...',
            multiline: true,
            error: errors.bio,
          })}
          {renderInput('Image URL', image, setImage, 'image-outline', {
            placeholder: 'Optional - leave blank for default',
          })}
        </View>
      </ScrollView>

      {/* Fixed Submit Button */}
      <View style={[styles.submitContainer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity style={styles.submitButton} activeOpacity={0.8} onPress={handleSubmit}>
          <Ionicons name={isEdit ? 'save' : 'add-circle'} size={22} color={Colors.surface} />
          <Text style={styles.submitButtonText}>
            {isEdit ? 'Update Doctor' : 'Add Doctor'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  formIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  textAreaContainer: {
    height: 110,
    alignItems: 'flex-start',
    paddingTop: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 54,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.surface,
  },
});
