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
import type { Task } from '@/types';
import styles from './index.module.scss';

type TabType = 'in_transit' | 'pending' | 'completed';

const TasksPage: React.FC = () => {
  const { tasks, selectedTaskId, setSelectedTask, completeCheckPoint, handoverHistories } = useTaskStore();
  const [activeTab, setActiveTab] = useState<TabType>('in_transit');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

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
    const currentSelected = tasks.find(t => t.id === selectedTaskId);
    if (currentSelected) {
      const selectedStatus = currentSelected.status.status;
      if (selectedStatus === 'completed' && activeTab !== 'completed') {
        setActiveTab('completed');
        return;
      }
      if (selectedStatus === 'in_transit' && activeTab !== 'in_transit') {
        setActiveTab('in_transit');
        return;
      }
      if (selectedStatus === 'pending' && activeTab !== 'pending') {
        setActiveTab('pending');
        return;
      }
    }
    if (displayTasks.length > 0) {
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

  const currentHistory = useMemo(() => {
    if (!selectedTask) return null;
    return handoverHistories[selectedTask.id] || null;
  }, [selectedTask, handoverHistories]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId);
  };

  const handleCheckPointComplete = (checkPointId: string) => {
    if (selectedTask) {
      completeCheckPoint(selectedTask.id, checkPointId);
      Taro.showToast({ title: '检查点已完成', icon: 'success', duration: 1500 });
    }
  };

  const handleViewDetail = () => {
    if (selectedTask) {
      Taro.navigateTo({ url: `/pages/task-detail/index?id=${selectedTask.id}` });
    }
  };

  const handleCopyCode = (code: string) => {
    Taro.setClipboardData({
      data: code,
      success: () => Taro.showToast({ title: '已复制交接码', icon: 'success' })
    });
  };

  const handleShareSummary = () => {
    if (!currentHistory || !selectedTask) return;
    const text = [
      `【交接摘要】${selectedTask.orderNo}`,
      `货物：${currentHistory.cargoName}`,
      `确认到货温度：${formatTemp(currentHistory.tempRecord.arrival)}`,
      `收货人：${currentHistory.receiverName}`,
      `电话：${currentHistory.receiverPhone}`,
      `卸货开始：${dayjs(currentHistory.unloadingStartTime).format('MM-DD HH:mm')}`,
      `交接码：${currentHistory.summaryCode}`
    ].join('\n');
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: '已复制，可粘贴分享', icon: 'success', duration: 2000 })
    });
  };

  const formatDateTime = (dateStr: string) => dayjs(dateStr).format('MM-DD HH:mm');

  return (
    <>
      <View
        className={classnames(styles.mask, showHistoryPanel && styles.visible)}
        onClick={() => setShowHistoryPanel(false)}
      />

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
              {inTransitTasks.length > 0 && <Text className={styles.tabBadge}>{inTransitTasks.length}</Text>}
            </Text>
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'pending' && styles.active)}
            onClick={() => setActiveTab('pending')}
          >
            <Text className={styles.tabText}>
              待出发
              {pendingTasks.length > 0 && <Text className={styles.tabBadge}>{pendingTasks.length}</Text>}
            </Text>
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'completed' && styles.active)}
            onClick={() => setActiveTab('completed')}
          >
            <Text className={styles.tabText}>
              已完成
              {completedTasks.length > 0 && <Text className={styles.tabBadge}>{completedTasks.length}</Text>}
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
                  {currentHistory ? (
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
                          {formatTemp(currentHistory.tempRecord.arrival)}
                        </Text>
                      </View>
                      <View className={styles.completedInfoRow}>
                        <Text className={styles.completedInfoLabel}>目标温区</Text>
                        <Text className={styles.completedInfoValue}>{formatTempRange(selectedTask.targetTemp)}</Text>
                      </View>
                      <View className={styles.completedInfoRow}>
                        <Text className={styles.completedInfoLabel}>卸货开始时间</Text>
                        <Text className={styles.completedInfoValue}>{formatDateTime(currentHistory.unloadingStartTime)}</Text>
                      </View>
                      <View className={styles.completedInfoRow}>
                        <Text className={styles.completedInfoLabel}>收货人</Text>
                        <Text className={styles.completedInfoValue}>{currentHistory.receiverName}</Text>
                      </View>
                      <View className={styles.completedInfoRow}>
                        <Text className={styles.completedInfoLabel}>联系电话</Text>
                        <Text className={styles.completedInfoValue}>{currentHistory.receiverPhone}</Text>
                      </View>
                      <View className={styles.completedInfoRow}>
                        <Text className={styles.completedInfoLabel}>开门次数</Text>
                        <Text className={styles.completedInfoValue}>{selectedTask.status.doorOpenCount} 次</Text>
                      </View>
                      <View className={styles.completedInfoRow}>
                        <Text className={styles.completedInfoLabel}>交接码</Text>
                        <Text
                          className={classnames(styles.completedInfoValue, styles.summaryCode)}
                          onClick={() => handleCopyCode(currentHistory.summaryCode)}
                        >
                          {currentHistory.summaryCode}
                        </Text>
                      </View>
                      {currentHistory.photos && currentHistory.photos.length > 0 && (
                        <View className={styles.completedPhotoSection}>
                          <Text className={styles.completedInfoLabel}>仪表照片</Text>
                          <View className={styles.completedPhotoGrid}>
                            {currentHistory.photos.map((photo, idx) => (
                              <Image
                                key={idx}
                                src={photo}
                                className={styles.completedPhotoItem}
                                mode="aspectFill"
                                onClick={() => Taro.previewImage({ urls: currentHistory.photos || [], current: photo })}
                              />
                            ))}
                          </View>
                        </View>
                      )}
                      {currentHistory.exceptionRecords && currentHistory.exceptionRecords.length > 0 && (
                        <View className={styles.exceptionSection}>
                          <Text className={styles.exceptionTitle}>⚠ 异常处理记录</Text>
                          {currentHistory.exceptionRecords.map((rec, idx) => (
                            <View key={idx} className={styles.exceptionItem}>
                              <View className={styles.exceptionItemHeader}>
                                <Text className={styles.exceptionItemTime}>{formatDateTime(rec.responseTime)}</Text>
                                <Text className={styles.exceptionItemStatus}>发现波动</Text>
                              </View>
                              {rec.handlingNote && (
                                <Text className={styles.exceptionItemNote}>处理说明：{rec.handlingNote}</Text>
                              )}
                              {rec.photoUrl && (
                                <Image
                                  src={rec.photoUrl}
                                  className={styles.exceptionItemPhoto}
                                  mode="aspectFill"
                                  onClick={() => Taro.previewImage({ urls: [rec.photoUrl!], current: rec.photoUrl! })}
                                />
                              )}
                            </View>
                          ))}
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
                  {currentHistory && (
                    <View className={styles.completedActions}>
                      <View
                        className={styles.historyBtn}
                        onClick={() => setShowHistoryPanel(true)}
                      >
                        <Text className={styles.historyBtnText}>📋 交接历史详情</Text>
                      </View>
                      <View
                        className={styles.shareBtn}
                        onClick={handleShareSummary}
                      >
                        <Text className={styles.shareBtnText}>📤 分享给收货方</Text>
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
                      <Text className={styles.avatarText}>{selectedTask.receiverName.charAt(0)}</Text>
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

      <View className={classnames(styles.historyPanel, showHistoryPanel && styles.visible)}>
        {currentHistory && selectedTask && (
          <>
            <View className={styles.historyPanelHeader}>
              <Text className={styles.historyPanelTitle}>📋 交接历史详情</Text>
              <View className={styles.historyPanelClose} onClick={() => setShowHistoryPanel(false)}>
                <Text className={styles.closeIcon}>✕</Text>
              </View>
            </View>
            <ScrollView className={styles.historyPanelContent} scrollY>
              <View className={styles.historySection}>
                <Text className={styles.historySectionTitle}>基本信息</Text>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>订单编号</Text>
                  <Text className={styles.historyValue}>{selectedTask.orderNo}</Text>
                </View>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>货物名称</Text>
                  <Text className={styles.historyValue}>{currentHistory.cargoName}</Text>
                </View>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>目标温区</Text>
                  <Text className={styles.historyValue}>{formatTempRange(currentHistory.tempRecord.range)}</Text>
                </View>
              </View>

              <View className={styles.historySection}>
                <Text className={styles.historySectionTitle}>温度记录</Text>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>装车温度</Text>
                  <Text className={styles.historyValue}>{formatTemp(currentHistory.tempRecord.loading)}</Text>
                </View>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>平均温度</Text>
                  <Text className={styles.historyValue}>{formatTemp(currentHistory.tempRecord.average)}</Text>
                </View>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>确认到货温度</Text>
                  <Text className={classnames(styles.historyValue, styles.tempConfirmed)}>
                    {formatTemp(currentHistory.tempRecord.arrival)}
                  </Text>
                </View>
              </View>

              <View className={styles.historySection}>
                <Text className={styles.historySectionTitle}>交接信息</Text>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>卸货开始时间</Text>
                  <Text className={styles.historyValue}>{formatDateTime(currentHistory.unloadingStartTime)}</Text>
                </View>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>收货人</Text>
                  <Text className={styles.historyValue}>{currentHistory.receiverName}</Text>
                </View>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>联系电话</Text>
                  <Text className={styles.historyValue}>{currentHistory.receiverPhone}</Text>
                </View>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>开门次数</Text>
                  <Text className={styles.historyValue}>{currentHistory.doorOpenCount} 次</Text>
                </View>
                <View className={styles.historyRow}>
                  <Text className={styles.historyLabel}>检查点完成</Text>
                  <Text className={styles.historyValue}>
                    {currentHistory.completedCheckPoints}/{currentHistory.checkPointCount}
                  </Text>
                </View>
              </View>

              <View className={styles.historySection}>
                <Text className={styles.historySectionTitle}>交接码</Text>
                <View className={styles.historyCodeRow}>
                  <Text className={styles.historyCode}>{currentHistory.summaryCode}</Text>
                  <View
                    className={styles.historyCodeCopy}
                    onClick={() => handleCopyCode(currentHistory.summaryCode)}
                  >
                    <Text className={styles.historyCodeCopyText}>复制</Text>
                  </View>
                </View>
              </View>

              {currentHistory.photos && currentHistory.photos.length > 0 && (
                <View className={styles.historySection}>
                  <Text className={styles.historySectionTitle}>仪表照片</Text>
                  <View className={styles.historyPhotoGrid}>
                    {currentHistory.photos.map((photo, idx) => (
                      <Image
                        key={idx}
                        src={photo}
                        className={styles.historyPhotoItem}
                        mode="aspectFill"
                        onClick={() => Taro.previewImage({ urls: currentHistory.photos || [], current: photo })}
                      />
                    ))}
                  </View>
                </View>
              )}

              {currentHistory.exceptionRecords && currentHistory.exceptionRecords.length > 0 && (
                <View className={styles.historySection}>
                  <Text className={styles.historySectionTitle}>⚠ 异常处理记录</Text>
                  {currentHistory.exceptionRecords.map((rec, idx) => (
                    <View key={idx} className={styles.historyExceptionItem}>
                      <View className={styles.historyExceptionHeader}>
                        <Text className={styles.historyExceptionTime}>{formatDateTime(rec.responseTime)}</Text>
                        <Text className={styles.historyExceptionStatus}>发现波动</Text>
                      </View>
                      {rec.handlingNote && (
                        <Text className={styles.historyExceptionNote}>处理说明：{rec.handlingNote}</Text>
                      )}
                      {rec.photoUrl && (
                        <Image
                          src={rec.photoUrl}
                          className={styles.historyExceptionPhoto}
                          mode="aspectFill"
                          onClick={() => Taro.previewImage({ urls: [rec.photoUrl!], current: rec.photoUrl! })}
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}

              <View className={styles.historyShareBtn} onClick={handleShareSummary}>
                <Text className={styles.historyShareBtnText}>📤 复制摘要文本，分享给收货方</Text>
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
};

export default TasksPage;
