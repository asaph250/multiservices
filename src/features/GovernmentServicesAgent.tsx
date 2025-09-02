
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function GovernmentServicesAgent({ user, requests, refresh }) {

  const handleComplete = async (id) => {
    await supabase
      .from("requests")
      .update({ status: "completed" })
      .eq("id", id);
    if (refresh) await refresh();
  };

  const assignedRequests = (requests || []).filter(
    r => r.status === "assigned" && r.agent_id === user?.id
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedRequests.length === 0 ? (
            <div className="text-gray-400">No assigned requests.</div>
          ) : (
            <ul className="space-y-4">
              {assignedRequests.map((req) => (
                <li key={req.id} className="border rounded-lg p-4 shadow bg-gray-100 dark:bg-gray-800">
                  <div className="font-semibold text-blue-700 dark:text-blue-300">{req.service_type}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Client: {req.client_id}</div>
                  <div className="text-xs text-gray-500">Status: <span className="font-bold">{req.status}</span></div>
                  <div className="mt-2 flex gap-2">
                    <Button variant="default" onClick={() => handleComplete(req.id)}>Mark Complete</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
