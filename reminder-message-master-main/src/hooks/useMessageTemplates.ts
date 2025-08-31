
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTemplates = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        content: item.content,
        category: item.category || 'general',
        variables: Array.isArray(item.variables) ? item.variables.filter(v => typeof v === 'string') : [],
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      setTemplates(transformedData);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          ...template,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform the returned data
      const transformedData = {
        id: data.id,
        name: data.name,
        content: data.content,
        category: data.category || 'general',
        variables: Array.isArray(data.variables) ? data.variables.filter(v => typeof v === 'string') : [],
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setTemplates(prev => [transformedData, ...prev]);
      return transformedData;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Transform the returned data
      const transformedData = {
        id: data.id,
        name: data.name,
        content: data.content,
        category: data.category || 'general',
        variables: Array.isArray(data.variables) ? data.variables.filter(v => typeof v === 'string') : [],
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setTemplates(prev => prev.map(t => t.id === id ? transformedData : t));
      return transformedData;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
};
