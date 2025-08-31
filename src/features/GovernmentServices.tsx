
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Building2, Upload, CheckCircle, Phone, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

const GovernmentServices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state for client request
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    serviceType: '',
    documentDetails: '',
    notes: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleWhatsAppRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.fullName || !formData.phoneNumber || !formData.serviceType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          service_type: formData.serviceType,
          document_details: formData.documentDetails,
          notes: formData.notes,
          file_urls: uploadedFiles,
          client_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your service request has been submitted and will be reviewed by our admin team.",
      });

      // Reset form
      setFormData({
        fullName: '',
        phoneNumber: '',
        serviceType: '',
        documentDetails: '',
        notes: ''
      });
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Government Services</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Subtitle */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get Government Services Easily
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We help you with RRA, Irembo, and other official documents fast and stress-free.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* RRA Tax Declaration Card */}
          <Card className="border-2 border-yellow-400 hover:border-yellow-500 transition-colors bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-black dark:bg-yellow-400 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-yellow-400 dark:text-black" />
              </div>
              <CardTitle className="text-xl font-bold text-black dark:text-white">
                RRA Tax Declaration
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                We help you declare VAT, PAYE, and income tax on time!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black px-4 py-2 rounded-lg inline-block font-bold text-lg">
                Fixed Fee: 2,000 RWF
              </div>
              <Button 
                onClick={() => handleWhatsAppRedirect('https://wa.me/250783969329?text=Hello%2C%20I%20need%20help%20declaring%20my%20RRA%20taxes')}
                className="w-full bg-black hover:bg-gray-800 text-yellow-400 font-semibold py-3 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-black"
                size="lg"
              >
                Request via WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* IREMBO Certificate Assistance Card */}
          <Card className="border-2 border-yellow-400 hover:border-yellow-500 transition-colors bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-black dark:bg-yellow-400 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-yellow-400 dark:text-black" />
              </div>
              <CardTitle className="text-xl font-bold text-black dark:text-white">
                IREMBO Certificate Assistance
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                We help you apply for birth certificates, marriage documents, passports and more
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black px-4 py-2 rounded-lg inline-block font-bold text-lg">
                Fixed Fee: 3,000 RWF
              </div>
              <Button 
                onClick={() => handleWhatsAppRedirect('https://wa.me/250783969329?text=Hello%2C%20I%20want%20to%20request%20an%20Irembo%20document')}
                className="w-full bg-black hover:bg-gray-800 text-yellow-400 font-semibold py-3 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-black"
                size="lg"
              >
                Request via WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Client Service Request Form */}
        <div className="mt-12">
          <Card className="border-2 border-blue-400 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-black dark:text-white flex items-center justify-center">
                <CheckCircle className="h-6 w-6 mr-2 text-blue-600" />
                Submit Service Request
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                Fill out the form below to request government services. Our admin team will review and assign your request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="e.g., +250 123 456 789"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType" className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Service Type *
                  </Label>
                  <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the service you need" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RRA Tax Declaration">RRA Tax Declaration</SelectItem>
                      <SelectItem value="Irembo Birth Certificate">Irembo Birth Certificate</SelectItem>
                      <SelectItem value="Irembo Marriage Certificate">Irembo Marriage Certificate</SelectItem>
                      <SelectItem value="Irembo Passport Application">Irembo Passport Application</SelectItem>
                      <SelectItem value="RDB Business Registration">RDB Business Registration</SelectItem>
                      <SelectItem value="Other Government Service">Other Government Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentDetails" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Document Details
                  </Label>
                  <Textarea
                    id="documentDetails"
                    placeholder="Provide details about the documents you need (e.g., names, dates, specific requirements)"
                    value={formData.documentDetails}
                    onChange={(e) => handleInputChange('documentDetails', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information or special requests"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Attach Documents
                  </Label>
                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    maxFiles={5}
                    acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
                    maxFileSize={10}
                  />
                </div>

                <div className="text-center">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8"
                    size="lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="mt-10 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Fast & Reliable:</strong> Our team of experts will handle your documents professionally. 
              Contact us via WhatsApp for quick assistance!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentServices;
