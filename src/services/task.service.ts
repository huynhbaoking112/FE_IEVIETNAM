import api from '../lib/api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { Task, TaskStatsResponse, TasksResponse } from '@/types/task.type';
import { safeParseDate } from '@/utils/dateUtils';



export const getTaskStats = async (): Promise<TaskStatsResponse> => {
  const response = await api.get(API_ENDPOINTS.TASKS.STATS);
  return response.data;
};

export const getTasks = async (params?: {
  employeeId?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<TasksResponse> => {
  const response = await api.get(API_ENDPOINTS.TASKS.BASE, { params });
  
  const tasksWithDates = response.data.tasks.map((task: Task & { createdAt: string; updatedAt: string; dueDate?: string }) => ({
    ...task,
    createdAt: safeParseDate(task.createdAt),
    updatedAt: safeParseDate(task.updatedAt),
    dueDate: task.dueDate ? safeParseDate(task.dueDate) : undefined,
  }));
  
  return {
    ...response.data,
    tasks: tasksWithDates,
  };
};

export const createTask = async (taskData: {
  title: string;
  description?: string;
  employeeId: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}): Promise<{ success: boolean; task: Task; message: string }> => {
  const response = await api.post(API_ENDPOINTS.TASKS.BASE, taskData);
  return response.data;
};

export const updateTask = async (
  id: string,
  taskData: Partial<{
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string;
    employeeId: string;
  }>
): Promise<{ success: boolean; task: Task; message: string }> => {
  const response = await api.put(API_ENDPOINTS.TASKS.BY_ID(id), taskData);
  return response.data;
};

export const deleteTask = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(API_ENDPOINTS.TASKS.BY_ID(id));
  return response.data;
}; 