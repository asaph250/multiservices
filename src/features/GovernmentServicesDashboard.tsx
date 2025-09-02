


import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import GovernmentServicesClient from "./GovernmentServicesClient";
import GovernmentServicesAdmin from "./GovernmentServicesAdmin";
import GovernmentServicesAgent from "./GovernmentServicesAgent";
import { useAuth } from "@/contexts/AuthContext";

const TABS = [
  { key: "client", label: "Client" },
  { key: "admin", label: "Admin" },
  { key: "agent", label: "Agent" },
];


export default function GovernmentServicesDashboard() {
  const [activeTab, setActiveTab] = useState("client");
  const [requests, setRequests] = useState([]);
  const { user } = useAuth();

  // Fetch real-time requests
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("service_requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests" },
        () => fetchRequests()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Tab content
  let tabContent;
  if (activeTab === "client") tabContent = <GovernmentServicesClient user={user} refresh={fetchRequests} />;
  else if (activeTab === "admin") tabContent = <GovernmentServicesAdmin user={user} requests={requests} refresh={fetchRequests} />;
  else if (activeTab === "agent") tabContent = <GovernmentServicesAgent user={user} requests={requests} refresh={fetchRequests} />;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-white flex items-center gap-2">
        <span role="img" aria-label="flag">🇷🇼</span> Government Services Dashboard
      </h1>

      {/* Tabs */}
      <div className="mb-8 flex gap-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-800 text-gray-300 hover:bg-blue-700 hover:text-white"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab dashboard */}
      <div className="mb-12">
        {tabContent}
      </div>

      {/* Real-time requests list (always visible) */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">📋 Submitted Requests (Real-Time)</h2>
        {requests.length === 0 ? (
          <p className="text-gray-400">No requests submitted yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((req) => (
              <li key={req.id} className="border rounded-lg p-4 shadow bg-gray-900 text-gray-100">
                <h3 className="font-semibold text-blue-300">{req.service_type}</h3>
                <p className="text-sm text-gray-300">Client: {req.client_id}</p>
                <p className="text-xs text-gray-400">
                  Status: {req.status} | Submitted: {new Date(req.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
