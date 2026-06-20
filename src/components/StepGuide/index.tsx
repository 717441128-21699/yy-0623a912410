import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { GuideStep } from '@/types';
import styles from './index.module.scss';

interface StepGuideProps {
  steps: GuideStep[];
  onStepComplete?: (stepId: number) => void;
  title?: string;
}

const StepGuide: React.FC<StepGuideProps> = ({ steps, onStepComplete, title = '请按顺序检查' }) => {
  const currentStepIndex = steps.findIndex(s => !s.completed);
  const allCompleted = currentStepIndex === -1;

  return (
    <View className={styles.stepGuide}>
      <View className={styles.guideHeader}>
        <Text className={styles.guideIcon}>💡</Text>
        <Text className={styles.guideTitle}>{title}</Text>
      </View>

      <View className={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = step.completed;
          const isLocked = !isCompleted && !isCurrent;

          return (
            <View
              key={step.id}
              className={classnames(
                styles.stepItem,
                isCurrent && styles.current,
                isCompleted && styles.completed,
                isLocked && styles.locked
              )}
              onClick={() => isCurrent && onStepComplete?.(step.id)}
            >
              <View className={styles.stepHeader}>
                <View
                  className={classnames(
                    styles.stepNumber,
                    isCompleted && styles.numberCompleted,
                    isCurrent && styles.numberCurrent
                  )}
                >
                  {isCompleted ? (
                    <Text className={styles.checkIcon}>✓</Text>
                  ) : (
                    <Text className={styles.numberText}>{step.id}</Text>
                  )}
                </View>
                <View className={styles.stepInfo}>
                  <Text className={styles.stepTitle}>{step.title}</Text>
                  <Text className={styles.stepDesc}>{step.description}</Text>
                </View>
                {isCurrent && (
                  <View className={styles.stepAction}>
                    <Text className={styles.actionText}>已检查</Text>
                  </View>
                )}
                {isLocked && (
                  <View className={styles.stepLock}>
                    <Text className={styles.lockIcon}>🔒</Text>
                  </View>
                )}
              </View>

              {index < steps.length - 1 && (
                <View
                  className={classnames(
                    styles.connectLine,
                    isCompleted && styles.lineCompleted
                  )}
                />
              )}
            </View>
          );
        })}
      </View>

      {allCompleted && (
        <View className={styles.completeTip}>
          <Text className={styles.completeIcon}>✅</Text>
          <Text className={styles.completeText}>所有检查项已完成，请持续观察温度变化</Text>
        </View>
      )}
    </View>
  );
};

export default StepGuide;
