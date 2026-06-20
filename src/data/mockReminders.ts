import type { Reminder } from '@/types';

export const mockReminders: Reminder[] = [
  {
    id: 'R001',
    taskId: 'T20240621001',
    type: 'loading_30min',
    title: '装车后30分钟检查',
    content: '请检查当前货厢温度是否在正常范围内，确认制冷机运行正常。',
    triggerTime: '2024-06-21 03:00',
    triggered: true,
    responded: true,
    response: 'temp_normal',
    responseTime: '2024-06-21 03:02',
    photoUrl: 'https://picsum.photos/id/160/400/300'
  },
  {
    id: 'R002',
    taskId: 'T20240621001',
    type: 'service_area',
    title: '即将到达G60枫泾服务区',
    content: '距离服务区还有10分钟车程。如需加油或休息，请记录是否开启厢门。',
    triggerTime: '2024-06-21 03:35',
    triggered: true,
    responded: false
  },
  {
    id: 'R003',
    taskId: 'T20240621003',
    type: 'temp_warning',
    title: '温度接近上限',
    content: '当前温度3.8°C，已接近目标温区上限4°C，请按步骤检查：1. 厢门是否关闭 2. 制冷机运行状态 3. 回风口是否畅通。',
    triggerTime: '2024-06-21 03:15',
    triggered: true,
    responded: false
  },
  {
    id: 'R004',
    taskId: 'T20240621001',
    type: 'near_delivery',
    title: '临近收货点',
    content: '距离收货点还有20分钟。请提前准备交接资料，确认货物状态。',
    triggerTime: '2024-06-21 06:10',
    triggered: false,
    responded: false
  },
  {
    id: 'R005',
    taskId: 'T20240621003',
    type: 'service_area',
    title: '即将到达北京六环百葛服务区',
    content: '距离服务区还有10分钟车程。如需加油或休息，请记录是否开启厢门。',
    triggerTime: '2024-06-21 04:20',
    triggered: false,
    responded: false
  }
];

export const getRemindersByTaskId = (taskId: string): Reminder[] => {
  return mockReminders.filter(r => r.taskId === taskId);
};

export const getPendingReminders = (): Reminder[] => {
  return mockReminders.filter(r => r.triggered && !r.responded);
};

export const getAllReminders = (): Reminder[] => {
  return mockReminders;
};
