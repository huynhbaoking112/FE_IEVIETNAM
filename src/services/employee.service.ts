import api from '../lib/api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { Employee, EmployeesResponse } from '@/types/employee.types';
import { safeParseDate } from '@/utils/dateUtils';

export const getAllEmployees = async (params?: {
  page?: number;
  limit?: number;
  department?: string;
  status?: string;
}): Promise<EmployeesResponse> => {
  const response = await api.get(API_ENDPOINTS.EMPLOYEES.BASE, { params });
  
  const employeesWithDates = response.data.employees.map((employee: Employee & { createdAt: string; updatedAt: string }) => ({
    ...employee,
    createdAt: safeParseDate(employee.createdAt),
    updatedAt: safeParseDate(employee.updatedAt),
  }));
  
  return {
    ...response.data,
    employees: employeesWithDates,
  };
};

export const getEmployee = async (id: string): Promise<{ success: boolean; employee: Employee }> => {
  const response = await api.get(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
  
  const employee = {
    ...response.data.employee,
    createdAt: safeParseDate(response.data.employee.createdAt),
    updatedAt: safeParseDate(response.data.employee.updatedAt),
  };
  
  return {
    ...response.data,
    employee,
  };
};

export const createEmployee = async (employeeData: {
  name: string;
  email: string;
  department: string;
  role?: string;
  phoneNumber?: string;
  position?: string;
  workSchedule?: {
    days: string[];
    hours: {
      startTime: string;
      endTime: string;
    };
    timezone?: string;
  };
}): Promise<{ success: boolean; employee: Employee; message: string; employeeId: string }> => {
  const response = await api.post(API_ENDPOINTS.EMPLOYEES.BASE, employeeData);
  return response.data;
};

export const updateEmployee = async (
  id: string,
  employeeData: Partial<{
    name: string;
    email: string;
    department: string;
    phoneNumber: string;
    position: string;
    status: 'active' | 'inactive' | 'suspended';
    workSchedule: {
      days: string[];
      hours: {
        startTime: string;
        endTime: string;
      };
      timezone?: string;
    };
  }>
): Promise<{ success: boolean; employee: Employee; message: string }> => {
  const response = await api.put(API_ENDPOINTS.EMPLOYEES.BY_ID(id), employeeData);
  return response.data;
};

export const deleteEmployee = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
  return response.data;
}; 