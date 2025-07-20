import { useCallback, useEffect, useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { RecentTasksTable } from "@/components/ui/recent-tasks-table";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTaskStats, getTasks, updateTask } from "@/services/task.service";
import type { TaskStats, Task } from "@/types/task.type";
import { useAuthStore } from "@/store/auth.store";
import { 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Target,
  Clock,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";

export const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch personal task stats
      const statsResponse = await getTaskStats();

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyTasks = useCallback(async () => {
    try {
      setIsTasksLoading(true);
      const response = await getTasks({ 
        limit: 10,
        page: 1
      });
      
      if (response.success) {
        setMyTasks(response.tasks);
      }
    } catch (error) {
      console.error("Error fetching my tasks:", error);
      toast.error("Failed to load your tasks");
    } finally {
      setIsTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchMyTasks();
  }, [fetchDashboardData, fetchMyTasks]);

  const handleTaskStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await updateTask(taskId, { status: newStatus });
      if (response.success) {
        toast.success("Task status updated successfully");
        // Refresh data
        fetchMyTasks();
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task status");
    }
  };

  const completionRate = stats ? Math.round((stats.done / stats.total) * 100) || 0 : 0;
  const todayTasks = myTasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 h-80 bg-muted rounded-lg animate-pulse" />
          <div className="col-span-3 h-80 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.email || 'Employee'}!
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Tasks"
          value={stats?.total || 0}
          description="Total assigned tasks"
          icon={Target}
        />
        
        <StatsCard
          title="Completed"
          value={stats?.done || 0}
          description={`${completionRate}% completion rate`}
          icon={CheckCircle}
        />
        
        <StatsCard
          title="In Progress"
          value={stats?.in_progress || 0}
          description="Currently working on"
          icon={PlayCircle}
        />
        
        <StatsCard
          title="Due Today"
          value={todayTasks.length}
          description="Tasks due today"
          icon={Clock}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* My Tasks Table */}
        <div className="col-span-4">
          <RecentTasksTable 
            tasks={myTasks}
            isLoading={isTasksLoading}
            showEmployee={false}
            onTaskClick={(task) => {
              // TODO: Navigate to task details
              console.log("Task clicked:", task);
            }}
          />
        </div>

        {/* Quick Actions & Progress */}
        <div className="col-span-3 space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myTasks
                .filter(task => task.status === 'todo')
                .slice(0, 3)
                .map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Priority: {task.priority}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                    >
                      Start
                    </Button>
                  </div>
                ))}
              
              {myTasks
                .filter(task => task.status === 'in_progress')
                .slice(0, 2)
                .map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        In progress
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTaskStatusUpdate(task.id, 'done')}
                    >
                      Complete
                    </Button>
                  </div>
                ))}
                
              {myTasks.filter(task => ['todo', 'in_progress'].includes(task.status)).length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No pending tasks
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="mt-2" />
                </div>
                
                {stats && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">To Do</span>
                      <span className="font-medium">{stats.todo}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">In Progress</span>
                      <span className="font-medium">{stats.in_progress}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium">{stats.done}</span>
                    </div>
                    {stats.overdue > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-600">Overdue</span>
                        <span className="font-medium text-red-600">{stats.overdue}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Priority Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Task Priorities</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-3">
                  {stats.priority.urgent > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Urgent</span>
                      </div>
                      <span className="font-medium">{stats.priority.urgent}</span>
                    </div>
                  )}
                  {stats.priority.high > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span>High</span>
                      </div>
                      <span className="font-medium">{stats.priority.high}</span>
                    </div>
                  )}
                  {stats.priority.medium > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>Medium</span>
                      </div>
                      <span className="font-medium">{stats.priority.medium}</span>
                    </div>
                  )}
                  {stats.priority.low > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Low</span>
                      </div>
                      <span className="font-medium">{stats.priority.low}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 