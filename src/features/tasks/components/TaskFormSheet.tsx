import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createTask, updateTask } from "@/services/task.service";
import { getAllEmployees } from "@/services/employee.service";
import type { Task } from "@/types/task.type";
import type { Employee } from "@/types/employee.types";
import { cn } from "@/lib/utils";
import { taskFormSchema } from "@/lib/zod.schema";

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSuccess: () => void;
}

export const TaskFormSheet: React.FC<TaskFormSheetProps> = ({
  open,
  onOpenChange,
  task,
  onSuccess,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      employeeId: "",
      priority: "medium",
      dueDate: undefined,
    },
  });

  const loadEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await getAllEmployees();
      setEmployees(response.employees);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadEmployees();

      if (task) {
        form.reset({
          title: task.title,
          description: task.description,
          employeeId: task.employeeId,
          priority: task.priority,
          dueDate: task.dueDate,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          employeeId: "",
          priority: "medium",
          dueDate: undefined,
        });
      }
    }
  }, [open, task, form]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);

      const taskData = {
        ...data,
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      };

      if (task) {
        await updateTask(task.id, taskData);
        toast.success("Cập nhật công việc thành công");
      } else {
        await createTask({
          title: data.title,
          description: data.description,
          employeeId: data.employeeId,
          priority: data.priority,
          dueDate: taskData.dueDate,
        });
        toast.success("Tạo công việc thành công");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(
        task ? "Không thể cập nhật công việc" : "Không thể tạo công việc"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: vi });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {task ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
          </SheetTitle>
          <SheetDescription>
            {task
              ? "Cập nhật thông tin công việc"
              : "Điền thông tin để tạo công việc mới cho nhân viên"}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề công việc *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tiêu đề công việc..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về công việc..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giao cho nhân viên *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingEmployees}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhân viên..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex flex-col">
                              <span>{employee.name}</span>
                              <span className="text-sm text-gray-500">
                                {employee.department} - {employee.position}
                              </span>
                            </div>
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ ưu tiên *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn độ ưu tiên..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày hết hạn</FormLabel>
                    <Popover>
                      <FormControl>
                        <PopoverTrigger>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
                            ) : (
                              <span>Chọn ngày hết hạn</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {task ? "Cập nhật" : "Tạo công việc"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
