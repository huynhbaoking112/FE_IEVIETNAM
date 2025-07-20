import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { profileService } from "@/services/profile.service";
import type { Profile } from "@/types/profile.type";

export const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await profileService.getMyProfile();
      if (response.success) {
        setProfile(response.profile);
      }
    } catch (error: unknown) {
      console.error('Error fetching profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tải thông tin hồ sơ";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const ProfileSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
        </div>
        <Card>
          <CardContent className="flex items-center space-x-2 p-6 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
        </div>
        <Card>
          <CardContent className="flex items-center space-x-2 p-6 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>Không tìm thấy thông tin hồ sơ.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>
      
      <ProfileForm 
        profile={profile} 
        onUpdate={handleProfileUpdate} 
      />
    </div>
  );
}; 