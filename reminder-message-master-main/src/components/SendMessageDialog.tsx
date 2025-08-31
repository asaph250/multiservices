
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

const SendMessageDialog = () => {  
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!user || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // Get customer count
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, phone_number')
        .eq('user_id', user.id);

      if (customersError) throw customersError;

      const customerCount = customers?.length || 0;

      if (customerCount === 0) {
        toast({
          title: "No customers found",
          description: "Please add customers before sending messages.",
          variant: "destructive"
        });
        setIsSending(false);
        return;
      }

      // Save to message history
      const { error: historyError } = await supabase
        .from('message_history')
        .insert({
          user_id: user.id,
          message_text: message.trim(),
          customer_count: customerCount,
          sent_at: new Date().toISOString()
        });

      if (historyError) throw historyError;

      // Update last_message_sent for all customers
      const { error: updateError } = await supabase
        .from('customers')
        .update({ last_message_sent: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "✅ Message sent successfully!",
        description: `Message sent to ${customerCount} customers successfully.`,
      });

      setMessage("");
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4 mr-2" />
          Send Message Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Message to All Customers</DialogTitle>
          <DialogDescription>
            This message will be sent to all your customers immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
          >
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;
