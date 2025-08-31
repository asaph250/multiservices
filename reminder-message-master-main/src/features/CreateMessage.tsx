
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ArrowLeft, Zap, Calendar, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LanguageToggle from "@/components/LanguageToggle";

const CreateMessage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [customerList, setCustomerList] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const generateAIMessage = async () => {
    if (!messageType) {
      toast({
        title: t('pleaseSelectMessageType'),
        description: t('chooseMessageTypeBeforeGenerating'),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiMessages = {
      "general-sale": "🛍️ New arrivals just landed! Discover amazing products at unbeatable prices. Visit us today and treat yourself to something special!",
      "flash-sale": "⚡ FLASH SALE ALERT! ⚡ 50% OFF everything for the next 24 hours only! Don't miss out on these incredible deals. Shop now before it's too late!",
      "special-offer": "🎁 EXCLUSIVE OFFER just for you! Buy 2 and get 1 absolutely FREE! Limited time only. Hurry in and save big today!",
      "holiday-greeting": "🎄 Season's Greetings from our family to yours! Wishing you joy, happiness, and wonderful moments this holiday season. Thank you for being our valued customer!",
      "birthday-message": "🎂 Happy Birthday! 🎉 Celebrate your special day with a special 20% discount on your next purchase. Make your birthday shopping extra sweet!"
    };

    setMessage(aiMessages[messageType as keyof typeof aiMessages] || "Generated message will appear here...");
    setIsGenerating(false);
    
    toast({
      title: t('aiMessageGenerated'),
      description: t('messageHasBeenCreated'),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Count recipients
      const recipients = customerList.split(/[,\n]/).filter(contact => contact.trim()).length;
      
      // Save message to database
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          message_text: message,
          scheduled_date: new Date(`${scheduleDate}T${scheduleTime}`).toISOString(),
          status: 'Scheduled',
          message_type: messageType,
          recipient_count: recipients
        });

      if (error) throw error;

      toast({
        title: t('messageScheduledSuccessfully'),
        description: `${t('yourMessageHasBeenScheduled')} ${scheduleDate} ${t('at')} ${scheduleTime}.`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Error",
        description: "Failed to schedule message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateSampleMessage = () => {
    const sampleMessages = [
      "🎉 Special promotion! Get 30% off on all items this weekend only. Don't miss out!",
      "🌟 New collection just arrived! Check out our latest styles and trends. Visit us today!",
      "💝 Thank you for being our valued customer! Enjoy exclusive member benefits.",
      "⏰ Limited time offer: Buy one, get one free on selected items. Hurry while stocks last!"
    ];
    
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    setMessage(randomMessage);
    
    toast({
      title: "Sample message generated!",
      description: "A sample sales message has been created for you.",
    });
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
                  {t('backToDashboard')}
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">{t('createNewMessage')}</h1>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                {t('messageDetails')}
              </CardTitle>
              <CardDescription>{t('chooseMessageTypeAndContent')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="messageType">{t('messageType')}</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectMessageType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general-sale">{t('generalSale')}</SelectItem>
                    <SelectItem value="flash-sale">{t('flashSale')}</SelectItem>
                    <SelectItem value="special-offer">{t('specialOffer')}</SelectItem>
                    <SelectItem value="holiday-greeting">{t('holidayGreeting')}</SelectItem>
                    <SelectItem value="birthday-message">{t('birthdayMessage')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="message">{t('messageContent')}</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSampleMessage}
                    >
                      {t('generateSampleSalesMessage')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIMessage}
                      disabled={isGenerating}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {isGenerating ? t('generating') : t('generateWithAI')}
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="message"
                  placeholder={t('writeMessageHere')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {message.length}/500 {t('characters')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {t('scheduleDelivery')}
              </CardTitle>
              <CardDescription>{t('whenShouldMessageBeSent')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduleDate">{t('date')}</Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="scheduleTime">{t('time')}</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {t('customerList')}
              </CardTitle>
              <CardDescription>{t('addCustomerContacts')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="customerList"
                placeholder={t('enterContactsSeparated')}
                value={customerList}
                onChange={(e) => setCustomerList(e.target.value)}
                rows={6}
                required
              />
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-500">
                  {t('separateContactsWithCommas')}
                </p>
                <Link to="/customers">
                  <Button type="button" variant="link" size="sm">
                    {t('manageSavedCustomerLists')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link to="/dashboard">
              <Button variant="outline">{t('cancel')}</Button>
            </Link>
            <Button type="submit">{t('scheduleMessage')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMessage;
