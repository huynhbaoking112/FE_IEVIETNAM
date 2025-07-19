import { Link } from "react-router-dom";
import { EmployeeLoginForm } from "../components/EmployeeLoginForm";
import { Button } from "@/components/ui/button";

export const EmployeeLoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Employee Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Đăng nhập vào hệ thống quản lý công việc
          </p>
        </div>
        
        <EmployeeLoginForm />
        
        <div className="text-center">
          <Link to="/login/owner">
            <Button variant="link" className="text-sm">
              Bạn là Owner? Đăng nhập tại đây
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}; 