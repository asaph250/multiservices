import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Check, X, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ServiceRequest {
  id: string;
  full_name: string;
  service_type: string;
  document_details: string;
  created_at: string;
  status: string;
  phone_number: string;
  notes: string;
}

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Check for admin role and redirect if not admin
  useEffect(() => {
    if (!loading && !preferencesLoading && user) {
      if (preferences?.user_role !== 'admin') {
        navigate('/');
        return;
      }
    }
  }, [user, preferences, loading, preferencesLoading, navigate]);

  const fetchServiceRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setServiceRequests(data || []);
      
      // Calculate counts
      const pending = data?.filter(req => req.status === 'pending').length || 0;
      const approved = data?.filter(req => req.status === 'approved').length || 0;
      const rejected = data?.filter(req => req.status === 'cancelled').length || 0;
      
      setCounts({ pending, approved, rejected });
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch service requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on selected filter
  useEffect(() => {
    let filtered = serviceRequests;
    
    if (filter === 'pending') {
      filtered = serviceRequests.filter(req => req.status === 'pending');
    } else if (filter === 'approved') {
      filtered = serviceRequests.filter(req => req.status === 'approved');
    } else if (filter === 'rejected') {
      filtered = serviceRequests.filter(req => req.status === 'cancelled');
    }
    
    setFilteredRequests(filtered);
  }, [serviceRequests, filter]);

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: "Service request has been approved successfully.",
      });

      fetchServiceRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "Service request has been rejected.",
      });

      fetchServiceRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  useEffect(() => {
    if (user && preferences?.user_role === 'admin') {
      fetchServiceRequests();
    }
  }, [user, preferences]);

  if (loading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need to be logged in to access the admin dashboard.</p>
          <Button onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (preferences?.user_role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges to access this page.</p>
          <Button onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">Hello Admin, here are your pending tasks for approval.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>Manage and approve service requests from clients</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('approved')}
                >
                  Approved
                </Button>
                <Button
                  variant={filter === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('rejected')}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading service requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No service requests found for the selected filter.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Request Details</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className={request.status === 'pending' ? 'bg-yellow-50/50' : ''}>
                      <TableCell className="font-medium">{request.full_name}</TableCell>
                      <TableCell>{request.service_type}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">
                          {request.document_details || request.notes || 'No details provided'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;