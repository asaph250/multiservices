import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Users, Calendar, Settings, LogOut, History, Send, FileText, BarChart, Upload, CreditCard, Clock, Building } from "lucide-react";
import { Lightbulb } from "lucide-react";
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

  // ...existing code...
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
        {/* Only 4 cards shown */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
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
                <Lightbulb className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Business Generator</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">AI-powered suggestions</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/government-services">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-400">
              <CardContent className="p-6 text-center">
                <Building className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Government Services</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">RRA & Irembo help</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/messaging">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-green-400 bg-green-50/50 dark:bg-green-950/20 dark:border-green-400">
              <CardContent className="p-6 text-center">
                <Send className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">Messaging Customers</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Send and manage messages</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
