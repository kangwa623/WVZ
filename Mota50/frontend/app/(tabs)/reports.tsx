import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import reportsService, { FinanceReport } from '@/services/reports';

export default function ReportsScreen() {
  const [reports, setReports] = useState<FinanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinanceReport | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getReports();
      setReports(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Refresh reports when screen is focused (real-time updates)
  useFocusEffect(
    React.useCallback(() => {
      loadReports();
    }, [])
  );

  useEffect(() => {
    loadReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.semantic.warning;
      case 'reviewed':
        return colors.semantic.success;
      case 'archived':
        return colors.text.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'audit' ? 'assessment' : 'description';
  };

  const getTypeLabel = (type: string) => {
    return type === 'audit' ? 'Financial Audit' : 'EPR Report';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsReviewed = async (reportId: string) => {
    try {
      await reportsService.updateReportStatus(reportId, 'reviewed');
      await loadReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status: 'reviewed' });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update report status');
    }
  };

  const handleArchive = async (reportId: string) => {
    try {
      await reportsService.updateReportStatus(reportId, 'archived');
      await loadReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to archive report');
    }
  };

  if (selectedReport) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedReport(null)} style={styles.backButton}>
            <Icon name="arrow-back" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <Card style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportHeaderLeft}>
                <Icon
                  name={getTypeIcon(selectedReport.type)}
                  size="large"
                  color={colors.primary.main}
                  iconSet="MaterialIcons"
                />
                <View style={styles.reportHeaderText}>
                  <Text style={styles.reportTitle}>{selectedReport.title}</Text>
                  <Text style={styles.reportMeta}>
                    {getTypeLabel(selectedReport.type)} • {selectedReport.submittedByName} • {formatDate(selectedReport.submittedAt)}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                  {selectedReport.status.toUpperCase()}
                </Text>
              </View>
            </View>
            {selectedReport.eprDetails && (
              <View style={styles.eprDetails}>
                <Text style={styles.eprDetailLabel}>Member: {selectedReport.eprDetails.name}</Text>
                <Text style={styles.eprDetailLabel}>Rank: {selectedReport.eprDetails.rank}</Text>
                <Text style={styles.eprDetailLabel}>Period: {selectedReport.eprDetails.period}</Text>
              </View>
            )}
            <View style={styles.reportContent}>
              <Text style={styles.reportContentText}>{selectedReport.content}</Text>
            </View>
            <View style={styles.reportActions}>
              {selectedReport.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.semantic.success }]}
                  onPress={() => handleMarkAsReviewed(selectedReport.id)}
                >
                  <Icon name="check" size="small" color={colors.base.white} iconSet="MaterialIcons" />
                  <Text style={styles.actionButtonText}>Mark as Reviewed</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.text.tertiary }]}
                onPress={() => handleArchive(selectedReport.id)}
              >
                <Icon name="archive" size="small" color={colors.base.white} iconSet="MaterialIcons" />
                <Text style={styles.actionButtonText}>Archive</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Finance Reports</Text>
        <TouchableOpacity onPress={loadReports} style={styles.refreshButton}>
          <Icon name="refresh" size="medium" color={colors.primary.main} iconSet="MaterialIcons" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReports} tintColor={colors.primary.main} />
        }
      >
        {reports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="description" size="xlarge" color={colors.text.tertiary} iconSet="MaterialIcons" />
            <Text style={styles.emptyText}>No reports received</Text>
            <Text style={styles.emptySubtext}>Reports submitted by finance officers will appear here</Text>
          </Card>
        ) : (
          reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              onPress={() => setSelectedReport(report)}
              style={styles.reportItem}
            >
              <Card style={styles.reportCard}>
                <View style={styles.reportItemHeader}>
                  <View style={styles.reportItemLeft}>
                    <Icon
                      name={getTypeIcon(report.type)}
                      size="medium"
                      color={colors.primary.main}
                      iconSet="MaterialIcons"
                    />
                    <View style={styles.reportItemText}>
                      <Text style={styles.reportItemTitle}>{report.title}</Text>
                      <Text style={styles.reportItemMeta}>
                        {getTypeLabel(report.type)} • {report.submittedByName}
                      </Text>
                      <Text style={styles.reportItemDate}>{formatDate(report.submittedAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.reportItemRight}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                        {report.status.toUpperCase()}
                      </Text>
                    </View>
                    {report.status === 'pending' && (
                      <View style={styles.pendingIndicator} />
                    )}
                  </View>
                </View>
                <Text style={styles.reportItemPreview} numberOfLines={2}>
                  {report.content.substring(0, 150)}...
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
  },
  refreshButton: {
    padding: spacing[1],
  },
  content: {
    flex: 1,
  },
  emptyCard: {
    margin: spacing[4],
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptySubtext: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  reportItem: {
    margin: spacing[4],
  },
  reportCard: {
    padding: spacing[4],
  },
  reportItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  reportItemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  reportItemText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  reportItemTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  reportItemMeta: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  reportItemDate: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  reportItemRight: {
    alignItems: 'flex-end',
  },
  reportItemPreview: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
    marginBottom: spacing[1],
  },
  statusText: {
    ...typography.styles.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  pendingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.warning,
    marginTop: spacing[1],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    ...typography.styles.body,
    color: colors.primary.main,
    marginLeft: spacing[1],
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  reportHeaderText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  reportTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  reportMeta: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  eprDetails: {
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
  },
  eprDetailLabel: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  reportContent: {
    marginBottom: spacing[4],
  },
  reportContentText: {
    ...typography.styles.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  reportActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    ...typography.styles.body,
    color: colors.base.white,
    marginLeft: spacing[2],
    fontWeight: typography.fontWeight.medium,
  },
});
