import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';

export default function FleetScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Fleet Management</Text>
        <Text style={styles.subtitle}>Fleet management features coming soon</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
  },
  card: {
    padding: spacing[6],
    alignItems: 'center',
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
});
