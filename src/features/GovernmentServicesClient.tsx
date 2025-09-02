
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../supabaseClient";
import { useToast } from "@/hooks/use-toast";



export default function GovernmentServicesClient({ user, refresh }) {
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceType || !idNumber || !fullName || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    // Normalize phone/email
    const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");
    const normalizedEmail = (user?.email || "").trim().toLowerCase();
    let clientId = null;
    // If user is logged in, use their id/email
    if (user?.id) {
      clientId = user.id;
    } else {
      // Check if client exists by phone or email
      const { data: existingUsers, error: userError } = await supabase
        .from("users")
        .select("id")
        .or(`phone_number.eq.${normalizedPhone},email.eq.${normalizedEmail}`)
        .limit(1);
      if (userError) {
        setLoading(false);
        toast({
          title: "Submission Failed",
          description: userError.message,
          variant: "destructive"
        });
        return;
      }
      if (existingUsers && existingUsers.length > 0) {
        clientId = existingUsers[0].id;
        toast({
          title: "Client Already Exists",
          description: "Your phone or email is already registered. Submitting request as existing client.",
        });
      } else {
        // Insert new client
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            name: fullName,
            phone_number: normalizedPhone,
            email: normalizedEmail || null
          })
          .select()
          .single();
        if (insertError) {
          setLoading(false);
          toast({
            title: "Submission Failed",
            description: insertError.message,
            variant: "destructive"
          });
          return;
        }
        clientId = newUser.id;
      }
    }
    // Insert request with client_id
    const { error } = await supabase
      .from("service_requests")
      .insert({
        service_type: serviceType,
        client_id: clientId,
        full_name: fullName,
        phone_number: phoneNumber,
        document_details: description,
        notes: idNumber,
        status: "pending",
        created_at: new Date().toISOString()
      });
    if (refresh) await refresh();
    setLoading(false);
    if (error) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Request Submitted",
        description: "Your request has been submitted successfully.",
      });
      setServiceType("");
      setDescription("");
      setIdNumber("");
      setFullName("");
      setPhoneNumber("");
    }
  };

  return (
    <div className="grid gap-6">
      {/* Submit Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Government Service Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <Input
              placeholder="Service Type (e.g. Birth Certificate)"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
            />
            <Textarea
              placeholder="Describe your request"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              placeholder="Your National ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>Request #1 - Birth Certificate - Status: Pending</li>
            <li>Request #2 - Driving License - Status: Assigned</li>
            <li>Request #3 - Land Title - Status: Completed ✅</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
