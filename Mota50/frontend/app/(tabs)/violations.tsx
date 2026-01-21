import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import violationService from '@/services/violations';

interface Violation {
  id: string;
  type: string;
  description: string;
  points: number;
  date: string;
  driverId: string;
  tripId?: string;
}

export default function ViolationsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  const violationPoints = user?.violationPoints || 0;
  const threshold = 10;
  const isNearThreshold = violationPoints >= threshold * 0.7;
  const isAtThreshold = violationPoints >= threshold;
  const pointsRemaining = Math.max(0, threshold - violationPoints);
  const pointsPercentage = (violationPoints / threshold) * 100;

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const data = await violationService.getDriverViolations(user.id);
        // Sort by date, most recent first
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setViolations(sorted);
      } else {
        // Mock data for MVP
        setViolations([
          {
            id: '1',
            type: 'Late Return',
            description: 'Vehicle returned 2 hours after scheduled time',
            points: 2,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            driverId: user?.id || 'driver_1',
          },
          {
            id: '2',
            type: 'Speeding',
            description: 'Exceeded speed limit by 15 km/h on Cairo Road',
            points: 3,
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            driverId: user?.id || 'driver_1',
          },
          {
            id: '3',
            type: 'Missed Inspection',
            description: 'Pre-trip inspection not completed before trip start',
            points: 1,
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            driverId: user?.id || 'driver_1',
          },
        ]);
      }
    } catch (error) {
      // Use mock data on error
      setViolations([
        {
          id: '1',
          type: 'Late Return',
          description: 'Vehicle returned 2 hours after scheduled time',
          points: 2,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          driverId: user?.id || 'driver_1',
        },
        {
          id: '2',
          type: 'Speeding',
          description: 'Exceeded speed limit by 15 km/h on Cairo Road',
          points: 3,
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          driverId: user?.id || 'driver_1',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getViolationIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('late') || typeLower.includes('return')) {
      return 'schedule';
    } else if (typeLower.includes('speed')) {
      return 'speed';
    } else if (typeLower.includes('inspection')) {
      return 'assignment';
    } else if (typeLower.includes('braking') || typeLower.includes('harsh')) {
      return 'warning';
    } else if (typeLower.includes('idle')) {
      return 'timer-off';
    }
    return 'error';
  };

  const getViolationColor = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('late') || typeLower.includes('return')) {
      return colors.semantic.warning;
    } else if (typeLower.includes('speed')) {
      return colors.semantic.error;
    } else if (typeLower.includes('inspection')) {
      return colors.semantic.info;
    }
    return colors.semantic.error;
  };

  const getStatusMessage = () => {
    if (isAtThreshold) {
      return 'You have reached the violation threshold. Please contact your supervisor.';
    } else if (isNearThreshold) {
      return `You are approaching the violation threshold. ${pointsRemaining} points remaining before action is required.`;
    } else if (violationPoints === 0) {
      return 'Excellent! No violations recorded. Keep up the good work!';
    } else {
      return `You have ${pointsRemaining} points remaining. Continue driving safely.`;
    }
  };

  const getStatusColor = () => {
    if (isAtThreshold) {
      return colors.semantic.error;
    } else if (isNearThreshold) {
      return colors.semantic.warning;
    } else if (violationPoints === 0) {
      return colors.semantic.success;
    }
    return colors.primary.main;
  };

  const totalPointsDeducted = violations.reduce((sum, v) => sum + v.points, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>M50</Text>
            </View>
            <Text style={styles.brandText}>MOTA50</Text>
          </View>
        </View>

        {/* Violation Points Summary Card */}
        <Card style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <View style={[styles.pointsIconContainer, { backgroundColor: getStatusColor() + '15' }]}>
              <Icon 
                name={isAtThreshold ? 'error' : isNearThreshold ? 'warning' : 'check-circle'} 
                size="xlarge" 
                color={getStatusColor()} 
                iconSet="MaterialIcons"
              />
            </View>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsLabel}>VIOLATION POINTS</Text>
              <View style={styles.pointsValueContainer}>
                <Text style={[styles.pointsValue, { color: getStatusColor() }]}>
                  {violationPoints}
                </Text>
                <Text style={styles.pointsDenominator}>/ {threshold}</Text>
              </View>
              <Text style={styles.pointsSubtext}>
                {pointsRemaining} points remaining
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${Math.min(100, pointsPercentage)}%`,
                  backgroundColor: getStatusColor(),
                }
              ]} 
            />
          </View>

          {/* Status Message */}
          <View style={[styles.statusBanner, { backgroundColor: getStatusColor() + '15' }]}>
            <Icon 
              name={isAtThreshold ? 'error' : isNearThreshold ? 'warning' : 'info'} 
              size="small" 
              color={getStatusColor()} 
              iconSet="MaterialIcons"
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusMessage()}
            </Text>
          </View>
        </Card>

        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Icon name="error" size="medium" color={colors.semantic.error} iconSet="MaterialIcons" />
            <Text style={styles.statValue}>{violations.length}</Text>
            <Text style={styles.statLabel}>Total Violations</Text>
          </Card>
          <Card style={styles.statCard}>
            <Icon name="remove-circle" size="medium" color={colors.semantic.error} iconSet="MaterialIcons" />
            <Text style={styles.statValue}>-{totalPointsDeducted}</Text>
            <Text style={styles.statLabel}>Points Deducted</Text>
          </Card>
        </View>

        {/* Violation History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VIOLATION HISTORY</Text>
          {loading ? (
            <Card style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text style={styles.loadingText}>Loading violations...</Text>
            </Card>
          ) : violations.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.semantic.success + '15' }]}>
                <Icon name="check-circle" size="xlarge" color={colors.semantic.success} iconSet="MaterialIcons" />
              </View>
              <Text style={styles.emptyText}>No Violations Recorded</Text>
              <Text style={styles.emptySubtext}>Keep up the excellent work! Continue following all safety protocols.</Text>
            </Card>
          ) : (
            violations.map((violation) => {
              const violationColor = getViolationColor(violation.type);
              return (
                <Card key={violation.id} style={styles.violationCard}>
                  <View style={styles.violationHeader}>
                    <View style={[styles.violationIconContainer, { backgroundColor: violationColor + '15' }]}>
                      <Icon 
                        name={getViolationIcon(violation.type)} 
                        size="medium" 
                        color={violationColor} 
                        iconSet="MaterialIcons"
                      />
                    </View>
                    <View style={styles.violationInfo}>
                      <Text style={styles.violationType}>{violation.type}</Text>
                      <View style={styles.violationMeta}>
                        <Icon name="calendar-today" size="small" color={colors.text.tertiary} iconSet="MaterialIcons" />
                        <Text style={styles.violationDate}>
                          {new Date(violation.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                        {violation.tripId && (
                          <>
                            <Text style={styles.violationMetaSeparator}>•</Text>
                            <Icon name="directions-car" size="small" color={colors.text.tertiary} iconSet="MaterialIcons" />
                            <Text style={styles.violationTrip}>Trip #{violation.tripId.slice(-6)}</Text>
                          </>
                        )}
                      </View>
                    </View>
                    <View style={[styles.pointsBadge, { backgroundColor: violationColor + '20' }]}>
                      <Text style={[styles.pointsBadgeText, { color: violationColor }]}>
                        -{violation.points}
                      </Text>
                    </View>
                  </View>
                  {violation.description && (
                    <View style={styles.violationDescriptionContainer}>
                      <Text style={styles.violationDescription}>{violation.description}</Text>
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </View>

        {/* Information Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size="medium" color={colors.semantic.info} iconSet="MaterialIcons" />
            <Text style={styles.infoTitle}>About Violation Points</Text>
          </View>
          <Text style={styles.infoText}>
            Violation points are deducted for various infractions including late vehicle returns, 
            speeding violations, missed inspections, harsh braking incidents, and excessive idle time. 
            Points accumulate and reaching the threshold may result in disciplinary action.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[2],
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
  pointsCard: {
    margin: spacing[4],
    padding: spacing[5],
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  pointsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  pointsLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing[2],
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  pointsValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing[1],
  },
  pointsValue: {
    ...typography.styles.h1,
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  pointsDenominator: {
    ...typography.styles.h3,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    fontWeight: typography.fontWeight.regular,
  },
  pointsSubtext: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
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
    borderRadius: 4,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 8,
    marginTop: spacing[2],
  },
  statusText: {
    ...typography.styles.bodySmall,
    marginLeft: spacing[2],
    flex: 1,
    fontWeight: typography.fontWeight.medium,
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
  },
  statValue: {
    ...typography.styles.h2,
    color: colors.primary.main,
    marginTop: spacing[2],
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  section: {
    padding: spacing[4],
  },
  sectionTitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing[4],
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  loadingCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyText: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[2],
    textAlign: 'center',
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
  violationCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  violationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  violationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  violationInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  violationType: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[2],
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  violationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  violationDate: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
  violationMetaSeparator: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginHorizontal: spacing[1],
  },
  violationTrip: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
  pointsBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  pointsBadgeText: {
    ...typography.styles.h4,
    fontWeight: typography.fontWeight.bold,
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  violationDescriptionContainer: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  violationDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
  infoCard: {
    margin: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.semantic.info + '10',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing[2],
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  infoText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
});
