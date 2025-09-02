
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";

interface MessageHistoryItem {
  id: string;
  message_title: string | null;
  message_body: string | null;
  message_text: string | null;
  sent_at: string;
  customer_count: number;
}

const MessageHistoryPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessageHistory();
  }, [user]);

  const fetchMessageHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('message_history')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching message history:', error);
      toast({
        title: "Error",
        description: "Failed to load message history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageContent = (message: MessageHistoryItem) => {
    if (message.message_title && message.message_body) {
      return `${message.message_title}: ${message.message_body}`;
    }
    return message.message_text || message.message_title || message.message_body || "No content";
  };

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
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Message History</h1>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Sent Messages</CardTitle>
            <CardDescription>
              Complete history of all messages you've sent to your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading message history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages sent yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Message Content</TableHead>
                    <TableHead>Total Customers Reached</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        {formatDate(message.sent_at)}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="space-y-1">
                          {message.message_title && (
                            <p className="font-medium truncate" title={message.message_title}>
                              {message.message_title}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 truncate" title={getMessageContent(message)}>
                            {message.message_body || message.message_text || "No content"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{message.customer_count}</span>
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

export default MessageHistoryPage;
