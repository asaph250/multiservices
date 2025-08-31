
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
  customer_count?: number;
}

export const useCustomerGroups = () => {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGroups = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_groups')
        .select(`
          *,
          customer_group_memberships(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const groupsWithCount = data?.map(group => ({
        ...group,
        customer_count: group.customer_group_memberships?.[0]?.count || 0
      })) || [];
      
      setGroups(groupsWithCount);
    } catch (error) {
      console.error('Error fetching customer groups:', error);
      toast({
        title: "Error",
        description: "Failed to load customer groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: Omit<CustomerGroup, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('customer_groups')
        .insert({
          ...groupData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchGroups();
      toast({
        title: "Group created!",
        description: `${groupData.name} has been created successfully.`
      });
      
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateGroup = async (id: string, updates: Partial<CustomerGroup>) => {
    try {
      const { error } = await supabase
        .from('customer_groups')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      await fetchGroups();
      toast({
        title: "Group updated!",
        description: "Group has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive"
      });
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_groups')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      await fetchGroups();
      toast({
        title: "Group deleted",
        description: "Group has been removed successfully."
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive"
      });
    }
  };

  const addCustomersToGroup = async (groupId: string, customerIds: string[]) => {
    try {
      const memberships = customerIds.map(customerId => ({
        group_id: groupId,
        customer_id: customerId
      }));

      const { error } = await supabase
        .from('customer_group_memberships')
        .insert(memberships);

      if (error) throw error;
      
      await fetchGroups();
      toast({
        title: "Customers added!",
        description: `${customerIds.length} customer(s) added to group.`
      });
    } catch (error) {
      console.error('Error adding customers to group:', error);
      toast({
        title: "Error",
        description: "Failed to add customers to group",
        variant: "destructive"
      });
    }
  };

  const removeCustomersFromGroup = async (groupId: string, customerIds: string[]) => {
    try {
      const { error } = await supabase
        .from('customer_group_memberships')
        .delete()
        .eq('group_id', groupId)
        .in('customer_id', customerIds);

      if (error) throw error;
      
      await fetchGroups();
      toast({
        title: "Customers removed!",
        description: `${customerIds.length} customer(s) removed from group.`
      });
    } catch (error) {
      console.error('Error removing customers from group:', error);
      toast({
        title: "Error",
        description: "Failed to remove customers from group",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  return {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    addCustomersToGroup,
    removeCustomersFromGroup,
    refetch: fetchGroups
  };
};
