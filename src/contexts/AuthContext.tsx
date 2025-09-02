
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'basic' | 'pro' | 'vip' | null;
  role: string; // e.g. 'user', 'builder', 'admin'
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to log login attempts
const logLoginAttempt = async (email: string, success: boolean, userId?: string, errorMessage?: string) => {
  try {
    const { error } = await supabase
      .from('login_logs')
      .insert({
        user_id: userId || null,
        email: email,
        success: success,
        ip_address: null, // Would need additional setup to get real IP
        user_agent: navigator.userAgent,
        error_message: errorMessage || null,
        login_attempt_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Failed to log login attempt:', error);
    }
  } catch (err) {
    console.error('Error logging login attempt:', err);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          subscription: 'basic',
          role: session.user.user_metadata?.role || 'user',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Then check for existing session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          subscription: 'basic',
          role: session.user.user_metadata?.role || 'user',
        });
      }
      setLoading(false);
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        console.error('Login error:', error);
        // Log failed login attempt
        await logLoginAttempt(email, false, undefined, error.message);
        throw error;
      }
      
      // Log successful login attempt
      await logLoginAttempt(email, true, data.user?.id);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
