import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, DollarSign, User, Briefcase, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  client_name: string;
  service_type: string;
  price: number;
  status: string;
  created_at: string;
  commission_rate: number;
}

const AgentTaskQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      // Fetch approved tasks
      const { data: approvedTasks, error: approvedError } = await supabase
        .from('tasks')
        .select('*')
        .eq('agent_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (approvedError) throw approvedError;

      // Fetch completed tasks
      const { data: completedTasksData, error: completedError } = await supabase
        .from('tasks')
        .select('*')
        .eq('agent_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (completedError) throw completedError;

      setActiveTasks(approvedTasks || []);
      setCompletedTasks(completedTasksData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitWorkOpen, setIsSubmitWorkOpen] = useState(false);
  const [workData, setWorkData] = useState({
    result_file_url: '',
    agent_notes: ''
  });

  const markTaskAsDone = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Completed",
        description: "Task marked as done successfully!",
      });

      // Refresh tasks
      fetchTasks();
    } catch (error) {
      console.error('Error marking task as done:', error);
      toast({
        title: "Error",
        description: "Failed to mark task as done. Please try again.",
        variant: "destructive"
      });
    }
  };

  const submitWorkForReview = async () => {
    if (!selectedTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'submitted_for_review',
          completed_at: new Date().toISOString(),
          result_file_url: workData.result_file_url,
          agent_notes: workData.agent_notes
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      toast({
        title: "Work Submitted",
        description: "Your work has been submitted for admin review.",
      });

      setIsSubmitWorkOpen(false);
      setSelectedTask(null);
      setWorkData({ result_file_url: '', agent_notes: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error submitting work:', error);
      toast({
        title: "Error",
        description: "Failed to submit work. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const calculateCommission = (price: number, commissionRate: number) => {
    return (price * commissionRate / 100).toLocaleString('en-RW');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  const totalEarnings = completedTasks.reduce((sum, task) => 
    sum + (task.price * task.commission_rate / 100), 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Agent Task Queue</h1>
          <p className="text-muted-foreground mt-2">Manage your assigned tasks and track earnings</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Briefcase className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTasks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEarnings.toLocaleString('en-RW')} RWF</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Tasks approved by admin and ready to be completed</CardDescription>
          </CardHeader>
          <CardContent>
            {activeTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active tasks available</p>
                <p className="text-sm">Check back later for new assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <p className="text-muted-foreground mb-2">{task.description}</p>
                      </div>
                      <Badge variant="secondary">
                        {task.service_type}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Client: {task.client_name}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Price: {task.price.toLocaleString('en-RW')} RWF</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Commission: {calculateCommission(task.price, task.commission_rate)} RWF</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Assigned: {new Date(task.created_at).toLocaleDateString()}
                      </span>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => markTaskAsDone(task.id)}
                        >
                          Quick Complete
                        </Button>
                        <Dialog open={isSubmitWorkOpen} onOpenChange={setIsSubmitWorkOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedTask(task)}>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit Work
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit Work for Review</DialogTitle>
                              <DialogDescription>
                                Upload your completed work for admin review
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="fileUrl">Result File URL</Label>
                                <Input
                                  id="fileUrl"
                                  value={workData.result_file_url}
                                  onChange={(e) => setWorkData({...workData, result_file_url: e.target.value})}
                                  placeholder="https://drive.google.com/file/d/... or similar"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Work Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={workData.agent_notes}
                                  onChange={(e) => setWorkData({...workData, agent_notes: e.target.value})}
                                  placeholder="Describe the work completed, any challenges, etc."
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsSubmitWorkOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={submitWorkForReview}>
                                Submit for Review
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
            <CardDescription>Your completed tasks and earned commissions</CardDescription>
          </CardHeader>
          <CardContent>
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No completed tasks yet</p>
                <p className="text-sm">Complete tasks to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-muted-foreground text-sm">{task.description}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Client: </span>
                        <span>{task.client_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Service: </span>
                        <span>{task.service_type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price: </span>
                        <span>{task.price.toLocaleString('en-RW')} RWF</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission: </span>
                        <span className="font-semibold text-green-600">
                          {calculateCommission(task.price, task.commission_rate)} RWF
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentTaskQueue;