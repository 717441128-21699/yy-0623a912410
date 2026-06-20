import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Task } from '@/types';
import { formatTemp, formatTempRange, getTempStatus, getTempStatusColor } from '@/utils/temperature';
import styles from './index.module.scss';

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isSelected, onSelect }) => {
  const tempStatus = getTempStatus(task.status.currentTemp, task.targetTemp, task.allowedFluctuation);
  const statusColor = getTempStatusColor(tempStatus);

  const statusTextMap = {
    pending: '待出发',
    in_transit: '运输中',
    completed: '已完成'
  };

  const statusClassMap = {
    pending: styles.statusPending,
    in_transit: styles.statusInTransit,
    completed: styles.statusCompleted
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(task.id);
    } else {
      Taro.navigateTo({
        url: `/pages/task-detail/index?id=${task.id}`
      });
    }
  };

  return (
    <View
      className={classnames(styles.taskCard, isSelected && styles.selected)}
      onClick={handleClick}
    >
      <View className={styles.cardHeader}>
        <View className={styles.orderInfo}>
          <Text className={styles.orderNo}>{task.orderNo}</Text>
          <View className={classnames(styles.statusTag, statusClassMap[task.status.status])}>
            <Text className={styles.statusText}>{statusTextMap[task.status.status]}</Text>
          </View>
        </View>
        <View className={styles.cargoTypeTag}>
          <Text className={styles.cargoTypeText}>{task.cargoType}</Text>
        </View>
      </View>

      <View className={styles.cargoInfo}>
        <Text className={styles.cargoName}>{task.cargoName}</Text>
        <Text className={styles.cargoWeight}>{task.cargoWeight}</Text>
      </View>

      <View className={styles.tempSection}>
        <View className={styles.tempTarget}>
          <Text className={styles.tempLabel}>目标温区</Text>
          <Text className={styles.tempRange}>{formatTempRange(task.targetTemp)}</Text>
        </View>
        <View className={styles.tempCurrent}>
          <Text className={styles.tempLabel}>当前温度</Text>
          <Text className={styles.tempValue} style={{ color: statusColor }}>
            {formatTemp(task.status.currentTemp)}
          </Text>
        </View>
        <View className={styles.tempFluctuation}>
          <Text className={styles.tempLabel}>允许波动</Text>
          <Text className={styles.tempValue}>±{task.allowedFluctuation}°C</Text>
        </View>
      </View>

      <View className={styles.routeSection}>
        <View className={styles.routePoint}>
          <View className={styles.routeDotStart} />
          <View className={styles.routeText}>
            <Text className={styles.routeLabel}>装货</Text>
            <Text className={styles.routeAddress}>{task.loadingPoint}</Text>
          </View>
        </View>
        <View className={styles.routeLine} />
        <View className={styles.routePoint}>
          <View className={styles.routeDotEnd} />
          <View className={styles.routeText}>
            <Text className={styles.routeLabel}>送货</Text>
            <Text className={styles.routeAddress}>{task.deliveryPoint}</Text>
          </View>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.footerItem}>
          <Text className={styles.footerLabel}>开门次数</Text>
          <Text className={styles.footerValue}>
            {task.status.doorOpenCount}/{task.expectedDoorOpenings}
          </Text>
        </View>
        <View className={styles.footerItem}>
          <Text className={styles.footerLabel}>预计到达</Text>
          <Text className={styles.footerValue}>{task.estimatedArrival.slice(11, 16)}</Text>
        </View>
        <View className={styles.footerItem}>
          <Text className={styles.footerLabel}>检查点</Text>
          <Text className={styles.footerValue}>
            {task.checkPoints.filter(cp => cp.completed).length}/{task.checkPoints.length}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TaskCard;
