import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { profileService } from "@/services/profile.service";
import type { Profile, UpdateProfileData } from "@/types/profile.type";
import { useAuthStore } from "@/store/auth.store";
import { profileFormSchema } from "@/lib/zod.schema";

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  profile: Profile;
  onUpdate: (updatedProfile: Profile) => void;
}

export const ProfileForm = ({ profile, onUpdate }: ProfileFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      phoneNumber: profile?.phoneNumber || "",
      position: profile?.position || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updateData: UpdateProfileData = {};
      
      if (data.name !== (profile?.name || "")) {
        updateData.name = data.name;
      }
      if (data.phoneNumber !== (profile?.phoneNumber || "")) {
        updateData.phoneNumber = data.phoneNumber;
      }
      if (data.position !== (profile?.position || "") && user?.role === 'employee') {
        updateData.position = data.position;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("Không có thay đổi nào để lưu");
        setIsEditing(false);
        return;
      }

      const response = await profileService.updateMyProfile(updateData);
      if (response.success) {
        toast.success(response.message || "Cập nhật hồ sơ thành công!");
        onUpdate(response.profile);
        setIsEditing(false);
      }
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật hồ sơ";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      name: profile?.name || "",
      phoneNumber: profile?.phoneNumber || "",
      position: profile?.position || "",
    });
    setIsEditing(false);
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return "UN"; 
    }
    return name
      .trim()
      .split(" ")
      .filter(n => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "UN";
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Không có thông tin";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEditableFields = () => {
    if (user?.role === 'owner') {
      return ['name', 'phoneNumber'];
    } else if (user?.role === 'employee') {
      return ['name', 'phoneNumber', 'position'];
    }
    return [];
  };

  const editableFields = getEditableFields();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>
              Quản lý thông tin hồ sơ của bạn
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
              >
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src="" alt={profile.name} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{profile.name || "Chưa có tên"}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={profile.role === 'owner' ? 'default' : 'secondary'}>
                {profile.role === 'owner' ? 'Quản lý' : 'Nhân viên'}
              </Badge>
              {profile.status && (
                <Badge variant={profile.status === 'active' ? 'outline' : 'destructive'}>
                  {profile.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Form Fields */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên *</Label>
              {isEditing && editableFields.includes('name') ? (
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <Input
                  value={profile.name || ""}
                  disabled
                  className="bg-gray-50"
                />
              )}
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                value={profile.email || "Không có"}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email không thể thay đổi</p>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              {isEditing && editableFields.includes('phoneNumber') ? (
                <Input
                  id="phoneNumber"
                  {...form.register('phoneNumber')}
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <Input
                  value={profile.phoneNumber || "Chưa cập nhật"}
                  disabled
                  className="bg-gray-50"
                />
              )}
            </div>

            {/* Department Field (Read-only) */}
            {profile.department && (
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                <Input
                  value={profile.department}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}

            {/* Position Field (Employee only) */}
            {user?.role === 'employee' && (
              <div className="space-y-2">
                <Label htmlFor="position">Chức vụ</Label>
                {isEditing && editableFields.includes('position') ? (
                  <Input
                    id="position"
                    {...form.register('position')}
                    placeholder="Nhập chức vụ"
                  />
                ) : (
                  <Input
                    value={profile.position || "Chưa cập nhật"}
                    disabled
                    className="bg-gray-50"
                  />
                )}
              </div>
            )}
          </div>
        </form>

        <Separator />

        {/* Additional Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Thông tin hệ thống</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tạo lúc:</span>
              <p>{formatDate(profile.createdAt)}</p>
            </div>
            <div>
              <span className="text-gray-500">Cập nhật lần cuối:</span>
              <p>{formatDate(profile.updatedAt)}</p>
            </div>
            <div>
              <span className="text-gray-500">Đăng nhập lần cuối:</span>
              <p>{formatDate(profile.lastLoginAt)}</p>
            </div>
          </div>
        </div>

        {/* Work Schedule (Employee only) */}
        {profile.workSchedule && user?.role === 'employee' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Lịch làm việc</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Ngày làm việc:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.workSchedule.days.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Giờ làm việc:</span>
                  <p>
                    {profile.workSchedule.hours.startTime} - {profile.workSchedule.hours.endTime}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 