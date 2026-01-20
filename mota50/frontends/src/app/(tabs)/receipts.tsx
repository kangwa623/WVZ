import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import ReceiptUpload from '@/components/receipts/ReceiptUpload';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import receiptService from '@/services/receipts';

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const data = await receiptService.getReceipts();
      setReceipts(data);
    } catch (error) {
      // Handle error
    }
  };

  const handleUpload = async (receiptData: any) => {
    try {
      const formData = new FormData();
      formData.append('type', receiptData.type);
      formData.append('amount', receiptData.amount.toString());
      formData.append('image', {
        uri: receiptData.imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);
      if (receiptData.description) {
        formData.append('description', receiptData.description);
      }
      if (receiptData.tripId) {
        formData.append('tripId', receiptData.tripId);
      }

      await receiptService.uploadReceipt(formData);
      setShowUpload(false);
      loadReceipts();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload receipt');
    }
  };

  if (showUpload) {
    return (
      <ScrollView style={styles.container}>
        <ReceiptUpload onUpload={handleUpload} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Receipts</Text>
        <TouchableOpacity onPress={() => setShowUpload(true)}>
          <Icon
            name="add"
            size="large"
            color="primary"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {receipts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="receipt" size="xlarge" color="textTertiary" />
            <Text style={styles.emptyText}>No receipts uploaded</Text>
          </Card>
        ) : (
          receipts.map((receipt) => (
            <Card key={receipt.id} style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <Icon
                  name={
                    receipt.type === 'fuel'
                      ? 'local-gas-station'
                      : receipt.type === 'maintenance'
                      ? 'build'
                      : 'receipt'
                  }
                  size="medium"
                  color="primary"
                />
                <View style={styles.receiptInfo}>
                  <Text style={styles.receiptType}>
                    {receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}
                  </Text>
                  <Text style={styles.receiptAmount}>
                    ZMW {receipt.amount.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.receiptDate}>
                  {new Date(receipt.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Card>
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
  content: {
    flex: 1,
  },
  emptyCard: {
    margin: spacing[4],
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[4],
  },
  receiptCard: {
    margin: spacing[4],
    padding: spacing[4],
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  receiptType: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[1],
  },
  receiptAmount: {
    ...typography.styles.h4,
    color: colors.primary.main,
  },
  receiptDate: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
});
