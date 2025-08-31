import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Calendar, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentPayout {
  agent_id: string;
  agent_name: string;
  tasks_completed: number;
  total_commission: number;
  status: string;
  week_start: string;
  week_end: string;
}

interface CompletedTask {
  id: string;
  title: string;
  client_name: string;
  service_type: string;
  price: number;
  commission_rate: number;
  completed_at: string;
  agent_id: string;
}

const AdminPayout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weeklyPayouts, setWeeklyPayouts] = useState<AgentPayout[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(true);

  const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
  };

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      const { startOfWeek, endOfWeek } = getCurrentWeekDates();
      
      // Get all completed tasks for this week
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'completed')
        .gte('completed_at', startOfWeek.toISOString())
        .lte('completed_at', endOfWeek.toISOString())
        .order('completed_at', { ascending: false });

      if (tasksError) throw tasksError;

      setCompletedTasks(tasks || []);

      // Group tasks by agent and calculate totals
      const agentStats = (tasks || []).reduce((acc: any, task) => {
        const agentId = task.agent_id;
        if (!agentId) return acc;

        if (!acc[agentId]) {
          acc[agentId] = {
            agent_id: agentId,
            agent_name: `Agent ${agentId.slice(0, 8)}...`,
            tasks_completed: 0,
            total_commission: 0,
            status: 'pending',
            week_start: startOfWeek.toISOString().split('T')[0],
            week_end: endOfWeek.toISOString().split('T')[0]
          };
        }

        acc[agentId].tasks_completed += 1;
        acc[agentId].total_commission += (task.price * task.commission_rate / 100);
        
        return acc;
      }, {});

      setWeeklyPayouts(Object.values(agentStats));
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payout data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (agentId: string) => {
    try {
      const { startOfWeek, endOfWeek } = getCurrentWeekDates();
      const agentPayout = weeklyPayouts.find(p => p.agent_id === agentId);
      
      if (!agentPayout) return;

      // Create payout record
      const { error } = await supabase
        .from('agent_payouts')
        .insert({
          agent_id: agentId,
          week_start: startOfWeek.toISOString().split('T')[0],
          week_end: endOfWeek.toISOString().split('T')[0],
          total_commission: agentPayout.total_commission,
          tasks_completed: agentPayout.tasks_completed,
          status: 'paid',
          paid_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Payment Confirmed",
        description: `Payment of ${agentPayout.total_commission.toLocaleString('en-RW')} RWF marked as paid for ${agentPayout.agent_name}`,
      });

      // Refresh data
      fetchWeeklyData();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark payment as paid. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading payout data...</p>
        </div>
      </div>
    );
  }

  const totalCommissions = weeklyPayouts.reduce((sum, payout) => sum + payout.total_commission, 0);
  const totalTasks = weeklyPayouts.reduce((sum, payout) => sum + payout.tasks_completed, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Payout Center</h1>
          <p className="text-muted-foreground mt-2">Manage weekly agent payouts (Friday Payouts)</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Current Week Summary
            </CardTitle>
            <CardDescription>
              Week of {getCurrentWeekDates().startOfWeek.toLocaleDateString()} - {getCurrentWeekDates().endOfWeek.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{weeklyPayouts.length}</div>
                <div className="text-sm text-muted-foreground">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalTasks}</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalCommissions.toLocaleString('en-RW')} RWF</div>
                <div className="text-sm text-muted-foreground">Total Commissions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Payouts */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Payouts</CardTitle>
            <CardDescription>Review and confirm weekly payouts for agents</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyPayouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No agent activity this week</p>
                <p className="text-sm">Payouts will appear here when agents complete tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {weeklyPayouts.map((payout) => (
                  <div key={payout.agent_id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{payout.agent_name}</h3>
                        <p className="text-muted-foreground">Agent ID: {payout.agent_id.slice(0, 8)}...</p>
                      </div>
                      <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'}>
                        {payout.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-xl font-bold">{payout.tasks_completed}</div>
                        <div className="text-sm text-muted-foreground">Tasks Completed</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-xl font-bold">{payout.total_commission.toLocaleString('en-RW')} RWF</div>
                        <div className="text-sm text-muted-foreground">Total Commission (50%)</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-xl font-bold">
                          {(payout.total_commission * 2).toLocaleString('en-RW')} RWF
                        </div>
                        <div className="text-sm text-muted-foreground">Total Task Value</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Week: {new Date(payout.week_start).toLocaleDateString()} - {new Date(payout.week_end).toLocaleDateString()}
                      </span>
                      {payout.status !== 'paid' && (
                        <Button 
                          onClick={() => markAsPaid(payout.agent_id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Details */}
        {completedTasks.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>This Week's Completed Tasks</CardTitle>
              <CardDescription>Detailed breakdown of all completed tasks this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {task.client_name} • {task.service_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{task.price.toLocaleString('en-RW')} RWF</div>
                      <div className="text-sm text-muted-foreground">
                        Commission: {(task.price * task.commission_rate / 100).toLocaleString('en-RW')} RWF
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPayout;