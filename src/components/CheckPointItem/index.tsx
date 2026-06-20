import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { CheckPoint } from '@/types';
import styles from './index.module.scss';

interface CheckPointItemProps {
  checkPoint: CheckPoint;
  isLast?: boolean;
  onComplete?: (cpId: string) => void;
}

const CheckPointItem: React.FC<CheckPointItemProps> = ({ checkPoint, isLast, onComplete }) => {
  const typeIconMap = {
    loading: '装',
    service_area: '服',
    check: '检',
    delivery: '收'
  };

  const typeColorMap = {
    loading: '#00B42A',
    service_area: '#0E6FFF',
    check: '#FF7D00',
    delivery: '#F53F3F'
  };

  const handleClick = () => {
    if (!checkPoint.completed && onComplete) {
      onComplete(checkPoint.id);
    }
  };

  return (
    <View className={styles.checkPointItem}>
      <View className={styles.leftColumn}>
        <View
          className={classnames(
            styles.pointCircle,
            checkPoint.completed && styles.completed
          )}
          style={{ borderColor: checkPoint.completed ? '#00B42A' : typeColorMap[checkPoint.type] }}
        >
          {checkPoint.completed ? (
            <Text className={styles.checkIcon}>✓</Text>
          ) : (
            <Text className={styles.typeIcon}>{typeIconMap[checkPoint.type]}</Text>
          )}
        </View>
        {!isLast && (
          <View
            className={classnames(
              styles.connectLine,
              checkPoint.completed && styles.lineCompleted
            )}
          />
        )}
      </View>

      <View className={styles.rightColumn} onClick={handleClick}>
        <View className={styles.pointHeader}>
          <Text className={styles.pointName}>{checkPoint.name}</Text>
          {checkPoint.eta && (
            <Text className={styles.pointEta}>预计 {checkPoint.eta}</Text>
          )}
        </View>

        {checkPoint.distance && (
          <Text className={styles.pointDistance}>距离 {checkPoint.distance}</Text>
        )}

        {checkPoint.reminderTime && (
          <View className={styles.reminderInfo}>
            <Text className={styles.reminderText}>提醒：{checkPoint.reminderTime}</Text>
          </View>
        )}

        {!checkPoint.completed && onComplete && (
          <View className={styles.actionBtn}>
            <Text className={styles.actionText}>标记完成</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CheckPointItem;
