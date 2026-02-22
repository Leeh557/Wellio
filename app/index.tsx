import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

export default function SplashScreen() {
  const { user, authInitialized } = useApp();
  const [animationDone, setAnimationDone] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setAnimationDone(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  // Wait for both the splash animation and Firebase auth to initialize
  const isReady = animationDone && authInitialized;

  if (isReady) {
    if (user) {
      return <Redirect href={user.role === 'admin' ? '/(admin)' : '/(user)'} />;
    }
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require('@/assets/images/wellio-icon.png')}
          style={styles.logoImage}
          contentFit="contain"
        />
        <Text style={styles.title}>WELLIO</Text>
        <Text style={styles.subtitle}>Your Health, Our Priority</Text>
      </Animated.View>
      <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
