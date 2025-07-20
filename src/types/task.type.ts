export interface TaskStats {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
    archived: number;
    overdue: number;
    priority: {
      low: number;
      medium: number;
      high: number;
      urgent: number;
    };
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    employeeId: string;
    ownerId: string;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    employee?: {
      id: string;
      name: string;
      email: string;
      department: string;
    };
  }
  
  export interface TasksResponse {
    success: boolean;
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  export interface TaskStatsResponse {
    success: boolean;
    stats: TaskStats;
  }