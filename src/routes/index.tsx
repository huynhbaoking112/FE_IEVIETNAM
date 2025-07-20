import { createBrowserRouter, Navigate } from "react-router-dom";
import OwnerLoginPage from "@/features/auth/pages/OwnerLoginPage";
import { EmployeeLoginPage } from "@/features/auth/pages/EmployeeLoginPage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { OwnerRoute } from "@/components/layout/OwnerRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardRedirect } from "@/components/layout/DashboardRedirect";

import { OwnerDashboard } from "@/features/dashboard/pages/OwnerDashboard";
import { EmployeeDashboard } from "@/features/dashboard/pages/EmployeeDashboard";

import { EmployeeListPage } from "@/features/employees/pages/EmployeeListPage";

import { TaskListPage } from "@/features/tasks/pages/TaskListPage";
import { MyTasksPage } from "@/features/tasks/pages/MyTasksPage";

import ChatPage from "@/features/chat/pages/ChatPage";

import { ProfilePage } from "@/features/profile/pages/ProfilePage";

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
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardRedirect />,
      },      
      {
        path: "dashboard/owner",
        element: (
          <OwnerRoute>
            <OwnerDashboard />
          </OwnerRoute>
        ),
      },
      {
        path: "dashboard/employee",
        element: <EmployeeDashboard />,
      },
      {
        path: "employees",
        element: (
          <OwnerRoute>
            <EmployeeListPage />
          </OwnerRoute>
        ),
      },
      {
        path: "tasks",
        element: (
          <OwnerRoute>
            <TaskListPage />
          </OwnerRoute>
        ),
      },
      {
        path: "my-tasks",
        element: <MyTasksPage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]); 