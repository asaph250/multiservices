import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Users, Calendar, Settings, LogOut, History, Send, FileText, BarChart, Upload, CreditCard, Clock, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CustomerManager from "@/components/CustomerManager";
import MessageHistory from "@/components/MessageHistory";
import LanguageToggle from "@/components/LanguageToggle";
import CustomerTable from "@/components/CustomerTable";
import ThemeToggle from "@/components/ThemeToggle";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { useScheduledMessages } from "@/hooks/useScheduledMessages";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { scheduledMessages, loading: scheduledLoading, cancelScheduledMessage } = useScheduledMessages();
  const { toast } = useToast();

  // Fix navigation warning by using useEffect
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const handleCancelMessage = async (id: string) => {
    try {
      await cancelScheduledMessage(id);
      toast({
        title: "Message cancelled",
        description: "The scheduled message has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Reminder Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('welcome')}, {user.name}</span>
              <ThemeToggle />
              <LanguageToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status - Prominent Section */}
        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Link to="/payment">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Subscription</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Manage your plan</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/business-idea-generator">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-400">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Business Ideas</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">AI-powered suggestions</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/government-services">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-400">
              <CardContent className="p-6 text-center">
                <Building className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Gov Services</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">RRA & Irembo help</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/compose-message">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Send className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Send Message</h3>
                <p className="text-sm text-gray-600">Compose and send to customers</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/customers">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">{t('customers')}</h3>
                <p className="text-sm text-gray-600">{t('manageContactLists')}</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/templates">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Templates</h3>
                <p className="text-sm text-gray-600">Create reusable messages</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View performance insights</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/import-export">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Upload className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold">Import/Export</h3>
                <p className="text-sm text-gray-600">Manage customer data</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/message-history">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <History className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Message History</h3>
                <p className="text-sm text-gray-600">View all sent messages</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">247</CardTitle>
              <CardDescription>{t('totalCustomers')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">12</CardTitle>
              <CardDescription>{t('messagesSentThisWeek')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">95.8%</CardTitle>
              <CardDescription>{t('deliverySuccessRate')}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Customer Table Section */}
        <div className="mb-8">
          <CustomerTable />
        </div>

        {/* Customer List Section */}
        <div className="mb-8">
          <CustomerManager />
        </div>

        {/* Message History Section */}
        <div className="mb-8">
          <MessageHistory />
        </div>

        {/* Upcoming Scheduled Messages */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('upcomingScheduledMessages')}</CardTitle>
            <CardDescription>
              {scheduledMessages.length > 0 
                ? `${scheduledMessages.length} message${scheduledMessages.length !== 1 ? 's' : ''} scheduled for delivery`
                : 'No messages currently scheduled'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledLoading ? (
              <div className="text-center py-4 text-gray-500">Loading scheduled messages...</div>
            ) : scheduledMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No scheduled messages yet.</p>
                <p className="text-sm">Messages you schedule will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledMessages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Scheduled
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatScheduledDate(message.scheduled_for)}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{message.message_title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">
                        {message.message_body}
                      </p>
                      <p className="text-xs text-gray-500">
                        {message.customer_count} {t('recipients')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelMessage(message.id)}
                      >
                        Cancel
                      </Button>
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

export default Dashboard;
