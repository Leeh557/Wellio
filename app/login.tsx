import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, register, isLoading } = useApp();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    let result: { success: boolean; error?: string; role?: string };

    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(email, password, name);
    }

    if (result.success) {
      if (result.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(user)');
      }
    } else {
      Alert.alert('Error', result.error ?? 'Something went wrong. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Reset Password', 'Please enter your email address first, then tap "Forgot Password".');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    // Import resetPassword from services/auth for direct use
    import('@/services/auth').then(({ resetPassword }) => {
      resetPassword(email.trim())
        .then(() => {
          Alert.alert(
            'Password Reset',
            'A password reset email has been sent. Please check your inbox.'
          );
        })
        .catch(() => {
          Alert.alert('Error', 'Failed to send reset email. Please try again.');
        });
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/wellio-icon.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
          <Text style={styles.brandName}>WELLIO</Text>
          <Text style={styles.tagline}>
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isLogin ? 'Sign In' : 'Create Account'}</Text>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputContainer, errors.name ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textLight}
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
                  }}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
              <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textLight}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.surface} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.surface} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchTextBold}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hint */}
        <View style={styles.hintContainer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textLight} />
          <Text style={styles.hintText}>
            Register with <Text style={styles.hintBold}>admin@test.com</Text> for Admin access
            {'\n'}or any other email for Patient access
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  cardTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
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
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  forgotText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 52,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...Typography.bodyBold,
    color: Colors.surface,
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textLight,
    marginHorizontal: Spacing.md,
  },
  switchButton: {
    alignItems: 'center',
  },
  switchText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  switchTextBold: {
    color: Colors.primary,
    fontWeight: '600',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: 6,
    paddingHorizontal: Spacing.md,
  },
  hintText: {
    ...Typography.caption,
    color: Colors.textLight,
    textAlign: 'center',
  },
  hintBold: {
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
