
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let mounted = true;

    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted && mountedRef.current) {
          console.log('Initial session check:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with improved handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || !mountedRef.current) return;

        console.log('Auth state changed:', event, session?.user?.email || 'No session');
        
        // Handle different events appropriately
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
        
        // Improved TOKEN_REFRESHED handling with better debouncing
        if (event === 'TOKEN_REFRESHED' && session) {
          // Clear any existing timeout
          if (tokenRefreshTimeoutRef.current) {
            clearTimeout(tokenRefreshTimeoutRef.current);
          }
          
          // Set a debounced update with validation
          tokenRefreshTimeoutRef.current = setTimeout(() => {
            if (mounted && mountedRef.current) {
              setSession(prevSession => {
                // Only update if the session is actually different and valid
                if (!prevSession || 
                    prevSession.access_token !== session.access_token ||
                    prevSession.expires_at !== session.expires_at) {
                  console.log('Token refreshed, updating session');
                  return session;
                }
                return prevSession;
              });
            }
          }, 200); // Increased debounce time
        }
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      mounted = false;
      mountedRef.current = false;
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
