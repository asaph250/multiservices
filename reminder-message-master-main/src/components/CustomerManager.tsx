
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  segment?: string;
  created_at: string;
}

const CustomerManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    segment: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone_number.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            phone_number: formData.phone_number,
            segment: formData.segment || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: "Customer updated!",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Add new customer
        const { error } = await supabase
          .from('customers')
          .insert({
            name: formData.name,
            phone_number: formData.phone_number,
            segment: formData.segment || null,
            user_id: user?.id
          });

        if (error) throw error;

        toast({
          title: "Customer added!",
          description: `${formData.name} has been added to your customer list.`,
        });
      }

      setFormData({ name: "", phone_number: "", segment: "" });
      setIsAdding(false);
      setEditingId(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      phone_number: customer.phone_number,
      segment: customer.segment || ""
    });
    setEditingId(customer.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Customer deleted",
        description: `${name} has been removed from your customer list.`,
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", phone_number: "", segment: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading customers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Customer List</span>
            </CardTitle>
            <CardDescription>Manage your customer contacts</CardDescription>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? "Cancel" : "Add Customer"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="segment">Customer Segment (Optional)</Label>
              <Input
                id="segment"
                placeholder="e.g., VIP, Regular, New"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">
                {editingId ? "Update Customer" : "Add Customer"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {customers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers yet</h3>
            <p className="text-gray-600 mb-4">Add your first customer to get started.</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Customer
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone_number}</TableCell>
                    <TableCell>
                      {customer.segment && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {customer.segment}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {customers.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total customers: {customers.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerManager;
