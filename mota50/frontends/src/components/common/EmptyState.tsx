import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import Icon from './Icon';

interface EmptyStateProps {
  icon: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
}) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size="xlarge" color="textTertiary" />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {action && <View style={styles.action}>{action}</View>}
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
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginTop: spacing[4],
    textAlign: 'center',
  },
  message: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  action: {
    marginTop: spacing[4],
  },
});

export default EmptyState;
