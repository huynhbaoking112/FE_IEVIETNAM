import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsOwner } from "@/store/auth.store";

interface OwnerRouteProps {
  children: React.ReactNode;
}

export const OwnerRoute = ({ children }: OwnerRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isOwner = useIsOwner();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login/owner" replace />;
  }

  if (!isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 