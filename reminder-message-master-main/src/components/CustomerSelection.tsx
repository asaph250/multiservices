
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  phone_number: string;
}

interface CustomerSelectionProps {
  selectedCustomers: string[];
  onSelectionChange: (customerIds: string[]) => void;
}

const CustomerSelection = ({ selectedCustomers, onSelectionChange }: CustomerSelectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone_number')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(customers.map(c => c.id));
    }
  };

  const handleCustomerToggle = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      onSelectionChange(selectedCustomers.filter(id => id !== customerId));
    } else {
      onSelectionChange([...selectedCustomers, customerId]);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Select Customers
        </CardTitle>
        <CardDescription>
          Choose which customers to send your message to ({selectedCustomers.length} selected)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No customers found. Add customers first to send messages.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="select-all"
                checked={selectedCustomers.length === customers.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="font-medium cursor-pointer">
                Select All ({customers.length} customers)
              </label>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={customer.id}
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => handleCustomerToggle(customer.id)}
                  />
                  <label htmlFor={customer.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.phone_number}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerSelection;
