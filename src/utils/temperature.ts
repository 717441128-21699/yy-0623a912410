import type { TemperatureRange } from '@/types';

export const getTempStatus = (
  current: number,
  range: TemperatureRange,
  fluctuation: number
): 'normal' | 'warning' | 'danger' => {
  const upperLimit = range.max + fluctuation * 0.8;
  const dangerLimit = range.max + fluctuation;

  if (current > dangerLimit) return 'danger';
  if (current > upperLimit) return 'warning';
  return 'normal';
};

export const getTempStatusColor = (status: 'normal' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'normal':
      return '#00B42A';
    case 'warning':
      return '#FF7D00';
    case 'danger':
      return '#F53F3F';
    default:
      return '#00B42A';
  }
};

export const getTempStatusText = (status: 'normal' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'normal':
      return '温度正常';
    case 'warning':
      return '接近上限';
    case 'danger':
      return '温度超限';
    default:
      return '温度正常';
  }
};

export const formatTemp = (temp: number, unit = '°C'): string => {
  return `${temp.toFixed(1)}${unit}`;
};

export const formatTempRange = (range: TemperatureRange): string => {
  return `${range.min}~${range.max}${range.unit}`;
};

export const generateSummaryCode = (taskId: string): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-${taskId.slice(-4)}-${timestamp.slice(-4)}-${random}`;
};
