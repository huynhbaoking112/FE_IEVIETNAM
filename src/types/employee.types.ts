export interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    phoneNumber?: string;
    position?: string;
    status: 'active' | 'inactive' | 'suspended' | 'deleted';
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    workSchedule?: {
      days: string[];
      hours: {
        startTime: string;
        endTime: string;
      };
      timezone?: string;
    };
  }
  
  export interface EmployeesResponse {
    success: boolean;
    employees: Employee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  