
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
  
  // Защита от rate limiting и множественных запросов
  const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const lastTokenRefreshRef = useRef<number>(0);
  const activeRequestsRef = useRef<Set<string>>(new Set());
  const cachedSessionRef = useRef<Session | null>(null);

  // Дебаунс для обновления сессии с увеличенным временем
  const debouncedUpdateSession = (newSession: Session | null, source: string) => {
    const now = Date.now();
    
    // Проверяем, не слишком ли часто мы обновляем сессию
    if (now - lastTokenRefreshRef.current < 2000) {
      console.log('Skipping session update due to rate limiting protection');
      return;
    }
    
    // Проверяем, действительно ли сессия изменилась
    if (cachedSessionRef.current && newSession && 
        cachedSessionRef.current.access_token === newSession.access_token) {
      console.log('Session unchanged, skipping update');
      return;
    }

    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
    }

    tokenRefreshTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        console.log(`Updating session from ${source}`);
        lastTokenRefreshRef.current = now;
        cachedSessionRef.current = newSession;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    }, 1000); // Увеличили дебаунс до 1 секунды
  };

  useEffect(() => {
    mountedRef.current = true;
    let mounted = true;

    // Функция для безопасного получения сессии с защитой от дубликатов
    const getInitialSession = async () => {
      const requestId = `initial-${Date.now()}`;
      
      if (activeRequestsRef.current.has('initial')) {
        console.log('Initial session request already in progress');
        return;
      }
      
      activeRequestsRef.current.add('initial');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted && mountedRef.current) {
          console.log('Initial session check:', session?.user?.email || 'No session');
          cachedSessionRef.current = session;
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted && mountedRef.current) {
          setLoading(false);
        }
      } finally {
        activeRequestsRef.current.delete('initial');
      }
    };

    // Настройка слушателя событий аутентификации с улучшенной обработкой
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || !mountedRef.current) return;

        console.log('Auth state changed:', event, session?.user?.email || 'No session');
        
        // Обрабатываем разные события по-разному
        switch (event) {
          case 'SIGNED_IN':
          case 'SIGNED_OUT':
          case 'INITIAL_SESSION':
            // Для этих событий обновляем сессию немедленно
            if (mounted && mountedRef.current) {
              cachedSessionRef.current = session;
              setSession(session);
              setUser(session?.user ?? null);
              setLoading(false);
            }
            break;
            
          case 'TOKEN_REFRESHED':
            // Для обновления токенов используем дебаунс с защитой
            if (session) {
              debouncedUpdateSession(session, 'TOKEN_REFRESHED');
            }
            break;
            
          default:
            console.log('Unhandled auth event:', event);
        }
      }
    );

    // Получаем начальную сессию
    getInitialSession();

    return () => {
      mounted = false;
      mountedRef.current = false;
      activeRequestsRef.current.clear();
      
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
      
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (activeRequestsRef.current.has('signup')) {
      return { error: { message: 'Sign up already in progress' } };
    }
    
    activeRequestsRef.current.add('signup');
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      return { error };
    } finally {
      activeRequestsRef.current.delete('signup');
    }
  };

  const signIn = async (email: string, password: string) => {
    if (activeRequestsRef.current.has('signin')) {
      return { error: { message: 'Sign in already in progress' } };
    }
    
    activeRequestsRef.current.add('signin');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } finally {
      activeRequestsRef.current.delete('signin');
    }
  };

  const signOut = async () => {
    if (activeRequestsRef.current.has('signout')) {
      return { error: { message: 'Sign out already in progress' } };
    }
    
    activeRequestsRef.current.add('signout');
    
    try {
      // Очищаем кэш перед выходом
      cachedSessionRef.current = null;
      
      const { error } = await supabase.auth.signOut();
      return { error };
    } finally {
      activeRequestsRef.current.delete('signout');
    }
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
