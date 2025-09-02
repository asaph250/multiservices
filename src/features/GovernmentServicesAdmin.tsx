
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { supabase } from "../supabaseClient";

export default function GovernmentServicesAdmin({ user, requests, refresh }) {
  // Handlers for admin actions
  const handleApprove = async (id) => {
    await supabase
      .from("service_requests")
      .update({ status: "approved" })
      .eq("id", id);
    if (refresh) await refresh();
  };

  const handleAssign = async (id) => {
    await supabase
      .from("service_requests")
      .update({ status: "in_progress", agent_id: "agent-1" })
      .eq("id", id);
    if (refresh) await refresh();
  };

  const handleReject = async (id) => {
    await supabase
      .from("service_requests")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (refresh) await refresh();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {(!requests || requests.length === 0) ? (
            <div className="text-gray-400">No requests found.</div>
          ) : (
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1">Service Type</th>
                  <th className="px-2 py-1">Client</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(requests || []).filter(r => r.status === "pending" || r.status === "approved").map((req) => (
                  <tr key={req.id} className="border-b">
                    <td className="px-2 py-1">{req.service_type}</td>
                    <td className="px-2 py-1">{req.client_id}</td>
                    <td className="px-2 py-1">{req.status}</td>
                    <td className="px-2 py-1 flex gap-2">
                      {req.status === "pending" && (
                        <>
                          <Button onClick={() => handleApprove(req.id)}>Approve</Button>
                          <Button variant="destructive" onClick={() => handleReject(req.id)}>Reject</Button>
                          <Button onClick={() => handleAssign(req.id)}>Assign to Agent</Button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <Button onClick={() => handleAssign(req.id)}>Assign to Agent</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
