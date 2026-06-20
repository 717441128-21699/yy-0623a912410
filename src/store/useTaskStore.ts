import { create } from 'zustand';
import type { Task, Reminder, DriverResponse, HandoverForm, HandoverSummary, GuideStep } from '@/types';
import { mockTasks } from '@/data/mockTasks';
import { mockReminders } from '@/data/mockReminders';
import { generateSummaryCode } from '@/utils/temperature';

interface TaskState {
  tasks: Task[];
  reminders: Reminder[];
  selectedTaskId: string | null;
  activeReminderId: string | null;
  guideSteps: GuideStep[];
  handoverForm: Partial<HandoverForm>;
  handoverSummary: HandoverSummary | null;

  setSelectedTask: (taskId: string) => void;
  getSelectedTask: () => Task | undefined;
  updateTaskTemp: (taskId: string, temp: number) => void;
  completeCheckPoint: (taskId: string, checkPointId: string) => void;
  incrementDoorOpen: (taskId: string) => void;
  addPhoto: (taskId: string, photoUrl: string) => void;

  respondToReminder: (reminderId: string, response: DriverResponse, photoUrl?: string) => void;
  setActiveReminder: (reminderId: string | null) => void;

  resetGuideSteps: () => void;
  completeGuideStep: (stepId: number) => void;

  updateHandoverForm: (data: Partial<HandoverForm>) => void;
  generateHandoverSummary: (taskId: string) => HandoverSummary;
  resetHandoverForm: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,
  reminders: mockReminders,
  selectedTaskId: mockTasks[0]?.id || null,
  activeReminderId: null,
  guideSteps: [
    { id: 1, title: '检查厢门是否关闭严密', description: '查看厢门密封条是否完好，确认锁扣已扣紧', completed: false },
    { id: 2, title: '检查制冷机运行状态', description: '观察制冷机显示屏，确认运行指示灯正常', completed: false },
    { id: 3, title: '检查回风口是否畅通', description: '查看回风口有无货物遮挡，清理堆积物品', completed: false }
  ],
  handoverForm: {},
  handoverSummary: null,

  setSelectedTask: (taskId: string) => {
    console.log('[TaskStore] setSelectedTask:', taskId);
    set({ selectedTaskId: taskId });
  },

  getSelectedTask: () => {
    const { tasks, selectedTaskId } = get();
    return tasks.find(t => t.id === selectedTaskId);
  },

  updateTaskTemp: (taskId: string, temp: number) => {
    console.log('[TaskStore] updateTaskTemp:', taskId, temp);
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { ...task, status: { ...task.status, currentTemp: temp, lastCheckTime: new Date().toISOString() } }
          : task
      )
    }));
  },

  completeCheckPoint: (taskId: string, checkPointId: string) => {
    console.log('[TaskStore] completeCheckPoint:', taskId, checkPointId);
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              checkPoints: task.checkPoints.map(cp =>
                cp.id === checkPointId ? { ...cp, completed: true } : cp
              )
            }
          : task
      )
    }));
  },

  incrementDoorOpen: (taskId: string) => {
    console.log('[TaskStore] incrementDoorOpen:', taskId);
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { ...task, status: { ...task.status, doorOpenCount: task.status.doorOpenCount + 1 } }
          : task
      )
    }));
  },

  addPhoto: (taskId: string, photoUrl: string) => {
    console.log('[TaskStore] addPhoto:', taskId, photoUrl);
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { ...task, status: { ...task.status, photos: [...task.status.photos, photoUrl] } }
          : task
      )
    }));
  },

  respondToReminder: (reminderId: string, response: DriverResponse, photoUrl?: string) => {
    console.log('[TaskStore] respondToReminder:', reminderId, response);
    set(state => ({
      reminders: state.reminders.map(r =>
        r.id === reminderId
          ? {
              ...r,
              responded: true,
              response,
              responseTime: new Date().toISOString(),
              photoUrl
            }
          : r
      )
    }));
  },

  setActiveReminder: (reminderId: string | null) => {
    console.log('[TaskStore] setActiveReminder:', reminderId);
    set({ activeReminderId: reminderId });
  },

  resetGuideSteps: () => {
    set({
      guideSteps: [
        { id: 1, title: '检查厢门是否关闭严密', description: '查看厢门密封条是否完好，确认锁扣已扣紧', completed: false },
        { id: 2, title: '检查制冷机运行状态', description: '观察制冷机显示屏，确认运行指示灯正常', completed: false },
        { id: 3, title: '检查回风口是否畅通', description: '查看回风口有无货物遮挡，清理堆积物品', completed: false }
      ]
    });
  },

  completeGuideStep: (stepId: number) => {
    console.log('[TaskStore] completeGuideStep:', stepId);
    set(state => ({
      guideSteps: state.guideSteps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    }));
  },

  updateHandoverForm: (data: Partial<HandoverForm>) => {
    console.log('[TaskStore] updateHandoverForm:', data);
    set(state => ({
      handoverForm: { ...state.handoverForm, ...data }
    }));
  },

  generateHandoverSummary: (taskId: string): HandoverSummary => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const completedCheckPoints = task.checkPoints.filter(cp => cp.completed).length;
    const summary: HandoverSummary = {
      taskId: task.id,
      orderNo: task.orderNo,
      cargoName: task.cargoName,
      tempRecord: {
        loading: task.targetTemp.min + 1,
        average: task.status.currentTemp,
        arrival: task.status.currentTemp,
        range: task.targetTemp
      },
      doorOpenCount: task.status.doorOpenCount,
      checkPointCount: task.checkPoints.length,
      completedCheckPoints,
      arrivalTime: new Date().toISOString(),
      unloadingStartTime: get().handoverForm.unloadingStartTime || new Date().toISOString(),
      receiverName: get().handoverForm.receiverName || task.receiverName,
      summaryCode: generateSummaryCode(taskId)
    };

    console.log('[TaskStore] generateHandoverSummary:', summary);
    set({ handoverSummary: summary });
    return summary;
  },

  resetHandoverForm: () => {
    set({ handoverForm: {}, handoverSummary: null });
  }
}));
