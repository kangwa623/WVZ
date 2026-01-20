import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';

export default function ViolationsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [violations, setViolations] = useState<any[]>([]);

  const violationPoints = user?.violationPoints || 0;
  const threshold = 10;
  const isNearThreshold = violationPoints >= threshold * 0.7;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.pointsCard}>
        <View style={styles.pointsHeader}>
          <Icon name="warning" size="xlarge" color={isNearThreshold ? 'warning' : 'primary'} />
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Violation Points</Text>
            <Text style={[styles.pointsValue, isNearThreshold && styles.pointsValueWarning]}>
              {violationPoints} / {threshold}
            </Text>
          </View>
        </View>
        {isNearThreshold && (
          <View style={styles.warningBanner}>
            <Icon name="error" size="medium" color="error" />
            <Text style={styles.warningText}>
              You are approaching the violation threshold. Please drive safely.
            </Text>
          </View>
        )}
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Violation History</Text>
        {violations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="check-circle" size="xlarge" color="success" />
            <Text style={styles.emptyText}>No violations recorded</Text>
            <Text style={styles.emptySubtext}>Keep up the good work!</Text>
          </Card>
        ) : (
          violations.map((violation) => (
            <Card key={violation.id} style={styles.violationCard}>
              <View style={styles.violationHeader}>
                <Icon name="error" size="medium" color="error" />
                <View style={styles.violationInfo}>
                  <Text style={styles.violationType}>{violation.type}</Text>
                  <Text style={styles.violationDate}>
                    {new Date(violation.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.violationPoints}>-{violation.points}</Text>
              </View>
              {violation.description && (
                <Text style={styles.violationDescription}>{violation.description}</Text>
              )}
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  pointsCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  pointsLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  pointsValue: {
    ...typography.styles.h1,
    color: colors.primary.main,
  },
  pointsValueWarning: {
    color: colors.semantic.warning,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.warning + '20',
    padding: spacing[3],
    borderRadius: 8,
    marginTop: spacing[4],
  },
  warningText: {
    ...typography.styles.bodySmall,
    color: colors.semantic.warning,
    marginLeft: spacing[2],
    flex: 1,
  },
  section: {
    padding: spacing[4],
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginTop: spacing[4],
  },
  emptySubtext: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  violationCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  violationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  violationInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  violationType: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[1],
  },
  violationDate: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  violationPoints: {
    ...typography.styles.h4,
    color: colors.semantic.error,
  },
  violationDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
});
