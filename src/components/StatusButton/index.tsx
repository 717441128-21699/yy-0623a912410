import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { DriverResponse } from '@/types';
import styles from './index.module.scss';

interface StatusButtonProps {
  type: DriverResponse;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const buttonConfig: Record<DriverResponse, { label: string; icon: string; color: string }> = {
  temp_normal: {
    label: '温度正常',
    icon: '✓',
    color: 'success'
  },
  refuel_no_open: {
    label: '已加油未开厢',
    icon: '⛽',
    color: 'primary'
  },
  fluctuation_found: {
    label: '发现波动',
    icon: '⚠',
    color: 'warning'
  },
  checked_ok: {
    label: '检查正常',
    icon: '✓',
    color: 'success'
  }
};

const StatusButton: React.FC<StatusButtonProps> = ({ type, selected, onClick, disabled }) => {
  const config = buttonConfig[type];

  return (
    <View
      className={classnames(
        styles.statusBtn,
        styles[`color${config.color.charAt(0).toUpperCase() + config.color.slice(1)}`],
        selected && styles.selected,
        disabled && styles.disabled
      )}
      onClick={() => !disabled && onClick?.()}
    >
      <Text className={styles.btnIcon}>{config.icon}</Text>
      <Text className={styles.btnLabel}>{config.label}</Text>
    </View>
  );
};

export default StatusButton;
