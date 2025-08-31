
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, CheckCircle, XCircle, Clock, ArrowLeft, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: string;
  phone_number: string;
  created_at: string;
  subscriptions: {
    plan_type: string;
    user_id: string;
  };
}

interface UserPaymentStatus {
  user_id: string;
  payment_status: string;
  language: string;
}

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [userPayments, setUserPayments] = useState<UserPaymentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'users'>('transactions');

  // Check for admin role and redirect if not admin
  useEffect(() => {
    if (!loading && !preferencesLoading && user) {
      if (preferences?.user_role !== 'admin') {
        navigate('/');
        return;
      }
    }
  }, [user, preferences, loading, preferencesLoading, navigate]);

  useEffect(() => {
    fetchPendingTransactions();
    fetchUserPaymentStatuses();
  }, []);

  const fetchPendingTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          subscriptions (
            plan_type,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment transactions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPaymentStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('user_id, payment_status, language')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPayments(data || []);
    } catch (error) {
      console.error('Error fetching user payment statuses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user payment statuses",
        variant: "destructive"
      });
    }
  };

  const handleApprovePayment = async (transactionId: string, subscriptionId: string) => {
    try {
      // Update transaction status to completed
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (transactionError) throw transactionError;

      // Update subscription status to active
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          start_date: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (subscriptionError) throw subscriptionError;

      toast({
        title: "Payment Approved",
        description: "Payment has been approved and subscription activated.",
      });

      fetchPendingTransactions();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive"
      });
    }
  };

  const handleRejectPayment = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'failed',
          processed_at: new Date().toISOString(),
          error_message: 'Payment rejected by admin'
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Payment Rejected",
        description: "Payment has been marked as rejected.",
      });

      fetchPendingTransactions();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePaymentStatus = async (userId: string, status: 'Paid' | 'Not Paid') => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ payment_status: status })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Payment status updated to ${status}`,
      });

      fetchUserPaymentStatuses();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    return status === 'Paid' ? 
      <Badge className="bg-green-100 text-green-800">Paid</Badge> : 
      <Badge className="bg-red-100 text-red-800">Not Paid</Badge>;
  };

  if (loading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access the admin panel.</p>
          <Button onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (preferences?.user_role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
          <Button onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('transactions')}
          >
            Payment Transactions
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            User Payment Status
          </Button>
        </div>

        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Transaction Management</CardTitle>
              <CardDescription>
                Review and approve pending payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payment transactions found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="capitalize">
                          {transaction.subscriptions?.plan_type || 'N/A'}
                        </TableCell>
                        <TableCell>
                          ${transaction.amount} {transaction.currency}
                        </TableCell>
                        <TableCell>{transaction.phone_number}</TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          {transaction.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprovePayment(transaction.id, transaction.subscription_id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectPayment(transaction.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
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
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Payment Status Management</CardTitle>
              <CardDescription>
                Manually update payment status for each trader
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userPayments.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Current Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPayments.map((userPayment) => (
                      <TableRow key={userPayment.user_id}>
                        <TableCell className="font-mono text-sm">
                          {userPayment.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(userPayment.payment_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePaymentStatus(userPayment.user_id, 'Paid')}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={userPayment.payment_status === 'Paid'}
                            >
                              Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdatePaymentStatus(userPayment.user_id, 'Not Paid')}
                              disabled={userPayment.payment_status === 'Not Paid'}
                            >
                              Mark Not Paid
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
