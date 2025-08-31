
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  price_paid: number | null;
  currency: string | null;
}

interface PaymentTransaction {
  id: string;
  transaction_id: string | null;
  payment_method: string;
  amount: number;
  currency: string | null;
  status: string;
  phone_number: string | null;
  reference_number: string | null;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
      } else {
        setPaymentHistory(data || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const createSubscription = async (planType: string, priceRwf: number) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: planType,
        status: 'inactive',
        price_paid: priceRwf,
        currency: 'RWF'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const createPaymentTransaction = async (
    subscriptionId: string,
    paymentMethod: string,
    amount: number,
    phoneNumber?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        payment_method: paymentMethod,
        amount: amount,
        currency: 'RWF',
        status: 'pending',
        phone_number: phoneNumber
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchPaymentHistory();
    }
  }, [user]);

  return {
    subscription,
    paymentHistory,
    loading,
    createSubscription,
    createPaymentTransaction,
    refetch: () => {
      fetchSubscription();
      fetchPaymentHistory();
    }
  };
};
