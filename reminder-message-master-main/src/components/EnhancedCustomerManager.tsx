
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerGroups } from "@/hooks/useCustomerGroups";
import { BulkActionsBar } from "./BulkActionsBar";

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  segment?: string;
  created_at: string;
  groups?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export const EnhancedCustomerManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { groups, addCustomersToGroup } = useCustomerGroups();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");
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
        .select(`
          *,
          customer_group_memberships(
            customer_groups(
              id,
              name,
              color
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const customersWithGroups = data?.map(customer => ({
        ...customer,
        groups: customer.customer_group_memberships?.map(membership => 
          membership.customer_groups
        ).filter(Boolean) || []
      })) || [];
      
      setCustomers(customersWithGroups);
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

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    const newSelected = new Set(selectedCustomers);
    if (checked) {
      newSelected.add(customerId);
    } else {
      newSelected.delete(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
    } else {
      setSelectedCustomers(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedCustomers.size} customer(s)?`)) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .in('id', Array.from(selectedCustomers))
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast({
        title: "Customers deleted",
        description: `${selectedCustomers.size} customer(s) have been removed.`,
      });
      
      setSelectedCustomers(new Set());
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customers:', error);
      toast({
        title: "Error",
        description: "Failed to delete customers",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddToGroup = async () => {
    if (selectedCustomers.size === 0 || groups.length === 0) return;
    
    // For now, add to the first available group
    const firstGroup = groups[0];
    if (firstGroup) {
      await addCustomersToGroup(firstGroup.id, Array.from(selectedCustomers));
      setSelectedCustomers(new Set());
      fetchCustomers();
    }
  };

  const resetForm = () => {
    setFormData({ name: "", phone_number: "", segment: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone_number.includes(searchTerm);
    
    const matchesGroup = selectedGroupFilter === "all" || 
                        (selectedGroupFilter === "ungrouped" && customer.groups?.length === 0) ||
                        customer.groups?.some(group => group.id === selectedGroupFilter);
    
    return matchesSearch && matchesGroup;
  });

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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Customer List ({customers.length})</span>
              </CardTitle>
              <CardDescription>Manage your customer contacts with bulk actions and grouping</CardDescription>
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
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="ungrouped">Ungrouped</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      />
                      <span>{group.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || selectedGroupFilter !== "all" ? "No customers found" : "No customers yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedGroupFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Add your first customer to get started."
                }
              </p>
              {!searchTerm && selectedGroupFilter === "all" && (
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Groups</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.has(customer.id)}
                          onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone_number}</TableCell>
                      <TableCell>
                        {customer.segment && (
                          <Badge variant="outline">{customer.segment}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.groups?.map(group => (
                            <Badge 
                              key={group.id} 
                              variant="secondary"
                              className="text-xs"
                              style={{ backgroundColor: group.color + '20', color: group.color }}
                            >
                              {group.name}
                            </Badge>
                          ))}
                        </div>
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
        </CardContent>
      </Card>

      <BulkActionsBar
        selectedCount={selectedCustomers.size}
        onClearSelection={() => setSelectedCustomers(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkAddToGroup={handleBulkAddToGroup}
        onBulkMessage={() => {
          toast({
            title: "Coming soon!",
            description: "Bulk messaging feature will be available soon.",
          });
        }}
      />
    </>
  );
};
