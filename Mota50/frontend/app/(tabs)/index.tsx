import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import SimpleChart from '@/components/charts/SimpleChart';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useRouter } from 'expo-router';
import financeReportService, { FinancialData } from '@/services/financeReports';
import InteractiveBarChart from '@/components/charts/InteractiveBarChart';
import WebMapView from '@/screens/trips/WebMapView';
import vehicleService from '@/services/vehicles';
import { Vehicle } from '@/types/vehicle';

export default function DashboardScreen() {
  const { user } = useSelector((state: RootState) => state.auth);

  const getDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'driver':
      case 'non_driver':
        return <DriverDashboard user={user} />;
      case 'staff':
        return <StaffDashboard user={user} />;
      case 'fleet_manager':
        return <FleetManagerDashboard />;
      case 'finance_officer':
      case 'finance': // Support both for backward compatibility
        return <FinanceDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  const dashboardContent = getDashboardContent();
  
  // Finance, Fleet Manager, and Admin dashboards have their own ScrollView, so don't wrap them
  if (user && (user.role === 'finance_officer' || user.role === 'finance' || user.role === 'fleet_manager' || user.role === 'admin')) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {dashboardContent}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {dashboardContent}
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
          onPress={() => router.push('/(tabs)/incident')}
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

function StaffDashboard({ user }: { user: any }) {
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
          onPress={() => router.push('/(tabs)/incident')}
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'analytics' | 'compliance' | 'users' | 'violations' | 'finance'>('overview');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      // Mock data for development
      setVehicles([
        {
          id: '1',
          registrationNumber: 'ABC-123',
          make: 'Toyota',
          model: 'Hilux',
          year: 2020,
          type: 'pickup',
          status: 'in_use',
          currentMileage: 45000,
          fuelType: 'Diesel',
          assignedDriverId: 'driver_1',
          lastInspectionDate: '2024-12-01',
          nextServiceDate: '2025-02-01',
          createdAt: '2020-01-01',
          updatedAt: '2024-12-15',
        },
        {
          id: '2',
          registrationNumber: 'XYZ-789',
          make: 'Nissan',
          model: 'Navara',
          year: 2021,
          type: 'pickup',
          status: 'available',
          currentMileage: 32000,
          fuelType: 'Diesel',
          createdAt: '2021-01-01',
          updatedAt: '2024-12-15',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for various sections
  const fleetStats = {
    totalVehicles: vehicles.length || 24,
    inUse: vehicles.filter(v => v.status === 'in_use').length || 18,
    available: vehicles.filter(v => v.status === 'available').length || 4,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length || 2,
  };

  const utilizationData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [65, 78, 82, 75, 88, 45, 30],
      color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const driverPerformanceData = [
    { driver: 'John Doe', speeding: 2, harshBraking: 1, idleTime: '2.5h', score: 85 },
    { driver: 'Jane Smith', speeding: 0, harshBraking: 0, idleTime: '1.2h', score: 95 },
    { driver: 'Mike Johnson', speeding: 5, harshBraking: 3, idleTime: '4.1h', score: 70 },
  ];

  const complianceData = {
    licensesExpiring: 3,
    waiversPending: 2,
    inspectionsDue: 5,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return colors.semantic.success;
      case 'in_use':
        return colors.semantic.info;
      case 'maintenance':
        return colors.semantic.warning;
      case 'out_of_service':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getPointsStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return colors.semantic.success;
      case 'good':
        return colors.semantic.info;
      case 'warning':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderFleetOverview();
      case 'trips':
        return renderTripManagement();
      case 'analytics':
        return renderAnalytics();
      case 'compliance':
        return renderCompliance();
      case 'users':
        return renderUserManagement();
      case 'violations':
        return renderViolations();
      case 'finance':
        return renderFinance();
      default:
        return null;
    }
  };

  const renderFleetOverview = () => (
    <>
      {/* Fleet Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon name="local-shipping" size="large" color={colors.primary.main} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{fleetStats.totalVehicles}</Text>
          <Text style={styles.statLabel}>Total Vehicles</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="directions-car" size="large" color={colors.semantic.success} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{fleetStats.inUse}</Text>
          <Text style={styles.statLabel}>In Use</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="check-circle" size="large" color={colors.semantic.info} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{fleetStats.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="build" size="large" color={colors.semantic.warning} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{fleetStats.maintenance}</Text>
          <Text style={styles.statLabel}>Maintenance</Text>
        </Card>
      </View>

      {/* Live Map */}
      <Card style={styles.mapCard}>
        <Text style={styles.sectionTitle}>LIVE FLEET LOCATIONS</Text>
        <View style={styles.mapContainer}>
          <WebMapView
            style={styles.map}
            initialLocation={{ latitude: -15.4167, longitude: 28.2833 }} // Lusaka coordinates
            currentLocation={selectedVehicle ? { latitude: -15.4167, longitude: 28.2833 } : undefined}
          />
        </View>
        <Text style={styles.mapNote}>Showing real-time vehicle locations</Text>
      </Card>

      {/* Vehicle List */}
      <Card style={styles.vehicleListCard}>
        <Text style={styles.sectionTitle}>FLEET STATUS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCellReg]}>Registration</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellStatus]}>Status</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellMileage]}>Mileage</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellDriver]}>Driver</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellInspection]}>Last Inspection</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellIncidents]}>Incidents</Text>
            </View>
            {vehicles.map((vehicle, index) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
                onPress={() => setSelectedVehicle(vehicle)}
              >
                <Text style={[styles.tableCellText, styles.tableCellReg]}>{vehicle.registrationNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(vehicle.status) }]}>
                    {vehicle.status.toUpperCase().replace('_', ' ')}
                  </Text>
                </View>
                <Text style={[styles.tableCellText, styles.tableCellMileage]}>{vehicle.currentMileage.toLocaleString()} km</Text>
                <Text style={[styles.tableCellText, styles.tableCellDriver]}>{vehicle.assignedDriverId ? 'Assigned' : 'Unassigned'}</Text>
                <Text style={[styles.tableCellText, styles.tableCellInspection]}>
                  {vehicle.lastInspectionDate ? new Date(vehicle.lastInspectionDate).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={[styles.tableCellText, styles.tableCellIncidents]}>0</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Card>
    </>
  );

  const renderTripManagement = () => (
    <>
      <Card style={styles.actionCard}>
        <Text style={styles.sectionTitle}>ASSIGN VEHICLE TO DRIVER</Text>
        <View style={styles.assignForm}>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Select Vehicle</Text>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Choose Vehicle</Text>
                <Icon name="keyboard-arrow-down" size="small" color={colors.text.secondary} iconSet="MaterialIcons" />
              </TouchableOpacity>
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Select Driver</Text>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Choose Driver</Text>
                <Icon name="keyboard-arrow-down" size="small" color={colors.text.secondary} iconSet="MaterialIcons" />
              </TouchableOpacity>
            </View>
          </View>
          <Button
            title="Assign Vehicle"
            onPress={() => {}}
            variant="primary"
            fullWidth
            icon="assignment"
            iconSet="MaterialIcons"
          />
        </View>
      </Card>

      <Card style={styles.listCard}>
        <Text style={styles.sectionTitle}>ACTIVE TRIPS</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.tripItem}>
            <View style={styles.tripItemHeader}>
              <Text style={styles.tripVehicle}>ABC-{item}23</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.semantic.info + '20' }]}>
                <Text style={[styles.statusText, { color: colors.semantic.info }]}>IN PROGRESS</Text>
              </View>
            </View>
            <Text style={styles.tripDriver}>Driver: John Doe</Text>
            <Text style={styles.tripDestination}>Destination: Field Office</Text>
            <Text style={styles.tripTime}>Started: 2 hours ago</Text>
          </View>
        ))}
      </Card>
    </>
  );

  const renderAnalytics = () => (
    <>
      <View style={styles.analyticsGrid}>
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Utilization Rate</Text>
          <Text style={styles.analyticsValue}>78%</Text>
          <Text style={styles.analyticsSubtext}>Weekly Average</Text>
        </Card>
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Total Mileage</Text>
          <Text style={styles.analyticsValue}>125,400 km</Text>
          <Text style={styles.analyticsSubtext}>This Quarter</Text>
        </Card>
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Fuel Consumption</Text>
          <Text style={styles.analyticsValue}>24,100 L</Text>
          <Text style={styles.analyticsSubtext}>Monthly Average</Text>
        </Card>
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Cost per KM</Text>
          <Text style={styles.analyticsValue}>ZMW 1.47</Text>
          <Text style={styles.analyticsSubtext}>Target: ZMW 1.35</Text>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>WEEKLY UTILIZATION RATE</Text>
        <SimpleChart title="" data={utilizationData} type="line" />
      </Card>

      <Card style={styles.driverPerformanceCard}>
        <Text style={styles.sectionTitle}>DRIVER PERFORMANCE METRICS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCellDriverName]}>Driver</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellMetric]}>Speeding</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellMetric]}>Harsh Braking</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellMetric]}>Idle Time</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellScore]}>Score</Text>
            </View>
            {driverPerformanceData.map((driver, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tableCellText, styles.tableCellDriverName]}>{driver.driver}</Text>
                <Text style={[styles.tableCellText, styles.tableCellMetric]}>{driver.speeding}</Text>
                <Text style={[styles.tableCellText, styles.tableCellMetric]}>{driver.harshBraking}</Text>
                <Text style={[styles.tableCellText, styles.tableCellMetric]}>{driver.idleTime}</Text>
                <Text style={[styles.tableCellText, styles.tableCellScore, { color: driver.score >= 80 ? colors.semantic.success : colors.semantic.warning }]}>
                  {driver.score}/100
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>

      <Card style={styles.maintenanceCard}>
        <Text style={styles.sectionTitle}>MAINTENANCE TRENDS</Text>
        <View style={styles.maintenanceItem}>
          <Icon name="build" size="medium" color={colors.semantic.warning} iconSet="MaterialIcons" />
          <View style={styles.maintenanceInfo}>
            <Text style={styles.maintenanceTitle}>Scheduled Services</Text>
            <Text style={styles.maintenanceSubtext}>5 vehicles due this month</Text>
          </View>
        </View>
        <View style={styles.maintenanceItem}>
          <Icon name="warning" size="medium" color={colors.semantic.error} iconSet="MaterialIcons" />
          <View style={styles.maintenanceInfo}>
            <Text style={styles.maintenanceTitle}>Predictive Alerts</Text>
            <Text style={styles.maintenanceSubtext}>2 vehicles need attention</Text>
          </View>
        </View>
      </Card>
    </>
  );

  const renderCompliance = () => (
    <>
      <View style={styles.complianceGrid}>
        <Card style={styles.complianceCard}>
          <Icon name="credit-card" size="large" color={colors.semantic.warning} iconSet="MaterialIcons" />
          <Text style={styles.complianceValue}>{complianceData.licensesExpiring}</Text>
          <Text style={styles.complianceLabel}>Licenses Expiring</Text>
          <Button
            title="View Details"
            onPress={() => {}}
            variant="outlined"
            size="small"
            style={styles.complianceButton}
          />
        </Card>
        <Card style={styles.complianceCard}>
          <Icon name="assignment" size="large" color={colors.semantic.info} iconSet="MaterialIcons" />
          <Text style={styles.complianceValue}>{complianceData.waiversPending}</Text>
          <Text style={styles.complianceLabel}>Waivers Pending</Text>
          <Button
            title="Review"
            onPress={() => {}}
            variant="outlined"
            size="small"
            style={styles.complianceButton}
          />
        </Card>
        <Card style={styles.complianceCard}>
          <Icon name="checklist" size="large" color={colors.primary.main} iconSet="MaterialIcons" />
          <Text style={styles.complianceValue}>{complianceData.inspectionsDue}</Text>
          <Text style={styles.complianceLabel}>Inspections Due</Text>
          <Button
            title="Schedule"
            onPress={() => {}}
            variant="outlined"
            size="small"
            style={styles.complianceButton}
          />
        </Card>
      </View>

      <Card style={styles.complianceListCard}>
        <Text style={styles.sectionTitle}>LICENSE EXPIRY TRACKING</Text>
        {[
          { driver: 'John Doe', expiry: '2025-01-15', status: 'expiring_soon' },
          { driver: 'Jane Smith', expiry: '2025-02-20', status: 'expiring_soon' },
          { driver: 'Mike Johnson', expiry: '2025-03-10', status: 'valid' },
        ].map((item, index) => (
          <View key={index} style={styles.complianceItem}>
            <View style={styles.complianceItemInfo}>
              <Text style={styles.complianceItemDriver}>{item.driver}</Text>
              <Text style={styles.complianceItemExpiry}>Expires: {new Date(item.expiry).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'expiring_soon' ? colors.semantic.warning + '20' : colors.semantic.success + '20' }]}>
              <Text style={[styles.statusText, { color: item.status === 'expiring_soon' ? colors.semantic.warning : colors.semantic.success }]}>
                {item.status === 'expiring_soon' ? 'EXPIRING SOON' : 'VALID'}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </>
  );

  const renderUserManagement = () => (
    <>
      <Card style={styles.actionCard}>
        <Text style={styles.sectionTitle}>USER & ROLE CONFIGURATION</Text>
        <View style={styles.userForm}>
          <Input label="User Email" placeholder="user@example.com" />
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Role</Text>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select Role</Text>
                <Icon name="keyboard-arrow-down" size="small" color={colors.text.secondary} iconSet="MaterialIcons" />
              </TouchableOpacity>
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Access Level</Text>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select Level</Text>
                <Icon name="keyboard-arrow-down" size="small" color={colors.text.secondary} iconSet="MaterialIcons" />
              </TouchableOpacity>
            </View>
          </View>
          <Input label="Geofencing Zones" placeholder="Enter zone coordinates" />
          <Button
            title="Save Configuration"
            onPress={() => {}}
            variant="primary"
            fullWidth
            icon="save"
            iconSet="MaterialIcons"
          />
        </View>
      </Card>

      <Card style={styles.userListCard}>
        <Text style={styles.sectionTitle}>USER ASSIGNMENTS</Text>
        {[
          { user: 'John Doe', role: 'Driver', vehicles: ['ABC-123', 'XYZ-789'], access: 'Standard' },
          { user: 'Jane Smith', role: 'Driver', vehicles: ['DEF-456'], access: 'Standard' },
          { user: 'Admin User', role: 'Admin', vehicles: ['All'], access: 'Full' },
        ].map((item, index) => (
          <View key={index} style={styles.userItem}>
            <View style={styles.userItemInfo}>
              <Text style={styles.userItemName}>{item.user}</Text>
              <Text style={styles.userItemRole}>{item.role} • {item.access} Access</Text>
              <Text style={styles.userItemVehicles}>Vehicles: {item.vehicles.join(', ')}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Icon name="edit" size="small" color={colors.primary.main} iconSet="MaterialIcons" />
            </TouchableOpacity>
          </View>
        ))}
      </Card>
    </>
  );

  const renderViolations = () => (
    <>
      <Card style={styles.violationsCard}>
        <Text style={styles.sectionTitle}>VIOLATION & POINTS TRACKING</Text>
        {[
          { driver: 'John Doe', violation: 'Speeding', points: 3, date: '2024-12-10', status: 'active' },
          { driver: 'Mike Johnson', violation: 'Harsh Braking', points: 2, date: '2024-12-08', status: 'active' },
          { driver: 'John Doe', violation: 'Idle Time Exceeded', points: 1, date: '2024-12-05', status: 'active' },
        ].map((item, index) => (
          <View key={index} style={styles.violationItem}>
            <View style={styles.violationItemInfo}>
              <Text style={styles.violationDriver}>{item.driver}</Text>
              <Text style={styles.violationType}>{item.violation}</Text>
              <Text style={styles.violationDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.violationPoints}>
              <Text style={styles.violationPointsText}>-{item.points}</Text>
              <Text style={styles.violationPointsLabel}>Points</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.pointsSummaryCard}>
        <Text style={styles.sectionTitle}>DRIVER POINTS SUMMARY</Text>
        {[
          { driver: 'John Doe', totalPoints: 4, status: 'warning' },
          { driver: 'Mike Johnson', totalPoints: 2, status: 'good' },
          { driver: 'Jane Smith', totalPoints: 0, status: 'excellent' },
        ].map((item, index) => (
          <View key={index} style={styles.pointsItem}>
            <Text style={styles.pointsDriver}>{item.driver}</Text>
            <View style={[styles.pointsBadge, { backgroundColor: getPointsStatusColor(item.status) + '20' }]}>
              <Text style={[styles.pointsText, { color: getPointsStatusColor(item.status) }]}>
                {item.totalPoints} Points
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </>
  );

  const renderFinance = () => (
    <>
      <Card style={styles.financeCard}>
        <Text style={styles.sectionTitle}>FUEL & COST ANALYTICS BY COST CENTER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCellCostCenter]}>Cost Center</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellCost]}>Fuel Cost</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellCost]}>Total Cost</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellCost]}>Distance</Text>
            </View>
            {[
              { center: 'Health Programs', fuel: 25000, total: 55000, distance: 35000 },
              { center: 'Education & Child Protection', fuel: 20000, total: 42500, distance: 30000 },
              { center: 'Administration & HR', fuel: 15000, total: 35200, distance: 25000 },
              { center: 'WASH & Infrastructure', fuel: 30000, total: 52500, distance: 35400 },
            ].map((item, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tableCellText, styles.tableCellCostCenter]}>{item.center}</Text>
                <Text style={[styles.tableCellText, styles.tableCellCost]}>ZMW {item.fuel.toLocaleString()}</Text>
                <Text style={[styles.tableCellText, styles.tableCellCost]}>ZMW {item.total.toLocaleString()}</Text>
                <Text style={[styles.tableCellText, styles.tableCellCost]}>{item.distance.toLocaleString()} km</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <Button
          title="Export to Accounting System"
          onPress={() => {}}
          variant="primary"
          fullWidth
          icon="file-download"
          iconSet="MaterialIcons"
          style={styles.exportButton}
        />
      </Card>
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading fleet data...</Text>
      </View>
    );
  }

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

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'dashboard' },
          { key: 'trips', label: 'Trips', icon: 'route' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics' },
          { key: 'compliance', label: 'Compliance', icon: 'verified' },
          { key: 'users', label: 'Users', icon: 'people' },
          { key: 'violations', label: 'Violations', icon: 'warning' },
          { key: 'finance', label: 'Finance', icon: 'account-balance' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Icon
              name={tab.icon}
              size="small"
              color={activeTab === tab.key ? colors.primary.main : colors.text.secondary}
              iconSet="MaterialIcons"
            />
            <Text 
              style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </>
  );
}

