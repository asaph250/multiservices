
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsData {
  totalMessages: number;
  deliveredMessages: number;
  deliveryRate: number;
  totalCustomers: number;
  activeTemplates: number;
  monthlyStats: {
    month: string;
    sent: number;
    delivered: number;
  }[];
  categoryStats: {
    category: string;
    count: number;
  }[];
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get delivered messages
      const { count: deliveredMessages } = await supabase
        .from('message_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('delivery_status', 'delivered');

      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get active templates
      const { count: activeTemplates } = await supabase
        .from('message_templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Get monthly stats for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: monthlyData } = await supabase
        .from('message_analytics')
        .select('date, sent_count, delivered_count')
        .eq('user_id', user.id)
        .gte('date', sixMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Process monthly stats
      const monthlyStats = monthlyData?.reduce((acc, curr) => {
        const month = new Date(curr.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const existing = acc.find(item => item.month === month);
        
        if (existing) {
          existing.sent += curr.sent_count || 0;
          existing.delivered += curr.delivered_count || 0;
        } else {
          acc.push({
            month,
            sent: curr.sent_count || 0,
            delivered: curr.delivered_count || 0,
          });
        }
        return acc;
      }, [] as { month: string; sent: number; delivered: number; }[]) || [];

      // Get template category stats
      const { data: templateData } = await supabase
        .from('message_templates')
        .select('category')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const categoryStats = templateData?.reduce((acc, curr) => {
        const existing = acc.find(item => item.category === curr.category);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ category: curr.category, count: 1 });
        }
        return acc;
      }, [] as { category: string; count: number; }[]) || [];

      const deliveryRate = totalMessages ? (deliveredMessages || 0) / totalMessages * 100 : 0;

      setAnalytics({
        totalMessages: totalMessages || 0,
        deliveredMessages: deliveredMessages || 0,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        totalCustomers: totalCustomers || 0,
        activeTemplates: activeTemplates || 0,
        monthlyStats,
        categoryStats,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    analytics,
    loading,
    refetch: fetchAnalytics,
  };
};
