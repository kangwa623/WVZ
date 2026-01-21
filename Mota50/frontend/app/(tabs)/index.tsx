import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import SimpleChart from '@/components/charts/SimpleChart';
import Button from '@/components/common/Button';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useSelector((state: RootState) => state.auth);

  const getDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'driver':
      case 'non_driver':
        return <DriverDashboard user={user} />;
      case 'fleet_manager':
        return <FleetManagerDashboard />;
      case 'finance_officer':
        return <FinanceDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {getDashboardContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DriverDashboard({ user }: { user: any }) {
  const router = useRouter();
  
  // Mock data - replace with actual data from your services
  const safetyScore = 92;
  const violationsIn30Days = 0;
  const recentActivities = [
    {
      id: '1',
      type: 'trip_completed',
      title: 'Trip Completed',
      subtitle: 'Yesterday • 45 KM • Lusaka Area',
      icon: 'check',
      iconColor: colors.semantic.success,
    },
  ];

  const getSafetyMessage = () => {
    if (violationsIn30Days === 0) {
      return 'Excellent! No violations in 30 days.';
    } else if (violationsIn30Days <= 2) {
      return `Good! ${violationsIn30Days} violation(s) in 30 days.`;
    } else {
      return `Warning! ${violationsIn30Days} violations in 30 days.`;
    }
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>M50</Text>
          </View>
          <Text style={styles.brandText}>MOTA50</Text>
        </View>
        <View style={styles.profileContainer}>
          <Icon name="cloud-done" size="small" color={colors.semantic.success} iconSet="MaterialIcons" />
          <View style={[styles.profileImageContainer, { marginHorizontal: spacing[2] }]}>
            <Icon name="person" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
          </View>
          <Icon name="keyboard-arrow-down" size="small" color={colors.primary.main} iconSet="MaterialIcons" />
        </View>
      </View>

      {/* Safety Score Section */}
      <Card style={styles.safetyCard}>
        <Text style={styles.sectionTitle}>MY SAFETY SCORE</Text>
        <View style={styles.safetyScoreContainer}>
          <Text style={styles.safetyScoreNumber}>{safetyScore}</Text>
          <Text style={styles.safetyScoreDenominator}>/100</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${safetyScore}%` }]} />
        </View>
        <Text style={styles.safetyMessage}>{getSafetyMessage()}</Text>
      </Card>

      {/* Book Vehicle Button */}
      <Button
        title="Book a Pool Vehicle"
        onPress={() => router.push('/(tabs)/bookings')}
        variant="primary"
        size="large"
        fullWidth
        icon="add"
        iconSet="MaterialIcons"
        style={styles.bookButton}
      />

      {/* Action Cards Grid */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/inspections/pre_trip?type=pre_trip')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.semantic.info + '20' }]}>
            <Icon name="route" size="large" color={colors.semantic.info} iconSet="MaterialIcons" />
          </View>
          <Text style={styles.actionLabel}>Start Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/inspections/pre-trip')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.primary.main + '20' }]}>
            <Icon name="assignment" size="large" color={colors.primary.main} iconSet="MaterialIcons" />
          </View>
          <Text style={styles.actionLabel}>Inspections</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/receipts')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.semantic.info + '20' }]}>
            <Icon name="local-gas-station" size="large" color={colors.semantic.info} iconSet="MaterialIcons" />
          </View>
          <Text style={styles.actionLabel}>Receipts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            // Navigate to incident reporting
            console.log('Report Incident');
          }}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.semantic.error + '20' }]}>
            <Icon name="warning" size="large" color={colors.semantic.error} iconSet="MaterialIcons" />
          </View>
          <Text style={styles.actionLabel}>Incident</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        {recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: activity.iconColor + '15' }]}>
              <Icon
                name={activity.icon}
                size="medium"
                color={activity.iconColor}
                iconSet="MaterialIcons"
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

    </>
  );
}

function FleetManagerDashboard() {
  const utilizationData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [65, 78, 82, 75, 88, 45, 30],
        color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <>
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Fleet Manager Dashboard</Text>
      </Card>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Icon name="local-shipping" size="large" color="primary" />
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Total Vehicles</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="directions-car" size="large" color="primary" />
          <Text style={styles.statValue}>18</Text>
          <Text style={styles.statLabel}>In Use</Text>
        </Card>
      </View>

      <SimpleChart
        title="Weekly Utilization Rate"
        data={utilizationData}
        type="line"
      />
    </>
  );
}

function FinanceDashboard() {
  const fuelData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [12000, 15000, 18000, 14000, 16000, 19000],
        color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const costCenterData = [
    { name: 'Project A', value: 45000, color: colors.primary.main },
    { name: 'Project B', value: 32000, color: colors.primary.light },
    { name: 'Project C', value: 28000, color: colors.accent.gold },
    { name: 'Other', value: 15000, color: colors.accent.terraCotta },
  ];

  return (
    <>
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Finance Dashboard</Text>
      </Card>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Icon name="attach-money" size="large" color="primary" />
          <Text style={styles.statValue}>120K</Text>
          <Text style={styles.statLabel}>Total Spend</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="local-gas-station" size="large" color="primary" />
          <Text style={styles.statValue}>45K</Text>
          <Text style={styles.statLabel}>Fuel Cost</Text>
        </Card>
      </View>

      <SimpleChart
        title="Monthly Fuel Expenditure"
        data={fuelData}
        type="bar"
      />

      <SimpleChart
        title="Cost by Project"
        data={costCenterData}
        type="pie"
      />
    </>
  );
}

function DefaultDashboard() {
  return (
    <Card style={styles.infoCard}>
      <Text style={styles.infoText}>Dashboard content</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[2],
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  logoText: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.base.white,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  brandText: {
    ...typography.styles.h4,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyCard: {
    marginBottom: spacing[4],
    padding: spacing[5],
  },
  sectionTitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing[4],
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  safetyScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing[4],
  },
  safetyScoreNumber: {
    ...typography.styles.h1,
    fontSize: 56,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
    lineHeight: 64,
  },
  safetyScoreDenominator: {
    ...typography.styles.h3,
    fontSize: 28,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
    marginLeft: spacing[1],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.semantic.success,
    borderRadius: 4,
  },
  safetyMessage: {
    ...typography.styles.body,
    color: colors.text.secondary,
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
    marginTop: spacing[1],
  },
  bookButton: {
    marginBottom: spacing[5],
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing[5],
    alignItems: 'center',
    marginBottom: spacing[3],
    // Shadow
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
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  actionLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  activitySection: {
    marginBottom: spacing[5],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing[4],
    marginTop: spacing[3],
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {
      shadowColor: colors.base.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    }),
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[5],
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  activitySubtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  // Legacy styles for other dashboards
  welcomeCard: {
    marginBottom: spacing[4],
  },
  welcomeText: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  roleText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing[1],
    padding: spacing[4],
  },
  statValue: {
    ...typography.styles.h3,
    color: colors.primary.main,
    marginTop: spacing[2],
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  infoCard: {
    alignItems: 'center',
    padding: spacing[6],
  },
  infoText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
});
