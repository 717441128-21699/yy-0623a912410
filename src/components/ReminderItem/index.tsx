import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { Reminder } from '@/types';
import styles from './index.module.scss';

interface ReminderItemProps {
  reminder: Reminder;
  onRespond?: (reminderId: string) => void;
  onViewPhoto?: (photoUrl: string) => void;
}

const typeIconMap: Record<Reminder['type'], { icon: string; color: string }> = {
  loading_30min: { icon: '⏱', color: 'primary' },
  service_area: { icon: '⛽', color: 'primary' },
  near_delivery: { icon: '📍', color: 'warning' },
  temp_warning: { icon: '🌡', color: 'danger' },
  custom: { icon: '📋', color: 'primary' }
};

const responseTextMap: Record<NonNullable<Reminder['response']>, string> = {
  temp_normal: '温度正常',
  refuel_no_open: '已加油未开厢',
  fluctuation_found: '发现波动',
  checked_ok: '检查正常'
};

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onRespond, onViewPhoto }) => {
  const typeConfig = typeIconMap[reminder.type];

  const formatTime = (timeStr: string) => {
    return timeStr.slice(11, 16);
  };

  return (
    <View
      className={classnames(
        styles.reminderItem,
        reminder.responded && styles.responded,
        !reminder.triggered && styles.pending
      )}
    >
      <View className={styles.reminderHeader}>
        <View className={classnames(styles.typeIcon, styles[`type${typeConfig.color.charAt(0).toUpperCase() + typeConfig.color.slice(1)}`])}>
          <Text className={styles.iconText}>{typeConfig.icon}</Text>
        </View>
        <View className={styles.headerInfo}>
          <Text className={styles.reminderTitle}>{reminder.title}</Text>
          <Text className={styles.triggerTime}>
            {reminder.triggered ? `触发于 ${formatTime(reminder.triggerTime)}` : `预计 ${formatTime(reminder.triggerTime)}`}
          </Text>
        </View>
        {!reminder.responded && reminder.triggered && (
          <View className={styles.pendingBadge}>
            <Text className={styles.pendingText}>待处理</Text>
          </View>
        )}
        {reminder.responded && (
          <View className={styles.respondedBadge}>
            <Text className={styles.respondedText}>已处理</Text>
          </View>
        )}
      </View>

      <View className={styles.reminderContent}>
        <Text className={styles.contentText}>{reminder.content}</Text>
      </View>

      {reminder.response && (
        <View className={styles.responseSection}>
          <View className={styles.responseInfo}>
            <Text className={styles.responseLabel}>司机反馈：</Text>
            <Text className={styles.responseValue}>{responseTextMap[reminder.response]}</Text>
          </View>
          {reminder.responseTime && (
            <Text className={styles.responseTime}>
              响应时间：{formatTime(reminder.responseTime)}
            </Text>
          )}
          {reminder.photoUrl && (
            <View
              className={styles.photoPreview}
              onClick={() => onViewPhoto?.(reminder.photoUrl!)}
            >
              <Image
                src={reminder.photoUrl}
                className={styles.photoImg}
                mode="aspectFill"
              />
              <Text className={styles.photoLabel}>仪表照片</Text>
            </View>
          )}
        </View>
      )}

      {!reminder.responded && reminder.triggered && onRespond && (
        <View className={styles.actionSection}>
          <View
            className={styles.respondBtn}
            onClick={() => onRespond(reminder.id)}
          >
            <Text className={styles.respondText}>立即处理</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReminderItem;
