import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Employee } from "@/types/employee.types";
import { MoreHorizontal, User, Mail, Building, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { isValidDate, safeDateFormat } from "@/utils/dateUtils";
import { getEmployeeStatusColor } from "@/utils/Status.constant";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading?: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}


export const EmployeeTable = ({ 
  employees, 
  isLoading = false, 
  pagination,
  onPageChange,
  onEdit,
  onDelete
}: EmployeeTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No employees found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by adding your first employee.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee List ({pagination.total} total)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Work Schedule</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </div>
                      {employee.phoneNumber && (
                        <div className="text-xs text-muted-foreground">
                          {employee.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.department}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {employee.position ? (
                    <span className="text-sm">{employee.position}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getEmployeeStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {employee.workSchedule && employee.workSchedule.days.length > 0 ? (
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.workSchedule.days.length} days/week</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {employee.workSchedule.hours.startTime} - {employee.workSchedule.hours.endTime}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  {isValidDate(employee.createdAt) ? (
                    <div className="text-sm">
                      <div>{new Date(employee.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {safeDateFormat(employee.createdAt)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unknown</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger >
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(employee)}>
                        Edit Employee
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete?.(employee)} className="text-red-600">
                        Delete Employee
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} employees
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === pagination.totalPages || 
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange?.(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 