import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary.main} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  message: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[4],
  },
});

export default LoadingSpinner;
