import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useTaskStore } from '@/store/useTaskStore';
import TemperatureGauge from '@/components/TemperatureGauge';
import { formatTemp, formatTempRange } from '@/utils/temperature';
import type { HandoverSummary } from '@/types';
import styles from './index.module.scss';

type StepType = 1 | 2 | 3 | 4;

const HandoverPage: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTask,
    updateHandoverForm,
    handoverForm,
    generateHandoverSummary,
    resetHandoverForm,
    completeTask
  } = useTaskStore();

  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [summary, setSummary] = useState<HandoverSummary | null>(null);
  const [tempInput, setTempInput] = useState<string>('');
  const [tempConfirmed, setTempConfirmed] = useState(false);

  const inTransitTasks = useMemo(
    () => tasks.filter(t => t.status.status === 'in_transit'),
    [tasks]
  );

  const selectedTask = useMemo(
    () => tasks.find(t => t.id === selectedTaskId) || inTransitTasks[0],
    [tasks, selectedTaskId, inTransitTasks]
  );

  useEffect(() => {
    if (selectedTask && !tempInput) {
      setTempInput(String(selectedTask.status.currentTemp));
    }
  }, [selectedTask]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId);
    setShowTaskPicker(false);
    resetHandoverForm();
    setPhotos([]);
    setSummaryGenerated(false);
    setSummary(null);
    setCurrentStep(1);
    setTempConfirmed(false);
    const task = tasks.find(t => t.id === taskId);
    setTempInput(task ? String(task.status.currentTemp) : '');
  };

  const handleTakePhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 3 - photos.length,
        sourceType: ['camera', 'album'],
        sizeType: ['compressed']
      });
      if (res.tempFilePaths) {
        setPhotos([...photos, ...res.tempFilePaths]);
      }
    } catch (error) {
      console.error('[Handover] 拍照失败:', error);
      Taro.showToast({
        title: '拍照失败',
        icon: 'error'
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleConfirmTemp = () => {
    const temp = parseFloat(tempInput);
    if (isNaN(temp)) {
      Taro.showToast({
        title: '请输入有效温度',
        icon: 'none'
      });
      return;
    }
    updateHandoverForm({ currentTemp: temp, photos: [...photos] });
    setTempConfirmed(true);
    Taro.showToast({
      title: '温度已确认',
      icon: 'success'
    });
  };

  const handleRefreshTime = () => {
    const now = dayjs().format('YYYY-MM-DD HH:mm');
    updateHandoverForm({ unloadingStartTime: now });
    Taro.showToast({
      title: '时间已更新',
      icon: 'success'
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !tempConfirmed) {
      Taro.showToast({
        title: '请先确认温度',
        icon: 'none'
      });
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as StepType);
    } else if (currentStep === 3) {
      if (!handoverForm.receiverName) {
        Taro.showToast({
          title: '请填写收货人',
          icon: 'none'
        });
        return;
      }
      if (!handoverForm.unloadingStartTime) {
        Taro.showToast({
          title: '请确认卸货时间',
          icon: 'none'
        });
        return;
      }
      updateHandoverForm({ photos: [...photos] });
      if (selectedTask) {
        const result = generateHandoverSummary(selectedTask.id);
        setSummary(result);
        setSummaryGenerated(true);
        setCurrentStep(4);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1 && currentStep <= 3) {
      setCurrentStep((currentStep - 1) as StepType);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  const handleBackToEdit = () => {
    setCurrentStep(1);
    setSummaryGenerated(false);
    setSummary(null);
  };

  const handleCompleteHandover = () => {
    if (!selectedTask) return;
    completeTask(selectedTask.id);
    Taro.showToast({
      title: '交接已完成',
      icon: 'success',
      duration: 2000
    });
    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/tasks/index'
      });
    }, 1500);
  };

  const handleCopyCode = () => {
    if (summary?.summaryCode) {
      Taro.setClipboardData({
        data: summary.summaryCode,
        success: () => {
          Taro.showToast({
            title: '已复制交接码',
            icon: 'success'
          });
        }
      });
    }
  };

  const handleReset = () => {
    resetHandoverForm();
    setPhotos([]);
    setSummaryGenerated(false);
    setSummary(null);
    setCurrentStep(1);
    setTempConfirmed(false);
    if (selectedTask) {
      setTempInput(String(selectedTask.status.currentTemp));
    }
  };

  const formatDateTime = (dateStr: string) => {
    return dayjs(dateStr).format('MM-DD HH:mm');
  };

  const stepLabels = ['温度确认', '收货人', '卸货时间', '交接预览'];

  return (
    <>
      <View
        className={classnames(styles.mask, showTaskPicker && styles.visible)}
        onClick={() => setShowTaskPicker(false)}
      />

      <ScrollView className={styles.pageContainer} scrollY>
        <View className={styles.pageHeader}>
          <Text className={styles.pageTitle}>到货交接</Text>
          <Text className={styles.pageSubtitle}>确认货物状态，完成交接手续</Text>
        </View>

        {inTransitTasks.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📦</Text>
            <Text className={styles.emptyText}>暂无到达待交接任务</Text>
            <Text className={styles.emptySubtext}>请先完成运输途中的检查点</Text>
          </View>
        ) : summaryGenerated && summary && currentStep === 4 ? (
          <View className={styles.summaryCard}>
            <View className={styles.summaryHeader}>
              <Text className={styles.summaryTitle}>📋 交接摘要预览</Text>
              <Text className={styles.summarySubtitle}>
                请仔细核对以下信息，确认无误后完成交接
              </Text>
            </View>

            <View className={styles.summaryContent}>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>订单编号</Text>
                <Text className={styles.summaryValue}>{summary.orderNo}</Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>货物名称</Text>
                <Text className={styles.summaryValue}>{summary.cargoName}</Text>
              </View>

              <View className={styles.summaryTempRow}>
                <View className={styles.summaryTempItem}>
                  <Text className={styles.summaryTempLabel}>装车温度</Text>
                  <Text className={styles.summaryTempValue}>{formatTemp(summary.tempRecord.loading)}</Text>
                </View>
                <View className={styles.summaryTempItem}>
                  <Text className={styles.summaryTempLabel}>平均温度</Text>
                  <Text className={styles.summaryTempValue}>{formatTemp(summary.tempRecord.average)}</Text>
                </View>
                <View className={styles.summaryTempItem}>
                  <Text className={styles.summaryTempLabel}>确认到货温度</Text>
                  <Text className={classnames(styles.summaryTempValue, styles.confirmed)}>
                    {formatTemp(summary.tempRecord.arrival)}
                  </Text>
                </View>
              </View>

              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>目标温区</Text>
                <Text className={styles.summaryValue}>
                  {formatTempRange(summary.tempRecord.range)}
                </Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>开门次数</Text>
                <Text className={classnames(
                  styles.summaryValue,
                  summary.doorOpenCount > 0 && styles.summaryValueWarning
                )}>
                  {summary.doorOpenCount} 次
                </Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>检查点完成</Text>
                <Text className={classnames(
                  styles.summaryValue,
                  summary.completedCheckPoints === summary.checkPointCount && styles.summaryValueGreen
                )}>
                  {summary.completedCheckPoints}/{summary.checkPointCount}
                </Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>到达时间</Text>
                <Text className={styles.summaryValue}>{formatDateTime(summary.arrivalTime)}</Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>卸货开始</Text>
                <Text className={styles.summaryValue}>{formatDateTime(summary.unloadingStartTime)}</Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>收货人</Text>
                <Text className={styles.summaryValue}>{summary.receiverName}</Text>
              </View>
              {summary.photos && summary.photos.length > 0 && (
                <View className={styles.summaryPhotoSection}>
                  <Text className={styles.summaryLabel}>温度仪表照片</Text>
                  <View className={styles.summaryPhotoGrid}>
                    {summary.photos.map((photo, idx) => (
                      <Image
                        key={idx}
                        src={photo}
                        className={styles.summaryPhotoItem}
                        mode="aspectFill"
                        onClick={() => Taro.previewImage({ urls: summary.photos || [], current: photo })}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View className={styles.summaryCodeSection} onClick={handleCopyCode}>
              <Text className={styles.summaryCodeLabel}>💡 点击复制交接码</Text>
              <Text className={styles.summaryCode}>{summary.summaryCode}</Text>
            </View>

            <View className={styles.summaryActions}>
              <View className={styles.btnSecondary} onClick={handleBackToEdit}>
                <Text className={styles.btnSecondaryText}>返回修改</Text>
              </View>
              <View className={styles.btnPrimary} onClick={handleCompleteHandover}>
                <Text className={styles.btnPrimaryText}>✓ 完成交接</Text>
              </View>
            </View>
          </View>
        ) : selectedTask ? (
          <>
            <View
              className={styles.taskSelector}
              onClick={() => setShowTaskPicker(true)}
            >
              <View className={styles.taskInfo}>
                <View className={styles.taskIcon}>
                  <Text className={styles.iconText}>
                    {selectedTask.cargoName.charAt(0)}
                  </Text>
                </View>
                <View className={styles.taskDetail}>
                  <Text className={styles.taskName}>{selectedTask.cargoName}</Text>
                  <Text className={styles.taskOrder}>{selectedTask.orderNo}</Text>
                </View>
                <Text className={styles.selectArrow}>›</Text>
              </View>
            </View>

            <View className={styles.stepsIndicator}>
              <View className={styles.stepsProgress}>
                {[1, 2, 3, 4].map(step => (
                  <View
                    key={step}
                    className={classnames(
                      styles.stepItem,
                      currentStep === step && styles.stepActive,
                      currentStep > step && styles.stepCompleted
                    )}
                  >
                    <View className={styles.stepCircle}>
                      {currentStep > step ? (
                        <Text className={styles.stepCheckIcon}>✓</Text>
                      ) : (
                        <Text className={styles.stepNumber}>{step}</Text>
                      )}
                    </View>
                    <Text className={styles.stepLabel}>
                      {stepLabels[step - 1]}
                    </Text>
                  </View>
                ))}
              </View>

              <View className={styles.stepContent}>
                {currentStep === 1 && (
                  <View>
                    <Text className={styles.formTitle}>确认到货温度</Text>
                    <View className={styles.tempDisplay}>
                      <TemperatureGauge
                        current={parseFloat(tempInput) || 0}
                        range={selectedTask.targetTemp}
                        fluctuation={selectedTask.allowedFluctuation}
                      />
                    </View>

                    <View className={styles.inputRow}>
                      <Text className={styles.inputLabel}>当前温度（可手动调整）</Text>
                      <View className={styles.tempInputWrapper}>
                        <Input
                          className={styles.tempInput}
                          type="digit"
                          placeholder="请输入温度"
                          placeholder-class="input-placeholder"
                          value={tempInput}
                          onInput={(e) => setTempInput(e.detail.value)}
                        />
                        <Text className={styles.tempUnit}>{selectedTask.targetTemp.unit}</Text>
                      </View>
                    </View>

                    <Text className={styles.formTitle}>拍照确认（建议拍仪表）</Text>
                    <View className={styles.photoGrid}>
                      {photos.map((photo, index) => (
                        <View key={index} className={styles.photoItem}>
                          <Image src={photo} className={styles.photoImg} mode="aspectFill" />
                          <View
                            className={styles.photoRemove}
                            onClick={() => handleRemovePhoto(index)}
                          >
                            <Text className={styles.photoRemoveIcon}>✕</Text>
                          </View>
                        </View>
                      ))}
                      {photos.length < 3 && (
                        <View className={styles.photoAdd} onClick={handleTakePhoto}>
                          <Text className={styles.photoAddIcon}>📷</Text>
                          <Text className={styles.photoAddText}>拍照片</Text>
                        </View>
                      )}
                    </View>

                    <View
                      className={classnames(styles.confirmTempBtn, tempConfirmed && styles.confirmed)}
                      onClick={handleConfirmTemp}
                    >
                      <Text className={styles.confirmTempBtnText}>
                        {tempConfirmed ? '✓ 温度已确认' : '确认温度'}
                      </Text>
                    </View>
                  </View>
                )}

                {currentStep === 2 && (
                  <View>
                    <Text className={styles.formTitle}>确认收货人信息</Text>
                    <View className={styles.inputRow}>
                      <Text className={styles.inputLabel}>收货人姓名 *</Text>
                      <Input
                        className={styles.inputField}
                        placeholder="请输入收货人姓名"
                        placeholder-class="input-placeholder"
                        value={handoverForm.receiverName || selectedTask.receiverName}
                        onInput={(e) => updateHandoverForm({ receiverName: e.detail.value })}
                      />
                    </View>
                    <View className={styles.inputRow}>
                      <Text className={styles.inputLabel}>联系电话</Text>
                      <Input
                        className={styles.inputField}
                        placeholder="请输入联系电话（可选）"
                        placeholder-class="input-placeholder"
                        value={handoverForm.receiverId || ''}
                        onInput={(e) => updateHandoverForm({ receiverId: e.detail.value })}
                      />
                    </View>
                  </View>
                )}

                {currentStep === 3 && (
                  <View>
                    <Text className={styles.formTitle}>确认卸货开始时间</Text>
                    <View className={styles.timeDisplay}>
                      <Text className={styles.timeLabel}>卸货开始时间</Text>
                      <Text className={styles.timeValue}>
                        {handoverForm.unloadingStartTime
                          ? dayjs(handoverForm.unloadingStartTime).format('HH:mm')
                          : '--:--'}
                      </Text>
                      <View className={styles.refreshBtn} onClick={handleRefreshTime}>
                        <Text className={styles.refreshBtnText}>获取当前时间</Text>
                      </View>
                    </View>

                    <Text className={styles.formTitle}>备注信息（可选）</Text>
                    <View className={styles.inputRow}>
                      <Input
                        className={styles.inputField}
                        placeholder="如有特殊情况请备注"
                        placeholder-class="input-placeholder"
                        value={handoverForm.remarks || ''}
                        onInput={(e) => updateHandoverForm({ remarks: e.detail.value })}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View className={styles.actionButtons}>
              {currentStep > 1 && (
                <View className={styles.btnSecondary} onClick={handlePrevStep}>
                  <Text className={styles.btnSecondaryText}>上一步</Text>
                </View>
              )}
              {currentStep < 4 ? (
                <View
                  className={classnames(
                    styles.btnPrimary,
                    currentStep === 1 && !tempConfirmed && styles.disabled
                  )}
                  onClick={handleNextStep}
                >
                  <Text className={styles.btnPrimaryText}>
                    {currentStep === 3 ? '预览交接摘要' : '下一步'}
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View
        className={classnames(styles.taskPicker, showTaskPicker && styles.visible)}
      >
        <View className={styles.pickerHeader}>
          <Text className={styles.pickerTitle}>选择任务</Text>
          <View className={styles.pickerClose} onClick={() => setShowTaskPicker(false)}>
            <Text className={styles.pickerCloseIcon}>✕</Text>
          </View>
        </View>
        <ScrollView className={styles.pickerList} scrollY>
          {inTransitTasks.map(task => (
            <View
              key={task.id}
              className={classnames(
                styles.pickerItem,
                selectedTaskId === task.id && styles.selected
              )}
              onClick={() => handleTaskSelect(task.id)}
            >
              <Text className={styles.pickerItemName}>{task.cargoName}</Text>
              <Text className={styles.pickerItemOrder}>{task.orderNo}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default HandoverPage;
