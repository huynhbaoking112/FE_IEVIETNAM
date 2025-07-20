import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TaskTable } from '../components/TaskTable';
import { TaskFormSheet } from '../components/TaskFormSheet';
import { DeleteTaskDialog } from '../components/DeleteTaskDialog';
import { getTasks, deleteTask, updateTask } from '@/services/task.service';
import type { Task } from '@/types/task.type';

export const TaskListPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await getTasks();
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Không thể tải danh sách công việc');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      toast.success('Xóa công việc thành công');
      await loadTasks();
      setIsDeleteOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Không thể xóa công việc');
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, { status: status as 'todo' | 'in_progress' | 'done' | 'archived' });
      toast.success('Cập nhật trạng thái thành công');
      await loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
    loadTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Công việc</h1>
          <p className="text-gray-600">Quản lý và giao công việc cho nhân viên</p>
        </div>
        <Button onClick={handleCreateTask} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo Công việc
        </Button>
      </div>

      <TaskTable
        tasks={tasks}
        isLoading={isLoading}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />

      <TaskFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={selectedTask}
        onSuccess={handleFormSuccess}
      />

      <DeleteTaskDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        task={taskToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}; 