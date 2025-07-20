export interface Profile {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    role: string;
    department?: string;
    position?: string;
    status?: string;
    workSchedule?: {
      days: string[];
      hours: {
        startTime: string;
        endTime: string;
      };
      timezone?: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
    lastLoginAt?: Date;
  }

  export interface UpdateProfileData {
    name?: string;
    phoneNumber?: string;
    position?: string;
  }
  