import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEmployee, updateEmployee } from "@/services/employee.service";
import type { Employee } from "@/types/employee.types";
import { toast } from "sonner";
import { Clock, Calendar } from "lucide-react";
import { DAYS_OF_WEEK } from "@/constants/days.constant";
import { DEPARTMENTS } from "@/constants/departments.constant";

const workScheduleSchema = z.object({
  days: z.array(z.string()).min(1, "At least one work day is required"),
  hours: z.object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  }),
  timezone: z.string().optional(),
});

const employeeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  phoneNumber: z.string().optional(),
  position: z.string().optional(),
  workSchedule: workScheduleSchema.optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}


export const EmployeeFormDialog = ({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeFormDialogProps) => {
  const isEditing = !!employee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      phoneNumber: "",
      position: "",
      workSchedule: {
        days: [],
        hours: {
          startTime: "09:00",
          endTime: "17:00",
        },
        timezone: "Asia/Ho_Chi_Minh",
      },
    },
  });

  useEffect(() => {
    if (open) {
      if (employee) {
        form.reset({
          name: employee.name,
          email: employee.email,
          department: employee.department,
          phoneNumber: employee.phoneNumber || "",
          position: employee.position || "",
          workSchedule: employee.workSchedule || {
            days: [],
            hours: {
              startTime: "09:00",
              endTime: "17:00",
            },
            timezone: "Asia/Ho_Chi_Minh",
          },
        });
      } else {
        form.reset({
          name: "",
          email: "",
          department: "",
          phoneNumber: "",
          position: "",
          workSchedule: {
            days: [],
            hours: {
              startTime: "09:00",
              endTime: "17:00",
            },
            timezone: "Asia/Ho_Chi_Minh",
          },
        });
      }
    }
  }, [open, employee, form]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const submitData = {
        ...data,
        phoneNumber: data.phoneNumber?.trim() || undefined,
        position: data.position?.trim() || undefined,
        workSchedule: data.workSchedule?.days.length ? data.workSchedule : undefined,
      };

      if (isEditing && employee) {
        await updateEmployee(employee.id, submitData);
      } else {
        await createEmployee(submitData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error(isEditing ? "Failed to update employee" : "Failed to create employee");
    }
  };

  const watchedDays = form.watch("workSchedule.days") || [];

  const handleDayToggle = (dayId: string, checked: boolean) => {
    const currentDays = form.getValues("workSchedule.days") || [];
    if (checked) {
      form.setValue("workSchedule.days", [...currentDays, dayId]);
    } else {
      form.setValue("workSchedule.days", currentDays.filter(day => day !== dayId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter email address" 
                            {...field}
                            disabled={isEditing} // Don't allow email changes in edit mode
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEPARTMENTS.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter position" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Work Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Work Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Working Days */}
                <div>
                  <FormLabel className="text-sm font-medium">Working Days</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.id}
                          checked={watchedDays.includes(day.id)}
                          onCheckedChange={(checked: boolean) => handleDayToggle(day.id, checked)}
                        />
                        <label
                          htmlFor={day.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Working Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="workSchedule.hours.startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Start Time
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workSchedule.hours.endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          End Time
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? (isEditing ? "Updating..." : "Creating...")
                  : (isEditing ? "Update Employee" : "Create Employee")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 