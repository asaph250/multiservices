
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ScheduledMessage {
  id: string;
  message_title: string;
  message_body: string;
  scheduled_for: string;
  status: 'scheduled' | 'sent' | 'cancelled';
  customer_ids: string[];
  customer_count: number;
  created_at: string;
  updated_at: string;
}

export const useScheduledMessages = () => {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchScheduledMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        id: item.id,
        message_title: item.message_title,
        message_body: item.message_body,
        scheduled_for: item.scheduled_for,
        status: item.status as 'scheduled' | 'sent' | 'cancelled',
        customer_ids: Array.isArray(item.customer_ids) 
          ? (item.customer_ids as string[]).filter(id => typeof id === 'string')
          : [],
        customer_count: item.customer_count,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      setScheduledMessages(transformedData);
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createScheduledMessage = async (message: Omit<ScheduledMessage, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .insert({
          ...message,
          user_id: user.id,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        id: data.id,
        message_title: data.message_title,
        message_body: data.message_body,
        scheduled_for: data.scheduled_for,
        status: data.status as 'scheduled' | 'sent' | 'cancelled',
        customer_ids: Array.isArray(data.customer_ids) 
          ? (data.customer_ids as string[]).filter(id => typeof id === 'string')
          : [],
        customer_count: data.customer_count,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setScheduledMessages(prev => [...prev, transformedData]);
      return transformedData;
    } catch (error) {
      console.error('Error creating scheduled message:', error);
      throw error;
    }
  };

  const cancelScheduledMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      setScheduledMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      console.error('Error cancelling scheduled message:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchScheduledMessages();
  }, [user]);

  return {
    scheduledMessages,
    loading,
    createScheduledMessage,
    cancelScheduledMessage,
    refetch: fetchScheduledMessages,
  };
};