function FinanceDashboard() {
  // Financial Data (mock - replace with API call in production)
  const financialData: FinancialData = {
    totalOperationalCost: 185200.50,
    totalFuelCost: 75900.25,
    totalDistance: 125400,
    costPerKm: 1.47,
    costCenterBreakdown: [
      { center: 'Health Programs', cost: 55000, km: 35000, color: colors.semantic.error },
      { center: 'Education & Child Protection', cost: 42500, km: 30000, color: colors.semantic.info },
      { center: 'Administration & HR', cost: 35200, km: 25000, color: colors.semantic.warning },
      { center: 'WASH & Infrastructure', cost: 52500, km: 35400, color: colors.semantic.success },
    ],
    monthlyFuelConsumption: [
      { month: 'Jan', consumption: 3500, cost: 12000 },
      { month: 'Feb', consumption: 3200, cost: 11500 },
      { month: 'Mar', consumption: 4000, cost: 14000 },
      { month: 'Apr', consumption: 3800, cost: 13500 },
      { month: 'May', consumption: 4500, cost: 15500 },
      { month: 'Jun', consumption: 4100, cost: 14400 },
    ],
  };

  // Audit Report State
  const [auditReport, setAuditReport] = useState('');
  const [auditStatus, setAuditStatus] = useState('');
  const [auditStatusType, setAuditStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [auditGenerating, setAuditGenerating] = useState(false);
  const [auditDownloadVisible, setAuditDownloadVisible] = useState(false);
  const [auditSubmitVisible, setAuditSubmitVisible] = useState(false);

  // EPR Report State
  const [eprRank, setEprRank] = useState('Staff Sergeant');
  const [eprName, setEprName] = useState('Chola Mwila');
  const [eprPeriod, setEprPeriod] = useState('1 Jan 2025 - 30 Jun 2025');
  const [eprAchievements, setEprAchievements] = useState(`Led team of 4 to recover 2 disabled vehicles in harsh terrain; minimized downtime to under 8 hours.
Implemented a new tire rotation schedule that extended fleet tire life by 20%.
Trained 15 junior drivers on defensive driving techniques, resulting in zero preventable accidents this quarter.
Managed and reconciled ZMW 75,900 in quarterly fuel expenditures with 100% accuracy.`);
  const [eprWeaknesses, setEprWeaknesses] = useState(`Requires cross-training in advanced diagnostics software.
Needs to improve delegation and trust building within the maintenance crew.`);
  const [eprReport, setEprReport] = useState('');
  const [eprStatus, setEprStatus] = useState('');
  const [eprStatusType, setEprStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [eprGenerating, setEprGenerating] = useState(false);
  const [eprDownloadVisible, setEprDownloadVisible] = useState(false);
  const [eprSubmitVisible, setEprSubmitVisible] = useState(false);

  const formatCurrency = (amount: number) => {
    return `ZMW ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleGenerateAudit = async () => {
    try {
      setAuditGenerating(true);
      setAuditStatus('Preparing detailed financial audit summary...');
      setAuditStatusType('info');
      
      const report = await financeReportService.generateAuditReport(financialData);
      setAuditReport(report);
      setAuditStatus('Financial Audit Summary generated successfully. Review, download the source, or submit.');
      setAuditStatusType('success');
      setAuditDownloadVisible(true);
      setAuditSubmitVisible(true);
    } catch (error: any) {
      setAuditStatus(`Audit Generation failed: ${error.message}`);
      setAuditStatusType('error');
      Alert.alert('Error', error.message || 'Failed to generate audit report');
    } finally {
      setAuditGenerating(false);
    }
  };

  const handleDownloadAuditSource = () => {
    setAuditStatus('The Audit Summary content is ready for PDF compilation. Copy the generated text and paste it into the audit_summary.tex file.');
    setAuditStatusType('info');
  };

  const handleSubmitAudit = async () => {
    if (!auditReport || auditReport.includes("Click 'Generate Audit Report'")) {
      setAuditStatus('Please generate the report content before submission.');
      setAuditStatusType('error');
      return;
    }
    
    // Mock submission - replace with API call in production
    setAuditStatus('Financial Audit Report submitted to database (mock status: success).');
    setAuditStatusType('success');
  };

  const handleGenerateEPR = async () => {
    if (!eprName || !eprRank || !eprAchievements) {
      setEprStatus('Please fill in Rank, Name, and Key Achievements.');
      setEprStatusType('error');
      return;
    }

    try {
      setEprGenerating(true);
      setEprStatus('Preparing integrated performance and finance narrative...');
      setEprStatusType('info');
      
      const report = await financeReportService.generateEPRReport(
        financialData,
        eprName,
        eprRank,
        eprPeriod,
        eprAchievements,
        eprWeaknesses
      );
      setEprReport(report);
      setEprStatus('Integrated Report Draft generated successfully. Review, download the source, or submit.');
      setEprStatusType('success');
      setEprDownloadVisible(true);
      setEprSubmitVisible(true);
    } catch (error: any) {
      setEprStatus(`EPR Generation failed: ${error.message}`);
      setEprStatusType('error');
      Alert.alert('Error', error.message || 'Failed to generate EPR report');
    } finally {
      setEprGenerating(false);
    }
  };

  const handleDownloadEPRSource = () => {
    setEprStatus('The Integrated Report content is ready for PDF compilation. Copy the generated text and paste it into the epr_draft.tex file.');
    setEprStatusType('info');
  };

  const handleSubmitEPR = async () => {
    if (!eprReport || eprReport.includes('Enter details')) {
      setEprStatus('Please generate the report content before submission.');
      setEprStatusType('error');
      return;
    }
    
    // Mock submission - replace with API call in production
    setEprStatus(`Report for ${eprName} submitted to database (mock status: success).`);
    setEprStatusType('success');
  };


  return (
    <ScrollView style={styles.financeContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.financeHeader}>
        <Text style={styles.financeHeaderTitle}>Fleet Financial Overview - Q2 2025</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <Card style={styles.kpiCard}>
          <View style={[styles.kpiBorder, { borderColor: colors.semantic.info }]} />
          <Text style={styles.kpiLabel}>Total Operational Cost</Text>
          <Text style={styles.kpiValue}>{formatCurrency(financialData.totalOperationalCost)}</Text>
          <Text style={styles.kpiChangePositive}>2.5% increase from last quarter</Text>
        </Card>
        
        <Card style={styles.kpiCard}>
          <View style={[styles.kpiBorder, { borderColor: colors.primary.main }]} />
          <Text style={styles.kpiLabel}>Total Fuel Cost</Text>
          <Text style={styles.kpiValue}>{formatCurrency(financialData.totalFuelCost)}</Text>
          <Text style={styles.kpiChangeNegative}>4.1% over budget</Text>
        </Card>
        
        <Card style={styles.kpiCard}>
          <View style={[styles.kpiBorder, { borderColor: colors.semantic.success }]} />
          <Text style={styles.kpiLabel}>Total Distance Covered</Text>
          <Text style={styles.kpiValue}>{financialData.totalDistance.toLocaleString()} KM</Text>
          <Text style={styles.kpiSubtext}>Total Fleet Activity</Text>
        </Card>
        
        <Card style={styles.kpiCard}>
          <View style={[styles.kpiBorder, { borderColor: colors.accent.terraCotta }]} />
          <Text style={styles.kpiLabel}>Avg Cost per KM</Text>
          <Text style={styles.kpiValue}>ZMW {financialData.costPerKm.toFixed(2)} / KM</Text>
          <Text style={styles.kpiChangeWarning}>Target: ZMW 1.25</Text>
        </Card>
      </View>

      {/* Cost Center Table & Fuel Chart */}
      <View style={styles.chartsContainer}>
        <Card style={styles.costCenterCard}>
          <Text style={styles.sectionTitle}>Cost Center Allocation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.tableCellCostCenter]}>Cost Center</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellCost]}>Total Cost</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellDistance]}>Distance Covered</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellPercentage]}>Percentage (%)</Text>
              </View>
              {financialData.costCenterBreakdown.map((item, index) => {
                const percentage = ((item.cost / financialData.totalOperationalCost) * 100).toFixed(1);
                return (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                    <View style={styles.tableCellCostCenter}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.tableCellText} numberOfLines={2}>{item.center}</Text>
                    </View>
                    <Text style={[styles.tableCellText, styles.tableCellCost]}>{formatCurrency(item.cost)}</Text>
                    <Text style={[styles.tableCellText, styles.tableCellDistance]}>{item.km.toLocaleString()} KM</Text>
                    <Text style={[styles.tableCellText, styles.tableCellPercentage, styles.tableCellBold]}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Card>

        <InteractiveBarChart
          title="Monthly Fuel Consumption (Liters)"
          data={financialData.monthlyFuelConsumption}
          height={Platform.OS === 'web' ? 300 : 280}
        />
      </View>

      {/* Audit Report Section */}
      <Card style={styles.reportSection}>
        <Text style={[styles.reportSectionTitle, { color: colors.semantic.info }]}>3. Financial Reconciliation & Audit Report</Text>
        <Text style={styles.reportSectionDescription}>
          Generate a professional audit summary for financial reconciliation, variance analysis, and identification of key spending trends.
        </Text>
        
        <View style={styles.reportButtonsRow}>
          <Button
            title={auditGenerating ? 'Generating Audit Report...' : 'Generate Audit Report'}
            onPress={handleGenerateAudit}
            disabled={auditGenerating}
            loading={auditGenerating}
            fullWidth
            icon="download"
            iconSet="MaterialIcons"
            style={[styles.reportButton, { backgroundColor: colors.semantic.info }]}
          />
          {auditDownloadVisible && (
            <Button
              title="Download PDF Source"
              onPress={handleDownloadAuditSource}
              variant="secondary"
              icon="file-download"
              iconSet="MaterialIcons"
              style={styles.reportButtonSecondary}
            />
          )}
          {auditSubmitVisible && (
            <Button
              title="Submit Report"
              onPress={handleSubmitAudit}
              variant="primary"
              style={[styles.reportButtonSecondary, { backgroundColor: colors.semantic.success }]}
            />
          )}
        </View>

        {auditStatus ? (
          <Card
            style={[
              styles.statusBox,
              auditStatusType === 'success' && { backgroundColor: colors.semantic.success + '20', borderColor: colors.semantic.success + '80' },
              auditStatusType === 'error' && { backgroundColor: colors.semantic.error + '20', borderColor: colors.semantic.error + '80' },
              auditStatusType === 'info' && { backgroundColor: colors.semantic.info + '20', borderColor: colors.semantic.info + '80' },
            ]}
            variant="outlined"
          >
            <Text
              style={[
                styles.statusText,
                auditStatusType === 'success' && { color: '#1B5E20' },
                auditStatusType === 'error' && { color: '#B71C1C' },
                auditStatusType === 'info' && { color: '#0D47A1' },
              ]}
            >
              {auditStatus}
            </Text>
          </Card>
        ) : null}

        <View style={styles.reportOutputContainer}>
          <Text style={styles.reportOutputLabel}>Generated Financial Audit Summary (Editable):</Text>
          <TextInput
            style={styles.reportOutput}
            value={auditReport}
            onChangeText={setAuditReport}
            multiline
            placeholder="Click 'Generate Audit Report' to produce a detailed financial analysis."
            placeholderTextColor={colors.text.tertiary}
            textAlignVertical="top"
          />
        </View>
      </Card>

      {/* EPR Report Section */}
      <Card style={styles.reportSection}>
        <Text style={[styles.reportSectionTitle, { color: colors.semantic.error }]}>4. Integrated Performance & Resource Report Generation</Text>
        
        <View style={styles.eprInputRow}>
          <Input
            label="Rank"
            value={eprRank}
            onChangeText={setEprRank}
            placeholder="Rank (e.g., Sergeant)"
            containerStyle={styles.eprInput}
          />
          <Input
            label="Name"
            value={eprName}
            onChangeText={setEprName}
            placeholder="Member Full Name"
            containerStyle={styles.eprInput}
          />
          <Input
            label="Period"
            value={eprPeriod}
            onChangeText={setEprPeriod}
            placeholder="Reporting Period (e.g., Q2 2025)"
            containerStyle={styles.eprInput}
          />
        </View>

        <View style={styles.eprTextAreasRow}>
          <View style={styles.eprTextAreaContainer}>
            <Text style={styles.eprTextAreaLabel}>Key Achievements</Text>
            <TextInput
              style={styles.eprTextArea}
              value={eprAchievements}
              onChangeText={setEprAchievements}
              placeholder="List Key Achievements (one per line)"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
          <View style={styles.eprTextAreaContainer}>
            <Text style={styles.eprTextAreaLabel}>Areas for Improvement</Text>
            <TextInput
              style={styles.eprTextArea}
              value={eprWeaknesses}
              onChangeText={setEprWeaknesses}
              placeholder="Areas for Improvement (Optional)"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
        </View>

        <View style={styles.reportButtonsRow}>
          <Button
            title={eprGenerating ? 'Generating Draft Report...' : 'Generate Draft Report'}
            onPress={handleGenerateEPR}
            disabled={eprGenerating}
            loading={eprGenerating}
            fullWidth
            style={[styles.reportButton, { backgroundColor: colors.semantic.error }]}
          />
          {eprDownloadVisible && (
            <Button
              title="Download PDF Source"
              onPress={handleDownloadEPRSource}
              variant="secondary"
              icon="file-download"
              iconSet="MaterialIcons"
              style={styles.reportButtonSecondary}
            />
          )}
          {eprSubmitVisible && (
            <Button
              title="Submit Report"
              onPress={handleSubmitEPR}
              variant="primary"
              style={[styles.reportButtonSecondary, { backgroundColor: colors.semantic.success }]}
            />
          )}
        </View>

        {eprStatus ? (
          <Card
            style={[
              styles.statusBox,
              eprStatusType === 'success' && { backgroundColor: colors.semantic.success + '20', borderColor: colors.semantic.success + '80' },
              eprStatusType === 'error' && { backgroundColor: colors.semantic.error + '20', borderColor: colors.semantic.error + '80' },
              eprStatusType === 'info' && { backgroundColor: colors.semantic.info + '20', borderColor: colors.semantic.info + '80' },
            ]}
            variant="outlined"
          >
            <Text
              style={[
                styles.statusText,
                eprStatusType === 'success' && { color: '#1B5E20' },
                eprStatusType === 'error' && { color: '#B71C1C' },
                eprStatusType === 'info' && { color: '#0D47A1' },
              ]}
            >
              {eprStatus}
            </Text>
          </Card>
        ) : null}

        <View style={styles.reportOutputContainer}>
          <Text style={styles.reportOutputLabel}>Generated Integrated Report Draft (Editable):</Text>
          <TextInput
            style={styles.reportOutput}
            value={eprReport}
            onChangeText={setEprReport}
            multiline
            placeholder="Enter details and click 'Generate Draft Report' to create an Integrated Performance and Resource Report. You can edit this text before submitting."
            placeholderTextColor={colors.text.tertiary}
            textAlignVertical="top"
          />
        </View>
      </Card>
    </ScrollView>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'analytics' | 'compliance' | 'users' | 'violations' | 'finance' | 'reports'>('overview');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      // Mock data for development
      setVehicles([
        {
          id: '1',
          registrationNumber: 'ABC-123',
          make: 'Toyota',
          model: 'Hilux',
          year: 2020,
          type: 'pickup',
          status: 'in_use',
          currentMileage: 45000,
          fuelType: 'Diesel',
          assignedDriverId: 'driver_1',
          lastInspectionDate: '2024-12-01',
          nextServiceDate: '2025-02-01',
          createdAt: '2020-01-01',
          updatedAt: '2024-12-15',
        },
        {
          id: '2',
          registrationNumber: 'XYZ-789',
          make: 'Nissan',
          model: 'Navara',
          year: 2021,
          type: 'pickup',
          status: 'available',
          currentMileage: 32000,
          fuelType: 'Diesel',
          createdAt: '2021-01-01',
          updatedAt: '2024-12-15',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for various sections
  const fleetStats = {
    totalVehicles: vehicles.length || 24,
    inUse: vehicles.filter(v => v.status === 'in_use').length || 18,
    available: vehicles.filter(v => v.status === 'available').length || 4,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length || 2,
  };

  const utilizationData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [65, 78, 82, 75, 88, 45, 30],
      color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const driverPerformanceData = [
    { driver: 'John Doe', speeding: 2, harshBraking: 1, idleTime: '2.5h', score: 85 },
    { driver: 'Jane Smith', speeding: 0, harshBraking: 0, idleTime: '1.2h', score: 95 },
    { driver: 'Mike Johnson', speeding: 5, harshBraking: 3, idleTime: '4.1h', score: 70 },
  ];

  const complianceData = {
    licensesExpiring: 3,
    waiversPending: 2,
    inspectionsDue: 5,
  };

  // Financial Data
  const financialData: FinancialData = {
    totalOperationalCost: 185200.50,
    totalFuelCost: 75900.25,
    totalDistance: 125400,
    costPerKm: 1.47,
    costCenterBreakdown: [
      { center: 'Health Programs', cost: 55000, km: 35000, color: colors.semantic.error },
      { center: 'Education & Child Protection', cost: 42500, km: 30000, color: colors.semantic.info },
      { center: 'Administration & HR', cost: 35200, km: 25000, color: colors.semantic.warning },
      { center: 'WASH & Infrastructure', cost: 52500, km: 35400, color: colors.semantic.success },
    ],
    monthlyFuelConsumption: [
      { month: 'Jan', consumption: 3500, cost: 12000 },
      { month: 'Feb', consumption: 3200, cost: 11500 },
      { month: 'Mar', consumption: 4000, cost: 14000 },
      { month: 'Apr', consumption: 3800, cost: 13500 },
      { month: 'May', consumption: 4500, cost: 15500 },
      { month: 'Jun', consumption: 4100, cost: 14400 },
    ],
  };

  // Audit Report State
  const [auditReport, setAuditReport] = useState('');
  const [auditStatus, setAuditStatus] = useState('');
  const [auditStatusType, setAuditStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [auditGenerating, setAuditGenerating] = useState(false);
  const [auditDownloadVisible, setAuditDownloadVisible] = useState(false);
  const [auditSubmitVisible, setAuditSubmitVisible] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return colors.semantic.success;
      case 'in_use':
        return colors.semantic.info;
      case 'maintenance':
        return colors.semantic.warning;
      case 'out_of_service':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getPointsStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return colors.semantic.success;
      case 'good':
        return colors.semantic.info;
      case 'warning':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  const formatCurrency = (amount: number) => {
    return `ZMW ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleGenerateAudit = async () => {
    try {
      setAuditGenerating(true);
      setAuditStatus('Preparing detailed financial audit summary...');
      setAuditStatusType('info');
      
      const report = await financeReportService.generateAuditReport(financialData);
      setAuditReport(report);
      setAuditStatus('Financial Audit Summary generated successfully. Review, download the source, or submit.');
      setAuditStatusType('success');
      setAuditDownloadVisible(true);
      setAuditSubmitVisible(true);
    } catch (error: any) {
      setAuditStatus(`Audit Generation failed: ${error.message}`);
      setAuditStatusType('error');
      Alert.alert('Error', error.message || 'Failed to generate audit report');
    } finally {
      setAuditGenerating(false);
    }
  };

  const handleDownloadAuditSource = () => {
    setAuditStatus('The Audit Summary content is ready for PDF compilation. Copy the generated text and paste it into the audit_summary.tex file.');
    setAuditStatusType('info');
  };

  const handleSubmitAudit = async () => {
    if (!auditReport || auditReport.includes("Click 'Generate Audit Report'")) {
      setAuditStatus('Please generate the report content before submission.');
      setAuditStatusType('error');
      return;
    }
    
    // Mock submission - replace with API call in production
    setAuditStatus('Financial Audit Report submitted to database (mock status: success).');
    setAuditStatusType('success');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderFleetOverview();
      case 'trips':
        return renderTripManagement();
      case 'analytics':
        return renderAnalytics();
      case 'compliance':
        return renderCompliance();
      case 'users':
        return renderUserManagement();
      case 'violations':
        return renderViolations();
      case 'finance':
        return renderFinance();
      case 'reports':
        return renderReports();
      default:
        return null;
    }
  };

  const renderFleetOverview = () => (
    <>
      {/* Fleet Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon name="local-shipping" size="large" color={colors.primary.main} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{fleetStats.totalVehicles}</Text>
          <Text style={styles.statLabel}>Total Vehicles</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="directions-car" size="large" color={colors.semantic.success} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{fleetStats.inUse}</Text>
          <Text style={styles.statLabel}>In Use</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="check-circle" size="large" color={colors.semantic.info} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{fleetStats.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="build" size="large" color={colors.semantic.warning} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{fleetStats.maintenance}</Text>
          <Text style={styles.statLabel}>Maintenance</Text>
        </Card>
      </View>

      {/* Live Map */}
      <Card style={styles.mapCard}>
        <Text style={styles.sectionTitle}>LIVE FLEET LOCATIONS</Text>
        <View style={styles.mapContainer}>
          <WebMapView
            style={styles.map}
            initialLocation={{ latitude: -15.4167, longitude: 28.2833 }} // Lusaka coordinates
            currentLocation={selectedVehicle ? { latitude: -15.4167, longitude: 28.2833 } : undefined}
          />
        </View>
        <Text style={styles.mapNote}>Showing real-time vehicle locations</Text>
      </Card>

      {/* Vehicle List */}
      <Card style={styles.vehicleListCard}>
        <Text style={styles.sectionTitle}>FLEET STATUS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCellReg]}>Registration</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellStatus]}>Status</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellMileage]}>Mileage</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellDriver]}>Driver</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellInspection]}>Last Inspection</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellIncidents]}>Incidents</Text>
            </View>
            {vehicles.map((vehicle, index) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
                onPress={() => setSelectedVehicle(vehicle)}
              >
                <Text style={[styles.tableCellText, styles.tableCellReg]}>{vehicle.registrationNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(vehicle.status) }]}>
                    {vehicle.status.toUpperCase().replace('_', ' ')}
                  </Text>
                </View>
                <Text style={[styles.tableCellText, styles.tableCellMileage]}>{vehicle.currentMileage.toLocaleString()} km</Text>
                <Text style={[styles.tableCellText, styles.tableCellDriver]}>{vehicle.assignedDriverId ? 'Assigned' : 'Unassigned'}</Text>
                <Text style={[styles.tableCellText, styles.tableCellInspection]}>
                  {vehicle.lastInspectionDate ? new Date(vehicle.lastInspectionDate).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={[styles.tableCellText, styles.tableCellIncidents]}>0</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Card>
    </>
  );

  const renderTripManagement = () => (
    <>
      <Card style={styles.actionCard}>
        <Text style={styles.sectionTitle}>ASSIGN VEHICLE TO DRIVER</Text>
        <View style={styles.assignForm}>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Select Vehicle</Text>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Choose Vehicle</Text>
                <Icon name="keyboard-arrow-down" size="small" color={colors.text.secondary} iconSet="MaterialIcons" />
              </TouchableOpacity>
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Select Driver</Text>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Choose Driver</Text>
                <Icon name="keyboard-arrow-down" size="small" color={colors.text.secondary} iconSet="MaterialIcons" />
              </TouchableOpacity>
            </View>
          </View>
          <Button
            title="Assign Vehicle"
            onPress={() => {}}
            variant="primary"
            fullWidth
            icon="assignment"
            iconSet="MaterialIcons"
          />
        </View>
      </Card>

      <Card style={styles.listCard}>
        <Text style={styles.sectionTitle}>ACTIVE TRIPS</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.tripItem}>
            <View style={styles.tripItemHeader}>
              <Text style={styles.tripVehicle}>ABC-{item}23</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.semantic.info + '20' }]}>
                <Text style={[styles.statusText, { color: colors.semantic.info }]}>IN PROGRESS</Text>
              </View>
            </View>
            <Text style={styles.tripDriver}>Driver: John Doe</Text>
            <Text style={styles.tripDestination}>Destination: Field Office</Text>
            <Text style={styles.tripTime}>Started: 2 hours ago</Text>
          </View>
        ))}
      </Card>
    </>
  );

  const renderAnalytics = () => (
    <>
      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>FLEET UTILIZATION</Text>
        <SimpleChart data={utilizationData} />
      </Card>

      <Card style={styles.driverPerformanceCard}>
        <Text style={styles.sectionTitle}>DRIVER PERFORMANCE METRICS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCellDriverName]}>Driver</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellMetric]}>Speeding</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellMetric]}>Harsh Braking</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellMetric]}>Idle Time</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellScore]}>Score</Text>
            </View>
            {driverPerformanceData.map((driver, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tableCellText, styles.tableCellDriverName]}>{driver.driver}</Text>
                <Text style={[styles.tableCellText, styles.tableCellMetric]}>{driver.speeding}</Text>
                <Text style={[styles.tableCellText, styles.tableCellMetric]}>{driver.harshBraking}</Text>
                <Text style={[styles.tableCellText, styles.tableCellMetric]}>{driver.idleTime}</Text>
                <Text style={[styles.tableCellText, styles.tableCellScore, { color: driver.score >= 80 ? colors.semantic.success : colors.semantic.warning }]}>
                  {driver.score}/100
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>
    </>
  );

  const renderCompliance = () => (
    <>
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon name="warning" size="large" color={colors.semantic.warning} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{complianceData.licensesExpiring}</Text>
          <Text style={styles.statLabel}>Licenses Expiring</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="pending" size="large" color={colors.semantic.info} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{complianceData.waiversPending}</Text>
          <Text style={styles.statLabel}>Waivers Pending</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="assignment" size="large" color={colors.primary.main} iconSet="MaterialIcons" />
          <Text style={styles.statValue}>{complianceData.inspectionsDue}</Text>
          <Text style={styles.statLabel}>Inspections Due</Text>
        </Card>
      </View>

      <Card style={styles.listCard}>
        <Text style={styles.sectionTitle}>LICENSE EXPIRIES</Text>
        {[
          { driver: 'John Doe', expiry: '2025-01-15', status: 'expiring_soon' },
          { driver: 'Jane Smith', expiry: '2025-02-20', status: 'expiring_soon' },
          { driver: 'Mike Johnson', expiry: '2025-03-10', status: 'valid' },
        ].map((item, index) => (
          <View key={index} style={styles.complianceItem}>
            <Text style={styles.complianceItemDriver}>{item.driver}</Text>
            <Text style={styles.complianceItemExpiry}>Expires: {new Date(item.expiry).toLocaleDateString()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'expiring_soon' ? colors.semantic.warning + '20' : colors.semantic.success + '20' }]}>
              <Text style={[styles.statusText, { color: item.status === 'expiring_soon' ? colors.semantic.warning : colors.semantic.success }]}>
                {item.status.toUpperCase().replace('_', ' ')}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </>
  );

  const renderUserManagement = () => (
    <>
      <Card style={styles.actionCard}>
        <Text style={styles.sectionTitle}>USER MANAGEMENT</Text>
        <Button
          title="Add New User"
          onPress={() => {}}
          variant="primary"
          fullWidth
          icon="person-add"
          iconSet="MaterialIcons"
          style={styles.exportButton}
        />
      </Card>

      <Card style={styles.listCard}>
        <Text style={styles.sectionTitle}>ALL USERS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCellUser]}>User</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellRole]}>Role</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellVehicles]}>Vehicles</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellAccess]}>Access Level</Text>
            </View>
            {[
              { user: 'John Doe', role: 'Driver', vehicles: ['ABC-123', 'XYZ-789'], access: 'Standard' },
              { user: 'Jane Smith', role: 'Driver', vehicles: ['DEF-456'], access: 'Standard' },
            ].map((item, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tableCellText, styles.tableCellUser]}>{item.user}</Text>
                <Text style={[styles.tableCellText, styles.tableCellRole]}>{item.role}</Text>
                <Text style={[styles.tableCellText, styles.tableCellVehicles]}>{item.vehicles.join(', ')}</Text>
                <Text style={[styles.tableCellText, styles.tableCellAccess]}>{item.access}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>
    </>
  );

  const renderViolations = () => (
    <>
      <Card style={styles.listCard}>
        <Text style={styles.sectionTitle}>RECENT VIOLATIONS</Text>
        {[
          { driver: 'John Doe', violation: 'Speeding', points: 3, date: '2024-12-10', status: 'active' },
          { driver: 'Mike Johnson', violation: 'Harsh Braking', points: 2, date: '2024-12-08', status: 'active' },
          { driver: 'John Doe', violation: 'Idle Time Exceeded', points: 1, date: '2024-12-05', status: 'active' },
        ].map((item, index) => (
          <View key={index} style={styles.violationItem}>
            <Text style={styles.violationDriver}>{item.driver}</Text>
            <Text style={styles.violationType}>{item.violation}</Text>
            <Text style={styles.violationPoints}>-{item.points} points</Text>
            <Text style={styles.violationDate}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.pointsSummaryCard}>
        <Text style={styles.sectionTitle}>DRIVER POINTS SUMMARY</Text>
        {[
          { driver: 'John Doe', totalPoints: 4, status: 'warning' },
          { driver: 'Mike Johnson', totalPoints: 2, status: 'good' },
          { driver: 'Jane Smith', totalPoints: 0, status: 'excellent' },
        ].map((item, index) => (
          <View key={index} style={styles.pointsItem}>
            <Text style={styles.pointsDriver}>{item.driver}</Text>
            <View style={[styles.pointsBadge, { backgroundColor: getPointsStatusColor(item.status) + '20' }]}>
              <Text style={[styles.pointsText, { color: getPointsStatusColor(item.status) }]}>
                {item.totalPoints} points
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </>
  );

  const renderFinance = () => (
    <>
      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <Card style={styles.kpiCard}>
          <View style={[styles.kpiBorder, { borderColor: colors.semantic.info }]} />
          <Text style={styles.kpiLabel}>Total Operational Cost</Text>
          <Text style={styles.kpiValue}>{formatCurrency(financialData.totalOperationalCost)}</Text>
          <Text style={styles.kpiChangePositive}>2.5% increase from last quarter</Text>
        </Card>
        
        <Card style={styles.kpiCard}>
          <View style={[styles.kpiBorder, { borderColor: colors.primary.main }]} />
          <Text style={styles.kpiLabel}>Total Fuel Cost</Text>
          <Text style={styles.kpiValue}>{formatCurrency(financialData.totalFuelCost)}</Text>
          <Text style={styles.kpiChangeNegative}>4.1% over budget</Text>
        </Card>
        
        <Card style={styles.kpiCard}>
          <View style={[styles.kpiBorder, { borderColor: colors.semantic.success }]} />
          <Text style={styles.kpiLabel}>Total Distance Covered</Text>
          <Text style={styles.kpiValue}>{financialData.totalDistance.toLocaleString()} KM</Text>
          <Text style={styles.kpiSubtext}>Total Fleet Activity</Text>
        </Card>
        
        <Card style={styles.kpiCard}>
          <View style={[styles.kpiBorder, { borderColor: colors.accent.terraCotta }]} />
          <Text style={styles.kpiLabel}>Avg Cost per KM</Text>
          <Text style={styles.kpiValue}>ZMW {financialData.costPerKm.toFixed(2)} / KM</Text>
          <Text style={styles.kpiChangeWarning}>Target: ZMW 1.25</Text>
        </Card>
      </View>

      {/* Cost Center Table & Fuel Chart */}
      <View style={styles.chartsContainer}>
        <Card style={styles.costCenterCard}>
          <Text style={styles.sectionTitle}>Cost Center Allocation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.tableCellCostCenter]}>Cost Center</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellCost]}>Total Cost</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellDistance]}>Distance Covered</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellPercentage]}>Percentage (%)</Text>
              </View>
              {financialData.costCenterBreakdown.map((item, index) => {
                const percentage = ((item.cost / financialData.totalOperationalCost) * 100).toFixed(1);
                return (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                    <View style={styles.tableCellCostCenter}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.tableCellText} numberOfLines={2}>{item.center}</Text>
                    </View>
                    <Text style={[styles.tableCellText, styles.tableCellCost]}>{formatCurrency(item.cost)}</Text>
                    <Text style={[styles.tableCellText, styles.tableCellDistance]}>{item.km.toLocaleString()} KM</Text>
                    <Text style={[styles.tableCellText, styles.tableCellPercentage]}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Card>

        <Card style={styles.fuelChartCard}>
          <Text style={styles.sectionTitle}>Monthly Fuel Consumption</Text>
          <InteractiveBarChart
            data={financialData.monthlyFuelConsumption.map(item => item.consumption)}
            labels={financialData.monthlyFuelConsumption.map(item => item.month)}
            height={200}
          />
        </Card>
      </View>

      <Card style={styles.financeCard}>
        <Text style={styles.sectionTitle}>EXPORT TO ACCOUNTING</Text>
        <Button
          title="Export Financial Data"
          onPress={() => {}}
          variant="primary"
          fullWidth
          icon="file-download"
          iconSet="MaterialIcons"
          style={styles.exportButton}
        />
      </Card>
    </>
  );

  const renderReports = () => (
    <>
      <Card style={styles.actionCard}>
        <Text style={styles.sectionTitle}>FINANCIAL AUDIT REPORT</Text>
        <Button
          title="Generate Audit Report"
          onPress={handleGenerateAudit}
          variant="primary"
          fullWidth
          icon="assessment"
          iconSet="MaterialIcons"
          style={styles.exportButton}
          disabled={auditGenerating}
        />
        {auditStatus ? (
          <View style={[styles.statusContainer, { backgroundColor: auditStatusType === 'success' ? colors.semantic.success + '20' : auditStatusType === 'error' ? colors.semantic.error + '20' : colors.semantic.info + '20' }]}>
            <Text style={[styles.statusText, { color: auditStatusType === 'success' ? colors.semantic.success : auditStatusType === 'error' ? colors.semantic.error : colors.semantic.info }]}>
              {auditStatus}
            </Text>
          </View>
        ) : null}
        {auditReport ? (
          <View style={styles.reportContainer}>
            <Text style={styles.reportText}>{auditReport}</Text>
            {auditDownloadVisible && (
              <Button
                title="Download Source"
                onPress={handleDownloadAuditSource}
                variant="secondary"
                fullWidth
                style={styles.exportButton}
              />
            )}
            {auditSubmitVisible && (
              <Button
                title="Submit to Database"
                onPress={handleSubmitAudit}
                variant="primary"
                fullWidth
                style={styles.exportButton}
              />
            )}
          </View>
        ) : null}
      </Card>
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'dashboard' },
          { key: 'trips', label: 'Trips', icon: 'route' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics' },
          { key: 'compliance', label: 'Compliance', icon: 'verified' },
          { key: 'users', label: 'Users', icon: 'people' },
          { key: 'violations', label: 'Violations', icon: 'warning' },
          { key: 'finance', label: 'Finance', icon: 'account-balance' },
          { key: 'reports', label: 'Reports', icon: 'assessment' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Icon
              name={tab.icon}
              size="small"
              color={activeTab === tab.key ? colors.primary.main : colors.text.secondary}
              iconSet="MaterialIcons"
            />
            <Text 
              style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
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
  // Finance Dashboard Styles
  financeContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  financeHeader: {
    padding: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginBottom: spacing[4],
  },
  financeHeaderTitle: {
    ...typography.styles.h1,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing[4],
    gap: spacing[4],
  },
  kpiCard: {
    width: '47%',
    padding: spacing[4],
    position: 'relative',
  },
  kpiBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  kpiLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[2],
  },
  kpiValue: {
    ...typography.styles.h2,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[1],
  },
  kpiChangePositive: {
    ...typography.styles.caption,
    color: colors.semantic.success,
  },
  kpiChangeNegative: {
    ...typography.styles.caption,
    color: colors.semantic.error,
  },
  kpiChangeWarning: {
    ...typography.styles.caption,
    color: colors.semantic.warning,
  },
  kpiSubtext: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  chartsContainer: {
    padding: spacing[4],
    gap: spacing[4],
  },
  costCenterCard: {
    padding: spacing[4],
  },
  fuelChartCard: {
    padding: spacing[4],
  },
  tableScroll: {
    maxHeight: 400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tableHeaderText: {
    ...typography.styles.caption,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tableRowEven: {
    backgroundColor: colors.gray[50],
  },
  tableCellCostCenter: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  tableCellCost: {
    flex: 1.5,
  },
  tableCellDistance: {
    flex: 1.5,
  },
  tableCellPercentage: {
    flex: 1,
  },
  tableCellText: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
  },
  tableCellBold: {
    fontWeight: typography.fontWeight.bold,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chart: {
    marginVertical: spacing[2],
    borderRadius: 16,
  },
  reportSection: {
    margin: spacing[4],
    padding: spacing[4],
  },
  reportSectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[2],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  reportSectionDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  reportButtonsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
    flexWrap: 'wrap',
  },
  reportButton: {
    flex: 1,
    minWidth: 150,
  },
  reportButtonSecondary: {
    paddingHorizontal: spacing[4],
  },
  statusBox: {
    padding: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
  },
  statusText: {
    ...typography.styles.bodySmall,
  },
  reportOutputContainer: {
    marginTop: spacing[4],
  },
  reportOutputLabel: {
    ...typography.styles.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  reportOutput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    padding: spacing[4],
    minHeight: 150,
    ...typography.styles.body,
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'top',
    }),
  },
  eprInputRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  eprInput: {
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  eprTextAreasRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  eprTextAreaContainer: {
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  eprTextAreaLabel: {
    ...typography.styles.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  eprTextArea: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    padding: spacing[3],
    minHeight: 120,
    ...typography.styles.body,
    color: colors.text.primary,
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'top',
    }),
  },
  // Fleet Manager Dashboard Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  tabContainer: {
    maxHeight: Platform.OS === 'android' ? 70 : 60, // Increased height on Android
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2], // Add horizontal padding
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3], // Reduced from spacing[4] to allow more space for text
    paddingVertical: spacing[2],
    marginHorizontal: spacing[1],
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    minWidth: Platform.OS === 'android' ? 90 : undefined, // Ensure minimum width on Android
    flexShrink: 0, // Prevent tabs from shrinking
  },
  tabActive: {
    backgroundColor: colors.primary.main + '15',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  tabLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    fontWeight: typography.fontWeight.medium,
    fontSize: Platform.OS === 'android' ? 12 : undefined, // Slightly smaller font on Android
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
  tabLabelActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing[4],
    gap: spacing[3],
  },
  mapCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: spacing[3],
    backgroundColor: colors.gray[200],
  },
  map: {
    flex: 1,
  },
  mapNote: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  vehicleListCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  tableCellReg: {
    width: 100,
  },
  tableCellStatus: {
    width: 120,
  },
  tableCellMileage: {
    width: 100,
  },
  tableCellDriver: {
    width: 120,
  },
  tableCellUser: {
    width: 150,
  },
  tableCellRole: {
    width: 120,
  },
  tableCellVehicles: {
    width: 200,
  },
  tableCellAccess: {
    width: 120,
  },
  tableCellInspection: {
    width: 120,
  },
  tableCellIncidents: {
    width: 80,
  },
  tableCellDriverName: {
    width: 150,
  },
  tableCellMetric: {
    width: 100,
  },
  tableCellScore: {
    width: 80,
  },
  assignForm: {
    marginTop: spacing[4],
  },
  formField: {
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  formLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontWeight: typography.fontWeight.medium,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: spacing[3],
    backgroundColor: colors.background.primary,
  },
  selectButtonText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  listCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  tripItem: {
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginTop: spacing[2],
  },
  tripItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  tripVehicle: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  tripDriver: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  tripDestination: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  tripTime: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing[4],
    gap: spacing[3],
  },
  analyticsCard: {
    width: '48%',
    padding: spacing[4],
  },
  analyticsTitle: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  analyticsValue: {
    ...typography.styles.h2,
    color: colors.primary.main,
    marginBottom: spacing[1],
  },
  analyticsSubtext: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  chartCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  driverPerformanceCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  maintenanceCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  maintenanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginTop: spacing[2],
  },
  maintenanceInfo: {
    marginLeft: spacing[3],
    flex: 1,
  },
  maintenanceTitle: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  maintenanceSubtext: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing[4],
    gap: spacing[3],
  },
  complianceCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing[4],
  },
  complianceValue: {
    ...typography.styles.h2,
    color: colors.primary.main,
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  complianceLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  complianceButton: {
    marginTop: spacing[2],
  },
  complianceListCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  complianceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginTop: spacing[2],
  },
  complianceItemInfo: {
    flex: 1,
  },
  complianceItemDriver: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  complianceItemExpiry: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  userForm: {
    marginTop: spacing[4],
  },
  userListCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginTop: spacing[2],
  },
  userItemInfo: {
    flex: 1,
  },
  userItemName: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userItemRole: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  userItemVehicles: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  editButton: {
    padding: spacing[2],
  },
  violationsCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  violationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginTop: spacing[2],
  },
  violationItemInfo: {
    flex: 1,
  },
  violationDriver: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  violationType: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  violationDate: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  violationPoints: {
    alignItems: 'center',
    marginLeft: spacing[3],
  },
  violationPointsText: {
    ...typography.styles.h3,
    color: colors.semantic.error,
    fontWeight: typography.fontWeight.bold,
  },
  violationPointsLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  pointsSummaryCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  pointsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginTop: spacing[2],
  },
  pointsDriver: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  pointsBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  pointsText: {
    ...typography.styles.bodySmall,
    fontWeight: typography.fontWeight.bold,
  },
  financeCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  exportButton: {
    marginTop: spacing[4],
  },
  statusContainer: {
    padding: spacing[3],
    borderRadius: 8,
    marginTop: spacing[3],
  },
  reportContainer: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    maxHeight: 300,
  },
  reportText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontSize: 12,
    lineHeight: 18,
  },
});
