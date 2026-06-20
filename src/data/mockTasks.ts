import type { Task } from '@/types';

export const mockTasks: Task[] = [
  {
    id: 'T20240621001',
    orderNo: 'CC-20240621-0089',
    cargoType: '生鲜冷冻',
    cargoName: '进口冷冻牛肉',
    cargoWeight: '25吨',
    targetTemp: { min: -18, max: -12, unit: '°C' },
    allowedFluctuation: 3,
    expectedDoorOpenings: 2,
    loadingPoint: '上海浦东新区冷链物流中心A区',
    deliveryPoint: '杭州余杭区农副产品物流中心B栋',
    loadingTime: '2024-06-21 02:30',
    estimatedArrival: '2024-06-21 06:30',
    checkPoints: [
      {
        id: 'CP001',
        name: '装车完成',
        type: 'loading',
        completed: true,
        reminderTime: '装车后30分钟'
      },
      {
        id: 'CP002',
        name: 'G60枫泾服务区',
        type: 'service_area',
        distance: '45km',
        eta: '03:45',
        completed: false,
        reminderTime: '到达前10分钟'
      },
      {
        id: 'CP003',
        name: '杭州绕城东枢纽',
        type: 'check',
        distance: '120km',
        eta: '05:00',
        completed: false,
        reminderTime: '到达前15分钟'
      },
      {
        id: 'CP004',
        name: '收货点',
        type: 'delivery',
        distance: '168km',
        eta: '06:30',
        completed: false,
        reminderTime: '到达前20分钟'
      }
    ],
    status: {
      id: 'TS001',
      status: 'in_transit',
      currentTemp: -14.2,
      lastCheckTime: '2024-06-21 03:00',
      doorOpenCount: 1,
      photos: ['https://picsum.photos/id/160/400/300']
    },
    receiverName: '张经理',
    receiverPhone: '138****5678',
    specialRequirements: '卸货时需全程保持厢门开启不超过30分钟'
  },
  {
    id: 'T20240621002',
    orderNo: 'CC-20240621-0090',
    cargoType: '医药冷链',
    cargoName: '胰岛素注射液',
    cargoWeight: '800kg',
    targetTemp: { min: 2, max: 8, unit: '°C' },
    allowedFluctuation: 2,
    expectedDoorOpenings: 1,
    loadingPoint: '苏州工业园区生物医药产业园',
    deliveryPoint: '南京鼓楼医院药品物流中心',
    loadingTime: '2024-06-21 08:00',
    estimatedArrival: '2024-06-21 11:00',
    checkPoints: [
      {
        id: 'CP005',
        name: '装车完成',
        type: 'loading',
        completed: false,
        reminderTime: '装车后30分钟'
      },
      {
        id: 'CP006',
        name: 'G42阳澄湖服务区',
        type: 'service_area',
        distance: '60km',
        eta: '09:20',
        completed: false,
        reminderTime: '到达前10分钟'
      },
      {
        id: 'CP007',
        name: '收货点',
        type: 'delivery',
        distance: '210km',
        eta: '11:00',
        completed: false,
        reminderTime: '到达前20分钟'
      }
    ],
    status: {
      id: 'TS002',
      status: 'pending',
      currentTemp: 5,
      lastCheckTime: '2024-06-21 07:00',
      doorOpenCount: 0,
      photos: []
    },
    receiverName: '李药师',
    receiverPhone: '139****1234',
    specialRequirements: '必须全程温度记录，交接时需打印温度曲线'
  },
  {
    id: 'T20240621003',
    orderNo: 'CC-20240621-0091',
    cargoType: '乳品冷链',
    cargoName: '巴氏杀菌鲜奶',
    cargoWeight: '18吨',
    targetTemp: { min: 0, max: 4, unit: '°C' },
    allowedFluctuation: 2,
    expectedDoorOpenings: 3,
    loadingPoint: '呼和浩特乳业园区生产基地',
    deliveryPoint: '北京朝阳区三源里菜市场',
    loadingTime: '2024-06-20 22:00',
    estimatedArrival: '2024-06-21 06:00',
    checkPoints: [
      {
        id: 'CP008',
        name: '装车完成',
        type: 'loading',
        completed: true,
        reminderTime: '装车后30分钟'
      },
      {
        id: 'CP009',
        name: 'G6张家口服务区',
        type: 'service_area',
        completed: true,
        reminderTime: '到达前10分钟'
      },
      {
        id: 'CP010',
        name: '北京六环百葛服务区',
        type: 'service_area',
        distance: '80km',
        eta: '04:30',
        completed: false,
        reminderTime: '到达前10分钟'
      },
      {
        id: 'CP011',
        name: '收货点',
        type: 'delivery',
        distance: '150km',
        eta: '06:00',
        completed: false,
        reminderTime: '到达前20分钟'
      }
    ],
    status: {
      id: 'TS003',
      status: 'in_transit',
      currentTemp: 2.8,
      lastCheckTime: '2024-06-21 03:15',
      doorOpenCount: 0,
      photos: ['https://picsum.photos/id/201/400/300']
    },
    receiverName: '王主管',
    receiverPhone: '136****8899',
    specialRequirements: '优先卸货，鲜奶需在7点前上架'
  }
];

export const getTaskById = (id: string): Task | undefined => {
  return mockTasks.find(task => task.id === id);
};

export const getInTransitTasks = (): Task[] => {
  return mockTasks.filter(task => task.status.status === 'in_transit');
};

export const getPendingTasks = (): Task[] => {
  return mockTasks.filter(task => task.status.status === 'pending');
};
