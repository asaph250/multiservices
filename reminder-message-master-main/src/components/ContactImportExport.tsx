
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ContactImportExport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      // Expected headers: name, phone, segment (optional)
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('number'));
      const segmentIndex = headers.findIndex(h => h.includes('segment') || h.includes('group'));

      if (nameIndex === -1 || phoneIndex === -1) {
        throw new Error('CSV must contain "name" and "phone" columns');
      }

      const customers = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= 2 && values[nameIndex] && values[phoneIndex]) {
          customers.push({
            user_id: user.id,
            name: values[nameIndex],
            phone_number: values[phoneIndex],
            segment: segmentIndex >= 0 ? values[segmentIndex] || null : null,
          });
        }
      }

      if (customers.length === 0) {
        throw new Error('No valid customer data found in file');
      }

      const { error } = await supabase
        .from('customers')
        .insert(customers);

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `Successfully imported ${customers.length} customers.`,
      });

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import customers.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim() || !user) return;

    setImporting(true);
    try {
      const lines = bulkText.trim().split('\n');
      const customers = [];

      for (const line of lines) {
        // Support formats: "Name, Phone" or "Name, Phone, Segment"
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          customers.push({
            user_id: user.id,
            name: parts[0],
            phone_number: parts[1],
            segment: parts[2] || null,
          });
        }
      }

      if (customers.length === 0) {
        throw new Error('No valid customer data found');
      }

      const { error } = await supabase
        .from('customers')
        .insert(customers);

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `Successfully imported ${customers.length} customers.`,
      });

      setBulkText('');
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import customers.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;

    setExporting(true);
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('name, phone_number, segment, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!customers || customers.length === 0) {
        toast({
          title: "No Data",
          description: "No customers to export.",
        });
        return;
      }

      // Create CSV content
      const headers = ['Name', 'Phone Number', 'Segment', 'Created Date'];
      const csvContent = [
        headers.join(','),
        ...customers.map(customer => [
          `"${customer.name}"`,
          `"${customer.phone_number}"`,
          `"${customer.segment || ''}"`,
          `"${new Date(customer.created_at).toLocaleDateString()}"`,
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Exported ${customers.length} customers to CSV file.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export customers.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import Customers
          </CardTitle>
          <CardDescription>
            Add customers in bulk using CSV file or text input
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                disabled={importing}
                className="file:mr-2 file:px-2 file:py-1 file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <p className="text-xs text-gray-500">
              CSV should have columns: name, phone, segment (optional)
            </p>
          </div>

          {/* Bulk Text Input */}
          <div className="space-y-2">
            <Label>Or Enter Customers Manually</Label>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Enter one customer per line:&#10;John Doe, +1234567890, VIP&#10;Jane Smith, +0987654321&#10;Bob Johnson, +1122334455, Regular"
              rows={6}
              disabled={importing}
            />
            <p className="text-xs text-gray-500">
              Format: Name, Phone Number, Segment (optional)
            </p>
            <Button 
              onClick={handleBulkImport} 
              disabled={!bulkText.trim() || importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Import Customers
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Customers
          </CardTitle>
          <CardDescription>
            Download your customer data as CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Export all your customers to a CSV file for backup or analysis.
            </p>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactImportExport;
