import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useTaskStore } from '@/store/useTaskStore';
import TaskCard from '@/components/TaskCard';
import TemperatureGauge from '@/components/TemperatureGauge';
import CheckPointItem from '@/components/CheckPointItem';
import { formatTempRange, formatTemp } from '@/utils/temperature';
import type { Task, HandoverSummary } from '@/types';
import styles from './index.module.scss';

type TabType = 'in_transit' | 'pending' | 'completed';

const TasksPage: React.FC = () => {
  const { tasks, selectedTaskId, setSelectedTask, completeCheckPoint, handoverHistories } = useTaskStore();
  const [activeTab, setActiveTab] = useState<TabType>('in_transit');

  const inTransitTasks = useMemo(
    () => tasks.filter(t => t.status.status === 'in_transit'),
    [tasks]
  );
  const pendingTasks = useMemo(
    () => tasks.filter(t => t.status.status === 'pending'),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter(t => t.status.status === 'completed'),
    [tasks]
  );

  const displayTasks = useMemo(() => {
    switch (activeTab) {
      case 'in_transit': return inTransitTasks;
      case 'pending': return pendingTasks;
      case 'completed': return completedTasks;
      default: return inTransitTasks;
    }
  }, [activeTab, inTransitTasks, pendingTasks, completedTasks]);

  useEffect(() => {
    if (displayTasks.length > 0) {
      const currentSelected = tasks.find(t => t.id === selectedTaskId);
      const isSelectedInCurrentTab = currentSelected && displayTasks.some(t => t.id === currentSelected.id);
      if (!isSelectedInCurrentTab) {
        setSelectedTask(displayTasks[0].id);
      }
    }
  }, [activeTab, displayTasks, tasks, selectedTaskId, setSelectedTask]);

  const selectedTask: Task | undefined = useMemo(() => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task && displayTasks.some(t => t.id === task.id)) {
      return task;
    }
    return displayTasks[0];
  }, [tasks, selectedTaskId, displayTasks]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId);
  };

  const handleCheckPointComplete = (checkPointId: string) => {
    if (selectedTask) {
      completeCheckPoint(selectedTask.id, checkPointId);
      Taro.showToast({
        title: '检查点已完成',
        icon: 'success',
        duration: 1500
      });
    }
  };

  const handleViewDetail = () => {
    if (selectedTask) {
      Taro.navigateTo({
        url: `/pages/task-detail/index?id=${selectedTask.id}`
      });
    }
  };

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>今日任务</Text>
        <Text className={styles.pageDate}>{dayjs().format('YYYY年MM月DD日 dddd')}</Text>
      </View>

      <View className={styles.tabSwitcher}>
        <View
          className={classnames(styles.tabItem, activeTab === 'in_transit' && styles.active)}
          onClick={() => setActiveTab('in_transit')}
        >
          <Text className={styles.tabText}>
            运输中
            {inTransitTasks.length > 0 && (
              <Text className={styles.tabBadge}>{inTransitTasks.length}</Text>
            )}
          </Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'pending' && styles.active)}
          onClick={() => setActiveTab('pending')}
        >
          <Text className={styles.tabText}>
            待出发
            {pendingTasks.length > 0 && (
              <Text className={styles.tabBadge}>{pendingTasks.length}</Text>
            )}
          </Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'completed' && styles.active)}
          onClick={() => setActiveTab('completed')}
        >
          <Text className={styles.tabText}>
            已完成
            {completedTasks.length > 0 && (
              <Text className={styles.tabBadge}>{completedTasks.length}</Text>
            )}
          </Text>
        </View>
      </View>

      {displayTasks.length > 0 ? (
        <>
          <View className={styles.taskList}>
            {displayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={task.id === selectedTask?.id}
                onSelect={handleTaskSelect}
              />
            ))}
          </View>

          {selectedTask && activeTab === 'completed' ? (
            <View className={styles.detailSection}>
              <View className={styles.tempGaugeCard}>
                <View className={styles.completedHeader}>
                  <Text className={styles.completedTag}>✓ 已完成</Text>
                  <Text className={styles.completedTime}>
                    完成时间：{dayjs(selectedTask.status.lastCheckTime).format('MM-DD HH:mm')}
                  </Text>
                </View>
                {handoverHistories[selectedTask.id] ? (
                  <View className={styles.completedInfo}>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>订单编号</Text>
                      <Text className={styles.completedInfoValue}>{selectedTask.orderNo}</Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>货物名称</Text>
                      <Text className={styles.completedInfoValue}>{selectedTask.cargoName}</Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>确认到货温度</Text>
                      <Text className={classnames(styles.completedInfoValue, styles.tempConfirmed)}>
                        {formatTemp(handoverHistories[selectedTask.id].tempRecord.arrival)}
                      </Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>目标温区</Text>
                      <Text className={styles.completedInfoValue}>{formatTempRange(selectedTask.targetTemp)}</Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>卸货开始时间</Text>
                      <Text className={styles.completedInfoValue}>
                        {dayjs(handoverHistories[selectedTask.id].unloadingStartTime).format('MM-DD HH:mm')}
                      </Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>收货人</Text>
                      <Text className={styles.completedInfoValue}>
                        {handoverHistories[selectedTask.id].receiverName}
                      </Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>联系电话</Text>
                      <Text className={styles.completedInfoValue}>
                        {handoverHistories[selectedTask.id].receiverPhone}
                      </Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>开门次数</Text>
                      <Text className={styles.completedInfoValue}>{selectedTask.status.doorOpenCount} 次</Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>检查点完成</Text>
                      <Text className={styles.completedInfoValue}>
                        {selectedTask.checkPoints.filter(cp => cp.completed).length}/{selectedTask.checkPoints.length}
                      </Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>交接码</Text>
                      <Text
                        className={classnames(styles.completedInfoValue, styles.summaryCode)}
                        onClick={() => {
                          Taro.setClipboardData({
                            data: handoverHistories[selectedTask.id].summaryCode,
                            success: () => Taro.showToast({ title: '已复制交接码', icon: 'success' })
                          });
                        }}
                      >
                        {handoverHistories[selectedTask.id].summaryCode}
                      </Text>
                    </View>
                    {handoverHistories[selectedTask.id].photos && handoverHistories[selectedTask.id].photos!.length > 0 && (
                      <View className={styles.completedPhotoSection}>
                        <Text className={styles.completedInfoLabel}>仪表照片</Text>
                        <View className={styles.completedPhotoGrid}>
                          {handoverHistories[selectedTask.id].photos!.map((photo, idx) => (
                            <Image
                              key={idx}
                              src={photo}
                              className={styles.completedPhotoItem}
                              mode="aspectFill"
                              onClick={() => Taro.previewImage({
                                urls: handoverHistories[selectedTask.id].photos || [],
                                current: photo
                              })}
                            />
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View className={styles.completedInfo}>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>订单编号</Text>
                      <Text className={styles.completedInfoValue}>{selectedTask.orderNo}</Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>货物名称</Text>
                      <Text className={styles.completedInfoValue}>{selectedTask.cargoName}</Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>目标温区</Text>
                      <Text className={styles.completedInfoValue}>{formatTempRange(selectedTask.targetTemp)}</Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>最后记录温度</Text>
                      <Text className={styles.completedInfoValue}>{formatTemp(selectedTask.status.currentTemp)}</Text>
                    </View>
                    <View className={styles.completedInfoRow}>
                      <Text className={styles.completedInfoLabel}>收货人</Text>
                      <Text className={styles.completedInfoValue}>{selectedTask.receiverName}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : selectedTask ? (
            <View className={styles.detailSection}>
              <View className={styles.tempGaugeCard} onClick={handleViewDetail}>
                <Text className={styles.gaugeTitle}>温度监控</Text>
                <TemperatureGauge
                  current={selectedTask.status.currentTemp}
                  range={selectedTask.targetTemp}
                  fluctuation={selectedTask.allowedFluctuation}
                  size="lg"
                />

                <View className={styles.receiverInfo}>
                  <View className={styles.receiverAvatar}>
                    <Text className={styles.avatarText}>
                      {selectedTask.receiverName.charAt(0)}
                    </Text>
                  </View>
                  <View className={styles.receiverDetail}>
                    <Text className={styles.receiverName}>{selectedTask.receiverName}</Text>
                    <Text className={styles.receiverPhone}>{selectedTask.receiverPhone}</Text>
                  </View>
                </View>

                {selectedTask.specialRequirements && (
                  <View className={styles.specialRequirements}>
                    <Text className={styles.requirementLabel}>📋 特殊要求</Text>
                    <Text className={styles.requirementText}>{selectedTask.specialRequirements}</Text>
                  </View>
                )}
              </View>

              <View className={styles.checkPointsCard}>
                <View className={styles.checkPointsTitle}>
                  关键检查点
                  <Text style={{ fontSize: '24rpx', color: '#86909C', fontWeight: 'normal', marginLeft: '12rpx' }}>
                    {selectedTask.checkPoints.filter(cp => cp.completed).length}/{selectedTask.checkPoints.length}
                  </Text>
                </View>
                <View className={styles.checkPointsList}>
                  {selectedTask.checkPoints.map((cp, index) => (
                    <CheckPointItem
                      key={cp.id}
                      checkPoint={cp}
                      isLast={index === selectedTask.checkPoints.length - 1}
                      onComplete={handleCheckPointComplete}
                    />
                  ))}
                </View>
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>
            暂无{activeTab === 'in_transit' ? '运输中' : activeTab === 'pending' ? '待出发' : '已完成'}任务
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default TasksPage;
