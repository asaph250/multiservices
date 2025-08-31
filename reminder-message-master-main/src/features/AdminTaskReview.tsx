import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { FileText, User, DollarSign, Check, X, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskForReview {
  id: string;
  title: string;
  description: string;
  client_name: string;
  service_type: string;
  price: number;
  commission_rate: number;
  result_file_url: string;
  agent_notes: string;
  created_at: string;
  completed_at: string;
  agent_id: string;
}

const AdminTaskReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasksForReview, setTasksForReview] = useState<TaskForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskForReview | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fetchTasksForReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'submitted_for_review')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setTasksForReview(data || []);
    } catch (error) {
      console.error('Error fetching tasks for review:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks for review.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Approved",
        description: "Task has been approved and agent will be marked for payout.",
      });

      fetchTasksForReview();
    } catch (error) {
      console.error('Error approving task:', error);
      toast({
        title: "Error",
        description: "Failed to approve task.",
        variant: "destructive"
      });
    }
  };

  const rejectTask = async (taskId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'approved', // Send back to agent
          agent_notes: notes ? `Admin feedback: ${notes}` : 'Task rejected by admin, please redo.'
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Rejected",
        description: "Task has been sent back to agent for revision.",
      });

      setIsReviewOpen(false);
      setSelectedTask(null);
      setReviewNotes('');
      fetchTasksForReview();
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast({
        title: "Error",
        description: "Failed to reject task.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTasksForReview();
  }, [user]);

  const calculateCommission = (price: number, commissionRate: number) => {
    return (price * commissionRate / 100).toLocaleString('en-RW');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Eye className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading tasks for review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Task Review</h1>
          <p className="text-muted-foreground mt-2">Review completed agent work before final approval</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Awaiting Review</CardTitle>
            <CardDescription>Review agent submissions and approve or reject them</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksForReview.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tasks awaiting review</p>
                <p className="text-sm">Tasks will appear here when agents submit their work</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasksForReview.map((task) => (
                  <div key={task.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <p className="text-muted-foreground mb-2">{task.description}</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Awaiting Review
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Client:</span>
                          <p className="text-sm font-medium">{task.client_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Service:</span>
                          <p className="text-sm font-medium">{task.service_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <p className="text-sm font-medium">{task.price.toLocaleString('en-RW')} RWF</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Commission:</span>
                          <p className="text-sm font-medium">{calculateCommission(task.price, task.commission_rate)} RWF</p>
                        </div>
                      </div>
                    </div>

                    {task.agent_notes && (
                      <div className="mb-4 p-3 bg-muted/20 rounded">
                        <h4 className="text-sm font-medium mb-1">Agent Notes:</h4>
                        <p className="text-sm text-muted-foreground">{task.agent_notes}</p>
                      </div>
                    )}

                    {task.result_file_url && (
                      <div className="mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(task.result_file_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View/Download Result File
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <p>Completed: {new Date(task.completed_at).toLocaleDateString()}</p>
                        <p>Agent ID: {task.agent_id.slice(0, 8)}...</p>
                      </div>
                      <div className="space-x-2">
                        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTask(task)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Task</DialogTitle>
                              <DialogDescription>
                                Provide feedback for the agent to improve their work
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="reviewNotes">Feedback for Agent</Label>
                                <Textarea
                                  id="reviewNotes"
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  placeholder="Explain what needs to be improved..."
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => selectedTask && rejectTask(selectedTask.id, reviewNotes)}
                              >
                                Send Back for Revision
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          onClick={() => approveTask(task.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
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

export default AdminTaskReview;