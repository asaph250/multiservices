
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, CreditCard, ArrowLeft, Check, AlertCircle, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

const PaymentInstructions = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  // Updated plans with RWF pricing
  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      priceUSD: '$5',
      priceRWF: '5,100 RWF',
      duration: '1 month',
      description: 'Perfect for trying out our service',
      features: ['All basic features', 'Email support', 'Monthly billing'],
      savings: null
    },
    {
      id: 'quarterly',
      name: '3 Months Plan',
      priceUSD: '$12',
      priceRWF: '12,000 RWF',
      duration: '3 months',
      description: 'Save 20% with quarterly billing',
      features: ['All basic features', 'Priority support', 'Quarterly billing', '20% savings'],
      savings: '20%'
    },
    {
      id: 'biannual',
      name: '6 Months Plan',
      priceUSD: '$20',
      priceRWF: '20,000 RWF',
      duration: '6 months',
      description: 'Save 33% with semi-annual billing',
      features: ['All basic features', 'Priority support', 'Semi-annual billing', '33% savings'],
      savings: '33%'
    },
    {
      id: 'annual',
      name: '1 Year Plan',
      priceUSD: '$35',
      priceRWF: '35,000 RWF',
      duration: '1 year',
      description: 'Best value - Save 42% annually',
      features: ['All premium features', 'Priority support', 'Annual billing', '42% savings'],
      savings: '42%'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    const selectedPlanData = plans.find(p => p.id === planId);
    toast({
      title: "Plan Selected",
      description: `You have selected the ${selectedPlanData?.name}. Please proceed with payment.`,
    });
  };

  const handlePaymentConfirmation = async () => {
    if (!selectedPlan || !user) return;

    setIsSubmitting(true);
    try {
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      if (!selectedPlanData) return;

      // Extract numeric value from RWF price
      const priceRWF = parseInt(selectedPlanData.priceRWF.replace(/[^\d]/g, ''));

      // Create subscription record
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: selectedPlan,
          status: 'inactive',
          price_paid: priceRWF,
          currency: 'RWF'
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Create payment transaction record
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          payment_method: 'mtn_momo',
          amount: priceRWF,
          currency: 'RWF',
          status: 'pending',
          phone_number: '+250783969329'
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Payment Confirmation Submitted",
        description: "Your payment confirmation has been submitted to admin for verification. You will be notified once approved.",
      });

      setSelectedPlan('');
      
    } catch (error) {
      console.error('Error submitting payment confirmation:', error);
      toast({
        title: "Error",
        description: "Failed to submit payment confirmation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment Instructions</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Currency Notice */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Payment Currency:</strong> All payments are processed in Rwandan Francs (RWF). 
              Prices shown include currency conversion from USD.
            </p>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Choose Your Plan</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">Select the subscription plan that works best for you</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''} ${plan.savings ? 'border-green-200 dark:border-green-800' : ''}`}>
                {plan.savings && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Save {plan.savings}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">{plan.priceRWF}</div>
                    <div className="text-sm text-gray-500">({plan.priceUSD} USD)</div>
                    <div className="text-sm">per {plan.duration}</div>
                  </CardDescription>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Mobile Money Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Send payment to:</h3>
                <p className="text-2xl font-mono text-blue-600 dark:text-blue-400 font-bold">+250 783 969 329</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">MTN Mobile Money</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-1 mt-1">
                    <span className="block w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-medium">Step 1: Select Your Plan</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Choose your preferred subscription plan above</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-1 mt-1">
                    <span className="block w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-medium">Step 2: Send Payment</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Transfer the exact RWF amount to +250 783 969 329</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-1 mt-1">
                    <span className="block w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-medium">Step 3: Confirm Payment</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Click "I Have Paid" button to notify our admin</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedPlan ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Selected Plan:</h3>
                  <p className="text-lg font-medium">{plans.find(p => p.id === selectedPlan)?.name}</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {plans.find(p => p.id === selectedPlan)?.priceRWF}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ({plans.find(p => p.id === selectedPlan)?.priceUSD} USD equivalent)
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-300">Please select a plan above</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  After sending payment to +250 783 969 329, click the button below to notify our admin for verification.
                </p>
                
                <Button 
                  className="w-full" 
                  onClick={handlePaymentConfirmation}
                  disabled={!selectedPlan || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? "Submitting..." : "I Have Paid"}
                </Button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Your subscription will be activated after admin verification
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;
