import { Navigate } from "react-router-dom";
import { useUser } from "@/store/auth.store";

export const DashboardRedirect = () => {
  const user = useUser();
  
  if (user?.role === 'owner') {
    return <Navigate to="/dashboard/owner" replace />;
  } else if (user?.role === 'employee') {
    return <Navigate to="/dashboard/employee" replace />;
  }
  
  return <Navigate to="/dashboard/owner" replace />;
}; 