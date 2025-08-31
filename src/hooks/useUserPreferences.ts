
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
  id: string;
  language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  timezone: string;
  date_format: string;
  user_role: 'admin' | 'agent' | 'client' | null;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error);
      } else if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          language: 'en',
          email_notifications: true,
          sms_notifications: true,
          marketing_emails: false,
          timezone: 'Africa/Kigali',
          date_format: 'DD/MM/YYYY'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default preferences:', error);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<Omit<UserPreferences, 'id'>>) => {
    if (!user || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        throw error;
      } else {
        setPreferences(data);
        return data;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences
  };
};
