import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useTaskStore } from '@/store/useTaskStore';
import ReminderItem from '@/components/ReminderItem';
import StatusButton from '@/components/StatusButton';
import StepGuide from '@/components/StepGuide';
import type { DriverResponse } from '@/types';
import styles from './index.module.scss';

type FilterType = 'all' | 'pending' | 'responded' | 'warning';

const RemindersPage: React.FC = () => {
  const {
    reminders,
    tasks,
    selectedTaskId,
    setSelectedTask,
    activeReminderId,
    setActiveReminder,
    respondToReminder,
    guideSteps,
    completeGuideStep,
    resetGuideSteps
  } = useTaskStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedResponse, setSelectedResponse] = useState<DriverResponse | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const pendingCount = useMemo(
    () => reminders.filter(r => r.triggered && !r.responded).length,
    [reminders]
  );
  const warningCount = useMemo(
    () => reminders.filter(r => r.type === 'temp_warning' && r.triggered && !r.responded).length,
    [reminders]
  );
  const respondedCount = useMemo(
    () => reminders.filter(r => r.responded).length,
    [reminders]
  );

  const activeReminder = useMemo(
    () => reminders.find(r => r.id === activeReminderId),
    [reminders, activeReminderId]
  );

  const filteredReminders = useMemo(() => {
    let result = reminders;
    if (selectedTaskId) {
      result = result.filter(r => r.taskId === selectedTaskId);
    }
    switch (filter) {
      case 'pending':
        return result.filter(r => r.triggered && !r.responded);
      case 'responded':
        return result.filter(r => r.responded);
      case 'warning':
        return result.filter(r => r.type === 'temp_warning');
      default:
        return result;
    }
  }, [reminders, filter, selectedTaskId]);

  const pendingReminders = useMemo(
    () => filteredReminders.filter(r => r.triggered && !r.responded),
    [filteredReminders]
  );
  const respondedReminders = useMemo(
    () => filteredReminders.filter(r => r.responded),
    [filteredReminders]
  );
  const upcomingReminders = useMemo(
    () => filteredReminders.filter(r => !r.triggered),
    [filteredReminders]
  );

  const handleRespond = (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    setActiveReminder(reminderId);
    setSelectedResponse(null);
    setPhotoUrl(null);
    if (reminder.type === 'temp_warning') {
      resetGuideSteps();
    }
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setActiveReminder(null);
    setSelectedResponse(null);
    setPhotoUrl(null);
  };

  const handleTakePhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sourceType: ['camera'],
        sizeType: ['compressed']
      });
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setPhotoUrl(res.tempFilePaths[0]);
      }
    } catch (error) {
      console.error('[Reminders] 拍照失败:', error);
      Taro.showToast({
        title: '拍照失败',
        icon: 'error'
      });
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
  };

  const handleViewPhoto = (url: string) => {
    Taro.previewImage({
      urls: [url],
      current: url
    });
  };

  const handleSubmitResponse = () => {
    if (!activeReminderId || !selectedResponse) {
      Taro.showToast({
        title: '请选择状态',
        icon: 'none'
      });
      return;
    }

    if (activeReminder?.type === 'temp_warning') {
      const allStepsCompleted = guideSteps.every(s => s.completed);
      if (!allStepsCompleted) {
        Taro.showToast({
          title: '请完成所有检查步骤',
          icon: 'none'
        });
        return;
      }
    }

    respondToReminder(activeReminderId, selectedResponse, photoUrl || undefined);
    Taro.showToast({
      title: '提交成功',
      icon: 'success'
    });
    handleClosePanel();
  };

  const handleTaskFilter = (taskId: string | null) => {
    setSelectedTask(taskId || tasks[0]?.id);
  };

  return (
    <>
      <View className={styles.mask} onClick={handleClosePanel} />

      <ScrollView className={styles.pageContainer} scrollY>
        <View className={styles.pageHeader}>
          <Text className={styles.pageTitle}>途中提醒</Text>
          <Text className={styles.pageSubtitle}>及时响应提醒，确保运输安全</Text>
        </View>

        <View className={styles.statsBar}>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.warning)}>{pendingCount}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, 'warning' && warningCount > 0)}>{warningCount}</Text>
            <Text className={styles.statLabel}>温度预警</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.success)}>{respondedCount}</Text>
            <Text className={styles.statLabel}>已处理</Text>
          </View>
        </View>

        <ScrollView className={styles.filterBar} scrollX showScrollbar={false}>
          <View
            className={classnames(styles.filterItem, !selectedTaskId && styles.active)}
            onClick={() => handleTaskFilter(null)}
          >
            <Text className={styles.filterText}>全部任务</Text>
          </View>
          {tasks.map(task => (
            <View
              key={task.id}
              className={classnames(styles.filterItem, selectedTaskId === task.id && styles.active)}
              onClick={() => handleTaskFilter(task.id)}
            >
              <Text className={styles.filterText}>{task.cargoName.slice(0, 6)}</Text>
            </View>
          ))}
        </ScrollView>

        <View className={styles.filterBar}>
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待处理' },
            { key: 'warning', label: '温度预警' },
            { key: 'responded', label: '已处理' }
          ].map(item => (
            <View
              key={item.key}
              className={classnames(styles.filterItem, filter === item.key && styles.active)}
              onClick={() => setFilter(item.key as FilterType)}
            >
              <Text className={styles.filterText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.reminderList}>
          {pendingReminders.length > 0 && (
            <>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>待处理</Text>
                <Text className={styles.sectionCount}>{pendingReminders.length}条</Text>
              </View>
              {pendingReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onRespond={handleRespond}
                  onViewPhoto={handleViewPhoto}
                />
              ))}
            </>
          )}

          {upcomingReminders.length > 0 && (
            <>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>即将触发</Text>
                <Text className={styles.sectionCount}>{upcomingReminders.length}条</Text>
              </View>
              {upcomingReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onViewPhoto={handleViewPhoto}
                />
              ))}
            </>
          )}

          {respondedReminders.length > 0 && (
            <>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>已处理</Text>
                <Text className={styles.sectionCount}>{respondedReminders.length}条</Text>
              </View>
              {respondedReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onViewPhoto={handleViewPhoto}
                />
              ))}
            </>
          )}

          {filteredReminders.length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🔔</Text>
              <Text className={styles.emptyText}>暂无相关提醒</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={classnames(styles.responsePanel, showPanel && styles.visible)}>
        {activeReminder && (
          <>
            <View className={styles.panelHeader}>
              <Text className={styles.panelTitle}>处理提醒</Text>
              <View className={styles.closeBtn} onClick={handleClosePanel}>
                <Text className={styles.closeIcon}>✕</Text>
              </View>
            </View>

            <View className={styles.panelContent}>
              <Text className={styles.panelReminderTitle}>{activeReminder.title}</Text>
              <Text className={styles.panelReminderContent}>{activeReminder.content}</Text>
            </View>

            {activeReminder.type === 'temp_warning' && (
              <View className={styles.guideSection}>
                <StepGuide
                  steps={guideSteps}
                  onStepComplete={completeGuideStep}
                  title="请按顺序检查排除原因"
                />
              </View>
            )}

            <Text
              style={{
                fontSize: '28rpx',
                fontWeight: 500,
                color: '#1D2129',
                marginBottom: '24rpx'
              }}
            >
              请选择当前状态
            </Text>

            <View className={styles.statusButtons}>
              <StatusButton
                type="temp_normal"
                selected={selectedResponse === 'temp_normal'}
                onClick={() => setSelectedResponse('temp_normal')}
              />
              <StatusButton
                type="refuel_no_open"
                selected={selectedResponse === 'refuel_no_open'}
                onClick={() => setSelectedResponse('refuel_no_open')}
              />
              <StatusButton
                type="fluctuation_found"
                selected={selectedResponse === 'fluctuation_found'}
                onClick={() => setSelectedResponse('fluctuation_found')}
              />
              <StatusButton
                type="checked_ok"
                selected={selectedResponse === 'checked_ok'}
                onClick={() => setSelectedResponse('checked_ok')}
              />
            </View>

            <Text
              style={{
                fontSize: '28rpx',
                fontWeight: 500,
                color: '#1D2129',
                marginBottom: '24rpx'
              }}
            >
              仪表照片（可选）
            </Text>

            <View className={styles.photoSection}>
              {photoUrl ? (
                <View className={styles.photoPreview}>
                  <Image src={photoUrl} className={styles.previewImg} mode="aspectFill" />
                  <View className={styles.removePhotoBtn} onClick={handleRemovePhoto}>
                    <Text className={styles.removeIcon}>✕</Text>
                  </View>
                </View>
              ) : (
                <View className={styles.photoBtn} onClick={handleTakePhoto}>
                  <Text className={styles.photoIcon}>📷</Text>
                  <Text className={styles.photoText}>拍照片</Text>
                </View>
              )}
            </View>

            <View
              className={classnames(styles.confirmBtn, !selectedResponse && styles.disabled)}
              onClick={handleSubmitResponse}
            >
              <Text className={styles.confirmBtnText}>确认提交</Text>
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default RemindersPage;
