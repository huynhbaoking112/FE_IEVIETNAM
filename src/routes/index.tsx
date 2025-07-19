import { createBrowserRouter, Navigate } from "react-router-dom";
import OwnerLoginPage from "@/features/auth/pages/OwnerLoginPage";
import { EmployeeLoginPage } from "@/features/auth/pages/EmployeeLoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login/owner" replace />,
  },
  {
    path: "/login/owner",
    element: <OwnerLoginPage />,
  },
  {
    path: "/login/employee", 
    element: <EmployeeLoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  // TODO: Add more protected routes for employees, tasks, chat, profile
]); 