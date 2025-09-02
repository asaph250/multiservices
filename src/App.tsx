import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./features/Index";
import Login from "./features/Login";
import Signup from "./features/Signup";
import Dashboard from "./features/Dashboard";
import CreateMessage from "./features/CreateMessage";
import ComposeMessage from "./features/ComposeMessage";
import Customers from "./features/Customers";
import PaymentInstructions from "./features/PaymentInstructions";
import AdminDashboard from "./features/AdminDashboard";
import AdminPanel from "./features/AdminPanel";
import MessageHistoryPage from "./features/MessageHistoryPage";
import Settings from "./features/Settings";
import NotFound from "./features/NotFound";
import Templates from "./features/Templates";
import Analytics from "./features/Analytics";
import ImportExport from "./features/ImportExport";
import GovernmentServicesDashboard from "./features/GovernmentServicesDashboard";
import BusinessIdeaGenerator from "./features/BusinessIdeaGenerator";
import Subscription from "./features/Subscription";
import AgentTaskQueue from "./features/AgentTaskQueue";
import AdminPayout from "./features/AdminPayout";
import AdminRequestQueue from "./features/AdminRequestQueue";
import AdminTaskReview from "./features/AdminTaskReview";
import MessagingCustomers from "./features/MessagingCustomers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-message" element={<CreateMessage />} />
                <Route path="/compose-message" element={<ComposeMessage />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/message-history" element={<MessageHistoryPage />} />
                <Route path="/payment" element={<PaymentInstructions />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/import-export" element={<ImportExport />} />
                <Route path="/government-services" element={<GovernmentServicesDashboard />} />
                <Route path="/business-idea-generator" element={<BusinessIdeaGenerator />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/agent-tasks" element={<AgentTaskQueue />} />
                <Route path="/admin-payout" element={<AdminPayout />} />
                <Route path="/admin-requests" element={<AdminRequestQueue />} />
                <Route path="/admin-task-review" element={<AdminTaskReview />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-panel" element={<AdminPanel />} />
                <Route path="/messaging" element={<MessagingCustomers />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
