import { API_ENDPOINTS } from '@/constants/endpoints';
import api from '@/lib/api';
import type { Profile, UpdateProfileData } from '@/types/profile.type';

    

export const profileService = {
  getMyProfile: async (): Promise<{ success: boolean; profile: Profile }> => {
    const response = await api.get(API_ENDPOINTS.PROFILE.ME);
    return response.data;
  },

  updateMyProfile: async (data: UpdateProfileData): Promise<{ success: boolean; profile: Profile; message: string }> => {
    const response = await api.put(API_ENDPOINTS.PROFILE.ME, data);
    return response.data;
  },
}; 