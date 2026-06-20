import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { TemperatureRange } from '@/types';
import { formatTemp, getTempStatus, getTempStatusColor, getTempStatusText } from '@/utils/temperature';
import styles from './index.module.scss';

interface TemperatureGaugeProps {
  current: number;
  range: TemperatureRange;
  fluctuation: number;
  size?: 'sm' | 'md' | 'lg';
}

const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({
  current,
  range,
  fluctuation,
  size = 'md'
}) => {
  const status = getTempStatus(current, range, fluctuation);
  const statusColor = getTempStatusColor(status);
  const statusText = getTempStatusText(status);

  const totalRange = range.max - range.min + fluctuation * 2;
  const percentage = ((current - (range.min - fluctuation)) / totalRange) * 100;
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return (
    <View className={classnames(styles.gauge, styles[`size${size.toUpperCase()}`])}>
      <View className={styles.gaugeHeader}>
        <Text className={styles.currentTemp} style={{ color: statusColor }}>
          {formatTemp(current)}
        </Text>
        <View className={classnames(styles.statusBadge, styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`])}>
          <Text className={styles.statusText}>{statusText}</Text>
        </View>
      </View>

      <View className={styles.gaugeBar}>
        <View className={styles.barTrack}>
          <View className={styles.barCold} style={{ width: `${(fluctuation / totalRange) * 100}%` }} />
          <View className={styles.barSafe} style={{ width: `${((range.max - range.min) / totalRange) * 100}%` }} />
          <View className={styles.barWarm} style={{ width: `${(fluctuation / totalRange) * 100}%` }} />
        </View>
        <View
          className={styles.indicator}
          style={{ left: `${safePercentage}%`, backgroundColor: statusColor }}
        />
      </View>

      <View className={styles.gaugeLabels}>
        <Text className={styles.labelMin}>{formatTemp(range.min - fluctuation)}</Text>
        <Text className={styles.labelRange}>{formatTemp(range.min)} ~ {formatTemp(range.max)}</Text>
        <Text className={styles.labelMax}>{formatTemp(range.max + fluctuation)}</Text>
      </View>
    </View>
  );
};

export default TemperatureGauge;
