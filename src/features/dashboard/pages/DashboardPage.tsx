import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "@/services/auth.service";
import { toast } from "sonner";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (user?.type) {
        await logoutApi(user.type);
      }
      logout();
      toast.success("Đăng xuất thành công!");
      navigate("/login/owner");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Chào mừng, {user?.name || user?.email || user?.phoneNumber}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Đăng xuất
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Role:</strong> {user?.role}</p>
                <p><strong>Type:</strong> {user?.type}</p>
                {user?.email && <p><strong>Email:</strong> {user.email}</p>}
                {user?.phoneNumber && <p><strong>Phone:</strong> {user.phoneNumber}</p>}
                {user?.department && <p><strong>Department:</strong> {user.department}</p>}
                {user?.position && <p><strong>Position:</strong> {user.position}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Chức năng sẽ được phát triển trong Phase 3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Chức năng sẽ được phát triển trong Phase 3</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 