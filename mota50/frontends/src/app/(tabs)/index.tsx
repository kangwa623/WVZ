import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import SimpleChart from '@/components/charts/SimpleChart';

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {getDashboardContent()}
      </View>
    </ScrollView>
  );
}

function DriverDashboard({ user }: { user: any }) {
  return (
    <>
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome, {user.firstName}!</Text>
        <Text style={styles.roleText}>Driver Dashboard</Text>
      </Card>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Icon name="directions-car" size="large" color="primary" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Active Trips</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="event" size="large" color="primary" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Upcoming Bookings</Text>
        </Card>
      </View>

      <Card style={styles.infoCard}>
        <Icon name="warning" size="medium" color="warning" />
        <Text style={styles.infoText}>No active trips or bookings</Text>
      </Card>
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
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing[4],
  },
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
