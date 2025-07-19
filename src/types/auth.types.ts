export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  role: 'owner' | 'employee';
  type: 'owner' | 'employee';
  name?: string;
  department?: string;
  position?: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phoneNumber?: string;
  email?: string;
  accessCode: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  accessCode?: string;
  expiresAt?: string;
} 