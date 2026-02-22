export const Colors = {
  primary: '#4A90D9',
  primaryDark: '#3A7BC8',
  primaryLight: '#E8F4FD',
  primaryGradientStart: '#5B9FE6',
  primaryGradientEnd: '#3A7BC8',
  background: '#F5F8FC',
  surface: '#FFFFFF',
  text: '#1A2B4A',
  textSecondary: '#6B7C93',
  textLight: '#9BA8B7',
  border: '#E2E8F0',
  inputBg: '#F0F4F8',
  success: '#34C759',
  successLight: '#E8F9EE',
  warning: '#FFB800',
  warningLight: '#FFF8E1',
  error: '#FF3B30',
  errorLight: '#FFE8E7',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '500' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
};

export const Shadows = {
  sm: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};
