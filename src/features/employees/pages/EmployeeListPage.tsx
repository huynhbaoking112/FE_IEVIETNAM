import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTable } from "../components/EmployeeTable";
import { EmployeeFormDialog } from "../components/EmployeeFormDialog";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import { getAllEmployees } from "@/services/employee.service";
import type { Employee } from "@/types/employee.types";
import { Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";

export const EmployeeListPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchEmployees = useCallback(async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      const response = await getAllEmployees({
        page,
        limit: pagination.limit,
        // status: 'active',
      });

      if (response.success) {
        let filteredEmployees = response.employees;
        if (search.trim()) {
          const searchLower = search.toLowerCase();
          filteredEmployees = response.employees.filter(
            (employee) =>
              employee.name.toLowerCase().includes(searchLower) ||
              employee.email.toLowerCase().includes(searchLower) ||
              employee.department.toLowerCase().includes(searchLower) ||
              (employee.position && employee.position.toLowerCase().includes(searchLower))
          );
        }

        setEmployees(filteredEmployees);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchEmployees(1, searchTerm);
  }, [fetchEmployees, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchEmployees(newPage, searchTerm);
  };

  const handleCreateEmployee = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeletingEmployee(employee);
  };

  const handleEmployeeCreated = () => {
    setIsCreateDialogOpen(false);
    fetchEmployees(pagination.page, searchTerm);
    toast.success("Employee created successfully");
  };

  const handleEmployeeUpdated = () => {
    setEditingEmployee(null);
    fetchEmployees(pagination.page, searchTerm);
    toast.success("Employee updated successfully");
  };

  const handleEmployeeDeleted = () => {
    setDeletingEmployee(null);
    fetchEmployees(pagination.page, searchTerm);
    toast.success("Employee deleted successfully");
  };

  const activeEmployeesCount = employees.length;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employee Management</h2>
          <p className="text-muted-foreground">
            Manage your team members and their information
          </p>
        </div>
        <Button onClick={handleCreateEmployee} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Overview</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">{activeEmployeesCount}</div>
              <p className="text-xs text-muted-foreground">Active Employees</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {new Set(employees.map(emp => emp.department)).size}
              </div>
              <p className="text-xs text-muted-foreground">Departments</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {employees.filter(emp => 
                  emp.workSchedule && emp.workSchedule.days.length > 0
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">With Work Schedule</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

      <EmployeeFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleEmployeeCreated}
      />

      <EmployeeFormDialog
        open={!!editingEmployee}
        onOpenChange={(open: boolean) => !open && setEditingEmployee(null)}
        employee={editingEmployee}
        onSuccess={handleEmployeeUpdated}
      />

      <DeleteEmployeeDialog
        open={!!deletingEmployee}
        onOpenChange={(open: boolean) => !open && setDeletingEmployee(null)}
        employee={deletingEmployee}
        onSuccess={handleEmployeeDeleted}
      />
    </div>
  );
}; 