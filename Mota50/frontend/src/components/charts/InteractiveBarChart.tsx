import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import Card from '@/components/common/Card';

const screenWidth = Dimensions.get('window').width;

interface BarData {
  month: string;
  consumption: number;
  cost: number;
}

interface InteractiveBarChartProps {
  title: string;
  data: BarData[];
  height?: number;
}

export const InteractiveBarChart: React.FC<InteractiveBarChartProps> = ({
  title,
  data,
  height = 250,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const maxConsumption = Math.max(...data.map(d => d.consumption));
  // Reserve more space: title (50px) + tooltip (40px if visible) + month labels (35px) + padding (25px)
  // More space on Android to prevent title overlap
  // On web, reserve less space since we have more room
  const reservedSpace = Platform.OS === 'android' ? 150 : Platform.OS === 'web' ? 100 : 130;
  const chartHeight = Math.max(150, height - reservedSpace); // Ensure minimum chart height
  
  // Calculate available width more accurately
  const cardPadding = spacing[4] * 2; // Left and right padding of card
  const cardMargin = spacing[4] * 2; // Left and right margin of card
  const yAxisWidth = 100; // Space for Y-axis labels
  const chartPadding = spacing[2] * 2; // Padding inside chart container
  const barWrapperMargin = Platform.OS === 'web' ? spacing[2] * 2 : spacing[1] * 2; // Margin on both sides of each bar
  const availableWidth = screenWidth - cardPadding - cardMargin - yAxisWidth - chartPadding;
  
  // Better bar width calculation - wider bars on web, appropriate on mobile
  const totalBarWrapperMargins = barWrapperMargin * data.length;
  const barWidth = Platform.OS === 'web' 
    ? Math.max(50, (availableWidth - totalBarWrapperMargins) / data.length) // Wider bars on web (50px min)
    : Math.max(28, (availableWidth - totalBarWrapperMargins) / data.length); // Appropriate size on mobile (28px min)
  
  // Debug logging (remove in production) - moved after barWidth calculation
  if (Platform.OS === 'web' && __DEV__) {
    console.log('Chart Debug:', {
      height,
      reservedSpace,
      chartHeight,
      maxConsumption,
      barWidth,
      dataLength: data.length,
      availableWidth,
    });
  }

  const handleBarPress = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null); // Deselect if clicking the same bar
    } else {
      setSelectedIndex(index);
    }
  };

  const selectedData = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Tooltip */}
      {selectedData && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {selectedData.month}: {selectedData.consumption.toLocaleString()} Liters
          </Text>
        </View>
      )}

      {/* Chart Container */}
      <View style={[styles.chartContainer, { height: chartHeight }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <Text key={ratio} style={styles.yAxisLabel}>
              {Math.round(maxConsumption * ratio).toLocaleString()}
            </Text>
          ))}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            // Calculate bar height as percentage of chart height
            const barHeightRatio = item.consumption / maxConsumption;
            const barHeight = Math.max(4, barHeightRatio * chartHeight); // Ensure minimum height of 4px
            const isSelected = selectedIndex === index;
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.barWrapper, { width: barWidth }]}
                onPress={() => handleBarPress(index)}
                activeOpacity={0.7}
              >
                <View style={[styles.barContainer, { height: chartHeight }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isSelected ? '#9333EA' : '#60A5FA', // Purple when selected, light blue otherwise
                        width: barWidth,
                        ...(Platform.OS === 'web' ? {
                          // @ts-ignore - Web-specific style
                          position: 'absolute',
                          bottom: 0,
                        } : {}),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.monthLabel}>{item.month}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    margin: spacing[4],
  },
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[5], // Increased spacing to prevent overlap
    paddingBottom: Platform.OS === 'android' ? spacing[2] : 0, // Extra padding on Android
  },
  tooltip: {
    backgroundColor: colors.gray[800],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 6,
    marginBottom: spacing[3],
    alignSelf: 'flex-start',
  },
  tooltipText: {
    ...typography.styles.bodySmall,
    color: colors.base.white,
    fontWeight: typography.fontWeight.medium,
  },
  chartContainer: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.medium,
    paddingLeft: spacing[2],
    paddingBottom: Platform.OS === 'android' ? spacing[8] : spacing[3], // Increased bottom padding on Android for month labels
    paddingTop: spacing[2], // Top padding to separate from title
    marginTop: spacing[2], // Additional margin from title/tooltip
    position: 'relative', // Ensure proper positioning
    overflow: 'visible', // Allow bars to be visible
  },
  yAxisContainer: {
    justifyContent: 'space-between',
    paddingRight: spacing[3],
    marginTop: -spacing[1],
    width: 50, // Fixed width for Y-axis container
  },
  yAxisLabel: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    fontSize: 10,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end', // Align bars to bottom
    justifyContent: Platform.OS === 'web' ? 'space-between' : 'space-around',
    paddingHorizontal: spacing[2],
    minHeight: 150, // Ensure minimum height for bars to render
    height: '100%', // Add explicit height
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      display: 'flex',
      position: 'relative',
    } : {}),
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end', // Align content to bottom
    flexShrink: 0, // Prevent bars from shrinking
    marginHorizontal: Platform.OS === 'web' ? spacing[2] : spacing[1], // Spacing between bars
    height: '100%', // Add explicit height
    ...(Platform.OS === 'android' ? {
      position: 'relative', // Enable absolute positioning for month labels
    } : {}),
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    } : {}),
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end', // Align bar to bottom
    width: '100%',
    height: '100%', // Changed from dynamic height to '100%'
    position: 'relative', // Ensure proper positioning
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      display: 'flex',
      flexDirection: 'column',
    } : {}),
  },
  bar: {
    borderRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4, // Increased minimum height
    width: '100%', // Ensure bar takes full width of container
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style
      transition: 'background-color 0.2s ease',
      cursor: 'pointer',
      display: 'block',
      position: 'absolute',
      bottom: 0, // Position at bottom of container
    } : {}),
  },
  monthLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: Platform.OS === 'android' ? spacing[4] : spacing[3], // Increased spacing on Android to push labels below x-axis
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    minWidth: 30, // Ensure labels don't overlap
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
});

export default InteractiveBarChart;
