import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/authSlice';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';

export default function ProfileScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/(auth)/login');
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size="xlarge" color="primary" />
        </View>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user.role.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Icon name="phone" size="medium" color="textSecondary" />
          <Text style={styles.infoText}>
            {user.phoneNumber || 'Not provided'}
          </Text>
        </View>
        {user.licenseNumber && (
          <View style={styles.infoRow}>
            <Icon name="card-membership" size="medium" color="textSecondary" />
            <Text style={styles.infoText}>{user.licenseNumber}</Text>
          </View>
        )}
        {user.violationPoints !== undefined && (
          <View style={styles.infoRow}>
            <Icon name="warning" size="medium" color="warning" />
            <Text style={styles.infoText}>
              Violation Points: {user.violationPoints}
            </Text>
          </View>
        )}
      </Card>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        icon="logout"
        fullWidth
        style={styles.logoutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing[6],
    margin: spacing[4],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  name: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  email: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  roleBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
  },
  roleText: {
    ...typography.styles.caption,
    color: colors.base.white,
    fontWeight: typography.fontWeight.semibold,
  },
  infoCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoText: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginLeft: spacing[3],
  },
  logoutButton: {
    margin: spacing[4],
  },
});
