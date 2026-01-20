import { Platform } from 'react-native';

// Android-specific text rendering improvements
const androidTextProps = Platform.OS === 'android' ? {
  includeFontPadding: false,
  textAlignVertical: 'center' as const,
  opacity: 1,
} : {};

export const typography = {
  // Font Families - Only set on iOS, let Android use system default
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : undefined,
    medium: Platform.OS === 'ios' ? 'System' : undefined,
    bold: Platform.OS === 'ios' ? 'System' : undefined,
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Text Styles
  styles: {
    h1: {
      fontSize: 36,
      fontWeight: Platform.OS === 'android' ? 'bold' : ('700' as const),
      lineHeight: 1.2,
      ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
      ...androidTextProps,
    },
    h2: {
      fontSize: 30,
      fontWeight: Platform.OS === 'android' ? 'bold' : ('700' as const),
      lineHeight: 1.2,
      ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
      ...androidTextProps,
    },
    h3: {
      fontSize: 24,
      fontWeight: Platform.OS === 'android' ? '600' : ('600' as const),
      lineHeight: 1.3,
      ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
      ...androidTextProps,
    },
    h4: {
      fontSize: 20,
      fontWeight: Platform.OS === 'android' ? '600' : ('600' as const),
      lineHeight: 1.4,
      ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
      ...androidTextProps,
    },
    body: {
      fontSize: 16,
      fontWeight: Platform.OS === 'android' ? 'normal' : ('400' as const),
      lineHeight: 1.5,
      ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
      ...androidTextProps,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: Platform.OS === 'android' ? 'normal' : ('400' as const),
      lineHeight: 1.5,
      ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
      ...androidTextProps,
    },
    caption: {
      fontSize: 12,
      fontWeight: Platform.OS === 'android' ? 'normal' : ('400' as const),
      lineHeight: 1.4,
      ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
      ...androidTextProps,
    },
    button: {
      fontSize: 16,
      fontWeight: Platform.OS === 'android' ? '600' : ('600' as const),
      lineHeight: 1.5,
      ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
      ...androidTextProps,
    },
  },
};

export type Typography = typeof typography;
