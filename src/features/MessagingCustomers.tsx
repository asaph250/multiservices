
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SendMessage from "@/features/ComposeMessage";
import CustomerManager from "@/components/CustomerManager";
import MessageTemplates from "@/components/MessageTemplates";
import MessageHistory from "@/components/MessageHistory";
import { useScheduledMessages } from "@/hooks/useScheduledMessages";
import { Clock } from "lucide-react";

export default function MessagingCustomers() {
  const { scheduledMessages, loading: scheduledLoading, cancelScheduledMessage } = useScheduledMessages();
  return (
    <Card className="w-full rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Messaging Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid grid-cols-5 gap-2">
            <TabsTrigger value="send">Send Message</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <SendMessage />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManager />
          </TabsContent>

          <TabsContent value="templates">
            <MessageTemplates />
          </TabsContent>

          <TabsContent value="history">
            <MessageHistory />
          </TabsContent>

          <TabsContent value="scheduled">
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
                        <span className="text-blue-600 font-semibold">Scheduled</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(message.scheduled_for).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{message.message_title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">
                        {message.message_body}
                      </p>
                      <p className="text-xs text-gray-500">
                        {message.customer_count} recipients
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        onClick={() => cancelScheduledMessage(message.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
