import api from '../lib/api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { AuthResponse } from '../types/auth.types';
import { useAuthStore } from '../store/auth.store';


export const generateOwnerCode = async (phoneNumber: string): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.OWNER.GENERATE_CODE, {
      phoneNumber,
    });
    
    return {
      success: response.data.success,
      message: response.data.message,
    expiresAt: response.data.expiresAt,
  };
};

export const validateOwnerCode = async (
  phoneNumber: string,
  accessCode: string
): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.OWNER.VALIDATE_CODE, {
      phoneNumber,
      accessCode,
    });
    
    return {
      success: response.data.success,
      message: response.data.message,
      user: response.data.user ? {
        id: response.data.user.id,
        phoneNumber: response.data.user.phoneNumber,
        role: response.data.user.role,
        type: 'owner',
        name: response.data.user.name,
      } : undefined,
    };
};

export const logoutOwner = async (): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.OWNER.LOGOUT);
    
    useAuthStore.getState().clearAuth();
    
    return {
      success: response.data.success,
      message: response.data.message,
    };
};

export const generateEmployeeCode = async (email: string): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.EMPLOYEE.GENERATE_CODE, {
      email,
    });
    
    return {
      success: response.data.success,
      message: response.data.message,
      expiresAt: response.data.expiresAt,
    };
};

export const validateEmployeeCode = async (
  email: string,
  accessCode: string
): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.EMPLOYEE.VALIDATE_CODE, {
      email,
      accessCode,
    });
    
    return {
      success: response.data.success,
      message: response.data.message,
      user: response.data.user ? {
        id: response.data.user.id,
        email: response.data.user.email,
        role: response.data.user.role,
        type: 'employee',
        name: response.data.user.name,
        department: response.data.user.department,
        position: response.data.user.position,
        status: response.data.user.status,
      } : undefined,
    };
};

export const logoutEmployee = async (): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.EMPLOYEE.LOGOUT);
    
    useAuthStore.getState().clearAuth();
    
    return {
      success: response.data.success,
      message: response.data.message,
    };
};

export const logout = async (userType: 'owner' | 'employee'): Promise<AuthResponse> => {
  if (userType === 'owner') {
    return await logoutOwner();
  } else {
    return await logoutEmployee();
  }
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^(0[3,5,7,8,9]\d{8}|\+84[3,5,7,8,9]\d{8})$/;
  return phoneRegex.test(phoneNumber.replace(/[\s\-()]/g, ''));
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  
  if (cleaned.startsWith('+84')) {
    return cleaned;
  }
  
  if (cleaned.startsWith('0')) {
    return '+84' + cleaned.substring(1);
  }
  
  return cleaned;
}; 