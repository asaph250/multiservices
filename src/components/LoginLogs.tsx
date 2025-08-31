
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface LoginLog {
  id: string;
  email: string;
  login_attempt_at: string;
  success: boolean;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
}

const LoginLogs = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('login_logs')
          .select('*')
          .order('login_attempt_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching login logs:', error);
          return;
        }

        setLogs(data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <div className="p-4">Loading login logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Activity</CardTitle>
        <CardDescription>Recent login attempts for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-gray-500">No login logs found.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{log.email}</span>
                    <Badge variant={log.success ? "default" : "destructive"}>
                      {log.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(log.login_attempt_at).toLocaleString()}
                  </div>
                  {log.error_message && (
                    <div className="text-sm text-red-600 mt-1">
                      Error: {log.error_message}
                    </div>
                  )}
                  {log.user_agent && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {log.user_agent}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginLogs;
