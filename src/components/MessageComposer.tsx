
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Clock } from "lucide-react";
import CustomerSelection from "./CustomerSelection";
import { useScheduledMessages } from "@/hooks/useScheduledMessages";

const MessageComposer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createScheduledMessage } = useScheduledMessages();
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleSendMessage = async () => {
    if (!user || !messageTitle.trim() || !messageBody.trim() || selectedCustomers.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in the message title, body, and select at least one customer.",
        variant: "destructive"
      });
      return;
    }

    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      toast({
        title: "Missing schedule information",
        description: "Please select a date and time for the scheduled message.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      if (isScheduled) {
        // Create scheduled message
        const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        
        await createScheduledMessage({
          message_title: messageTitle.trim(),
          message_body: messageBody.trim(),
          scheduled_for: scheduledFor,
          customer_ids: selectedCustomers,
          customer_count: selectedCustomers.length,
        });

        toast({
          title: "📅 Message scheduled successfully!",
          description: `Your message will be sent on ${scheduledDate} at ${scheduledTime}.`,
        });
      } else {
        // Send immediately - save to message_history
        const { error: historyError } = await supabase
          .from('message_history')
          .insert({
            user_id: user.id,
            message_title: messageTitle.trim(),
            message_body: messageBody.trim(),
            customer_count: selectedCustomers.length,
            sent_at: new Date().toISOString()
          });

        if (historyError) throw historyError;

        // Update last_message_sent for selected customers
        const { error: updateError } = await supabase
          .from('customers')
          .update({ last_message_sent: new Date().toISOString() })
          .in('id', selectedCustomers);

        if (updateError) throw updateError;

        toast({
          title: "✅ Message sent successfully!",
          description: `Your message was successfully sent to ${selectedCustomers.length} customers.`,
        });
      }

      // Reset form
      setMessageTitle("");
      setMessageBody("");
      setSelectedCustomers([]);
      setIsScheduled(false);
      setScheduledDate("");
      setScheduledTime("");
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>
            Create a new message to send to your selected customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-title">Message Title</Label>
            <Input
              id="message-title"
              placeholder="Enter message title..."
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message-body">Message Body</Label>
            <Textarea
              id="message-body"
              placeholder="Enter your message content here..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Options
          </CardTitle>
          <CardDescription>
            Choose when to send your message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="schedule-toggle"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
            <Label htmlFor="schedule-toggle">Schedule for later</Label>
          </div>
          
          {isScheduled && (
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Date</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Time</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerSelection 
        selectedCustomers={selectedCustomers}
        onSelectionChange={setSelectedCustomers}
      />

      <div className="flex justify-end">
        <Button 
          onClick={handleSendMessage}
          disabled={!messageTitle.trim() || !messageBody.trim() || selectedCustomers.length === 0 || isSending}
          className={isScheduled ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
        >
          {isScheduled ? <Clock className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {isSending 
            ? (isScheduled ? "Scheduling..." : "Sending...") 
            : (isScheduled 
              ? `Schedule Message for ${selectedCustomers.length} Customer${selectedCustomers.length !== 1 ? 's' : ''}` 
              : `Send Message to ${selectedCustomers.length} Customer${selectedCustomers.length !== 1 ? 's' : ''}`
            )
          }
        </Button>
      </div>
    </div>
  );
};

export default MessageComposer;
