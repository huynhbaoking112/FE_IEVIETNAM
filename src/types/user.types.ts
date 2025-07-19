export type UserRole = 'owner' | 'employee';

export type UserType = 'owner' | 'employee';

export interface BaseUser {
  id: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Owner extends BaseUser {
  role: 'owner';
  phoneNumber: string;
  name?: string;
}

export interface Employee extends BaseUser {
  role: 'employee';
  name: string;
  email: string;
  department?: string;
  phoneNumber?: string;
  position?: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  workSchedule?: WorkSchedule;
  createdBy: string;
}

export interface WorkSchedule {
  days: string[];
  hours: {
    startTime: string;
    endTime: string;
  };
  timezone?: string;
}

export type User = Owner | Employee;    