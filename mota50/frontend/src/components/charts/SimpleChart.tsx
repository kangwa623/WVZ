import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';

const screenWidth = Dimensions.get('window').width;

interface ChartProps {
  title: string;
  data: any;
  type?: 'line' | 'bar' | 'pie';
}

const chartConfig = {
  backgroundColor: colors.background.primary,
  backgroundGradientFrom: colors.background.primary,
  backgroundGradientTo: colors.background.secondary,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`, // World Vision Orange
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: colors.primary.main,
  },
};

export const SimpleChart: React.FC<ChartProps> = ({ title, data, type = 'line' }) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart
            data={data}
            width={screenWidth - spacing[8] * 2}
            height={220}
            yAxisLabel=""
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={styles.chart}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data}
            width={screenWidth - spacing[8] * 2}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
      case 'line':
      default:
        return (
          <LineChart
            data={data}
            width={screenWidth - spacing[8] * 2}
            height={220}
            yAxisLabel=""
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {renderChart()}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing[4],
    padding: spacing[4],
  },
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  chart: {
    marginVertical: spacing[2],
    borderRadius: 16,
  },
});

export default SimpleChart;
