
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const SubscriptionStatus = () => {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Subscription Status
        </CardTitle>
        <CardDescription>Your current plan and billing information</CardDescription>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(subscription.status)}>
                {getStatusIcon(subscription.status)}
                <span className="ml-1 capitalize">{subscription.status}</span>
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Plan:</span>
              <span className="capitalize">{subscription.plan_type}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Started:</span>
              <span>{formatDate(subscription.start_date)}</span>
            </div>
            
            {subscription.end_date && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Expires:</span>
                <span>{formatDate(subscription.end_date)}</span>
              </div>
            )}
            
            {subscription.price_paid && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span>{subscription.price_paid} {subscription.currency}</span>
              </div>
            )}

            {subscription.status === 'inactive' && (
              <div className="pt-4 border-t">
                <Link to="/payment">
                  <Button className="w-full">
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">No active subscription</p>
            <Link to="/payment">
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Choose a Plan
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
