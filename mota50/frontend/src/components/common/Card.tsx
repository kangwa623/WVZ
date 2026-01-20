import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors, spacing } from '@/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 4,
}) => {
  const cardStyles = [
    styles.card,
    styles[`card_${variant}`],
    { padding: spacing[padding] },
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  card_default: {
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: colors.base.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  card_elevated: {
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    } : {
      shadowColor: colors.base.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  card_outlined: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});

export default Card;
