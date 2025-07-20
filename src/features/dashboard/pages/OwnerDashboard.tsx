import { useCallback, useEffect, useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { RecentTasksTable } from "@/components/ui/recent-tasks-table";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTaskStats, getTasks } from "@/services/task.service";
import type { TaskStats, Task } from "@/types/task.type";
import { getAllEmployees } from "@/services/employee.service";
import type { Employee } from "@/types/employee.types";
import { 
  Users, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target
} from "lucide-react";
import { toast } from "sonner";

export const OwnerDashboard = () => {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [statsResponse, employeesResponse] = await Promise.all([
        getTaskStats(),
        getAllEmployees({ limit: 1000}),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      if (employeesResponse.success) {
        setEmployees(employeesResponse.employees);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecentTasks = useCallback(async () => {
    try {
      setIsTasksLoading(true);
      const response = await getTasks({ 
        limit: 10,
        page: 1
      });
      
      if (response.success) {
        setRecentTasks(response.tasks);
      }
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
      toast.error("Failed to load recent tasks");
    } finally {
      setIsTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentTasks();
  }, [fetchDashboardData, fetchRecentTasks]);

  const activeEmployeesCount = employees.filter(emp => emp.status === 'active').length;
  const completionRate = stats ? Math.round((stats.done / stats.total) * 100) || 0 : 0;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
          title="Total Tasks"
          value={stats?.total || 0}
          description="All tasks in the system"
          icon={Target}
          trend={{
            value: 12,
            isPositive: true,
          }}
        />
        
        <StatsCard
          title="Completed Tasks"
          value={stats?.done || 0}
          description={`${completionRate}% completion rate`}
          icon={CheckCircle}
          trend={{
            value: 8,
            isPositive: true,
          }}
        />
        
        <StatsCard
          title="Active Employees"
          value={activeEmployeesCount}
          description="Currently active team members"
          icon={Users}
          trend={{
            value: 5,
            isPositive: true,
          }}
        />
        
        <StatsCard
          title="Overdue Tasks"
          value={stats?.overdue || 0}
          description="Tasks past their due date"
          icon={AlertTriangle}
          trend={{
            value: -3,
            isPositive: false,
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Tasks Table */}
        <div className="col-span-4">
          <RecentTasksTable 
            tasks={recentTasks}
            isLoading={isTasksLoading}
            showEmployee={true}
            onTaskClick={(task) => {
              // TODO: Navigate to task details
              console.log("Task clicked:", task);
            }}
          />
        </div>

        {/* Progress Overview */}
        <div className="col-span-3 space-y-4">
          {/* Task Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Completion</span>
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Priority Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Urgent</span>
                    </div>
                    <span className="font-medium">{stats.priority.urgent}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span>High</span>
                    </div>
                    <span className="font-medium">{stats.priority.high}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Medium</span>
                    </div>
                    <span className="font-medium">{stats.priority.medium}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Low</span>
                    </div>
                    <span className="font-medium">{stats.priority.low}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Team Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="font-medium">{activeEmployeesCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Members</span>
                  <span className="font-medium">{employees.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Departments</span>
                  <span className="font-medium">
                    {new Set(employees.map(emp => emp.department)).size}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 