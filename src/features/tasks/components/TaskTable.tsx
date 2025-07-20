import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Search, Calendar, User } from 'lucide-react';
import type { Task } from '@/types/task.type';
import { statusConfig, priorityConfig } from '@/constants/status.constant';

interface TaskTableProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (taskId: string, status: string) => void;
}


export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.employee?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'done' || task.status === 'archived') return false;
    return new Date() > task.dueDate;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-80 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
        <div className="border rounded-lg">
          <div className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên công việc, nhân viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="todo">Chờ xử lý</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="done">Hoàn thành</SelectItem>
            <SelectItem value="archived">Đã lưu trữ</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Độ ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
            <SelectItem value="urgent">Khẩn cấp</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Công việc</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead>Ngày hết hạn</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  {tasks.length === 0 ? 'Chưa có công việc nào' : 'Không tìm thấy công việc phù hợp'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id} className={isOverdue(task) ? 'bg-red-50' : ''}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {task.description}
                        </div>
                      )}
                      {isOverdue(task) && (
                        <div className="text-xs text-red-600 font-medium mt-1">
                          Quá hạn
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">{task.employee?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{task.employee?.department}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={statusConfig[task.status].color}>
                      {statusConfig[task.status].label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={priorityConfig[task.priority].color}>
                      {priorityConfig[task.priority].label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-gray-500">
                    {formatDate(task.createdAt)}
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger >
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          Chỉnh sửa
                        </DropdownMenuItem>
                        {onStatusChange && task.status !== 'done' && (
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(task.id, 'done')}
                          >
                            Đánh dấu hoàn thành
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onDelete(task)} 
                          className="text-red-600"
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer với thống kê */}
      <div className="flex justify-between items-center text-sm text-gray-500 pt-4">
        <div>
          Hiển thị {filteredTasks.length} trên tổng {tasks.length} công việc
        </div>
        <div className="flex gap-4">
          <span>Quá hạn: {tasks.filter(isOverdue).length}</span>
          <span>Hoàn thành: {tasks.filter(t => t.status === 'done').length}</span>
        </div>
      </div>
    </div>
  );
}; 