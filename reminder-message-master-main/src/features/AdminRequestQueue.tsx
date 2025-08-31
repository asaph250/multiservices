import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, User, Phone, FileText, Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ServiceRequest {
  id: string;
  full_name: string;
  phone_number: string;
  service_type: string;
  document_details: string;
  notes: string;
  status: string;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
}

const AdminRequestQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    price: '',
    agent_id: '',
    commission_rate: '50'
  });
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch service requests.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      // Get users with agent role
      const { data, error } = await supabase
        .from('user_preferences')
        .select('user_id')
        .eq('user_role', 'agent');

      if (error) throw error;

      // For now, we'll just show agent IDs as names since we don't have a profiles table
      const agentList = (data || []).map(agent => ({
        id: agent.user_id,
        name: `Agent ${agent.user_id.slice(0, 8)}...`
      }));

      setAgents(agentList);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: "Service request has been approved. You can now create a task for it.",
      });

      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive"
      });
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "Service request has been rejected.",
      });

      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive"
      });
    }
  };

  const createTaskFromRequest = async () => {
    if (!selectedRequest || !taskData.title || !taskData.price || !taskData.agent_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create task
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          client_name: selectedRequest.full_name,
          service_type: selectedRequest.service_type,
          price: parseFloat(taskData.price),
          commission_rate: parseFloat(taskData.commission_rate),
          agent_id: taskData.agent_id,
          admin_id: user?.id,
          service_request_id: selectedRequest.id,
          status: 'approved'
        });

      if (taskError) throw taskError;

      // Update service request status
      const { error: updateError } = await supabase
        .from('service_requests')
        .update({ status: 'converted_to_task' })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      toast({
        title: "Task Created",
        description: "Task has been created and assigned to the agent.",
      });

      setIsCreateTaskOpen(false);
      setSelectedRequest(null);
      setTaskData({
        title: '',
        description: '',
        price: '',
        agent_id: '',
        commission_rate: '50'
      });
      fetchRequests();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchAgents();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'converted_to_task': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ClipboardList className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Request Queue</h1>
          <p className="text-muted-foreground mt-2">Review and approve client service requests</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Requests</CardTitle>
            <CardDescription>Review client requests and create tasks for agents</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No service requests available</p>
                <p className="text-sm">Requests will appear here when clients submit them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{request.service_type}</h3>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{request.full_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{request.phone_number}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {request.document_details && (
                      <div className="mb-4">
                        <div className="flex items-center mb-1">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">Document Details:</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{request.document_details}</p>
                      </div>
                    )}

                    {request.notes && (
                      <div className="mb-4">
                        <p className="text-sm"><strong>Notes:</strong> {request.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      <div className="space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectRequest(request.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveRequest(request.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Create Task
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Create Task</DialogTitle>
                                <DialogDescription>
                                  Create a task for {selectedRequest?.service_type}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="title">Task Title *</Label>
                                  <Input
                                    id="title"
                                    value={taskData.title}
                                    onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                                    placeholder="Enter task title"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="description">Description</Label>
                                  <Textarea
                                    id="description"
                                    value={taskData.description}
                                    onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                                    placeholder="Task description"
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="price">Price (RWF) *</Label>
                                  <Input
                                    id="price"
                                    type="number"
                                    value={taskData.price}
                                    onChange={(e) => setTaskData({...taskData, price: e.target.value})}
                                    placeholder="Enter price"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="agent">Assign to Agent *</Label>
                                  <Select value={taskData.agent_id} onValueChange={(value) => setTaskData({...taskData, agent_id: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {agents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                          {agent.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="commission">Commission Rate (%)</Label>
                                  <Input
                                    id="commission"
                                    type="number"
                                    value={taskData.commission_rate}
                                    onChange={(e) => setTaskData({...taskData, commission_rate: e.target.value})}
                                    placeholder="50"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={createTaskFromRequest}>
                                  Create Task
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
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

export default AdminRequestQueue;