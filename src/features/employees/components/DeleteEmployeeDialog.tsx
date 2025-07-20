import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteEmployee } from "@/services/employee.service";
import type { Employee } from "@/types/employee.types";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
}

export const DeleteEmployeeDialog = ({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: DeleteEmployeeDialogProps) => {
  const handleDelete = async () => {
    if (!employee) return;

    try {
      await deleteEmployee(employee.id);
      toast.success("Employee deleted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };

  if (!employee) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="bg-red-100 p-2 rounded-full">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            Delete Employee
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  Are you sure you want to delete <span className="font-semibold">{employee.name}</span>?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This action cannot be undone. The employee will be marked as deleted and:
                </p>
                <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Will no longer be able to access the system</li>
                  <li>Will be removed from all active tasks</li>
                  <li>Their work schedule will be archived</li>
                  <li>Historical data will be preserved</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{employee.email}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{employee.department}</span>
                </div>
                {employee.position && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{employee.position}</span>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Employee
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 