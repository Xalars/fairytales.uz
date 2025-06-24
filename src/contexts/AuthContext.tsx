
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
  
  // Circuit breaker для rate limiting protection
  const circuitBreakerRef = useRef({
    isOpen: false,
    lastFailure: 0,
    cooldownPeriod: 30000, // 30 секунд
    failureCount: 0
  });
  
  const mountedRef = useRef(true);
  const activeRequestsRef = useRef<Set<string>>(new Set());

  // Кэширование сессии в localStorage
  const cacheSession = (session: Session | null) => {
    try {
      if (session) {
        localStorage.setItem('cached_session', JSON.stringify({
          session,
          timestamp: Date.now()
        }));
      } else {
        localStorage.removeItem('cached_session');
      }
    } catch (error) {
      console.warn('Failed to cache session:', error);
    }
  };

  const getCachedSession = (): Session | null => {
    try {
      const cached = localStorage.getItem('cached_session');
      if (cached) {
        const { session, timestamp } = JSON.parse(cached);
        // Проверяем, не устарела ли кэшированная сессия (4 часа)
        if (Date.now() - timestamp < 4 * 60 * 60 * 1000) {
          return session;
        }
      }
    } catch (error) {
      console.warn('Failed to get cached session:', error);
    }
    return null;
  };

  // Проверка circuit breaker
  const checkCircuitBreaker = (): boolean => {
    const now = Date.now();
    if (circuitBreakerRef.current.isOpen) {
      if (now - circuitBreakerRef.current.lastFailure > circuitBreakerRef.current.cooldownPeriod) {
        console.log('Circuit breaker reset');
        circuitBreakerRef.current.isOpen = false;
        circuitBreakerRef.current.failureCount = 0;
        return true;
      }
      console.log('Circuit breaker is open, skipping request');
      return false;
    }
    return true;
  };

  // Активация circuit breaker при ошибках
  const activateCircuitBreaker = () => {
    circuitBreakerRef.current.failureCount++;
    if (circuitBreakerRef.current.failureCount >= 2) {
      console.log('Circuit breaker activated due to repeated failures');
      circuitBreakerRef.current.isOpen = true;
      circuitBreakerRef.current.lastFailure = Date.now();
    }
  };

  // Безопасное обновление состояния
  const updateAuthState = (newSession: Session | null, source: string) => {
    if (!mountedRef.current) return;
    
    console.log(`Updating auth state from ${source}:`, newSession?.user?.email || 'No session');
    
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
    
    // Кэшируем сессию
    cacheSession(newSession);
  };

  useEffect(() => {
    mountedRef.current = true;
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Сначала проверяем кэшированную сессию
        const cachedSession = getCachedSession();
        if (cachedSession && mounted && mountedRef.current) {
          console.log('Using cached session');
          updateAuthState(cachedSession, 'cache');
          return;
        }

        // Проверяем circuit breaker
        if (!checkCircuitBreaker()) {
          // Если circuit breaker активен, используем fallback
          if (mounted && mountedRef.current) {
            setLoading(false);
          }
          return;
        }

        // Получаем текущую сессию только если нет кэшированной
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          activateCircuitBreaker();
        }
        
        if (mounted && mountedRef.current) {
          updateAuthState(session, 'initial');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        activateCircuitBreaker();
        if (mounted && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Настройка слушателя событий - только для критических событий
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted || !mountedRef.current) return;

        console.log('Auth event:', event, session?.user?.email || 'No session');
        
        // Обрабатываем только критические события
        switch (event) {
          case 'SIGNED_IN':
          case 'SIGNED_OUT':
          case 'INITIAL_SESSION':
            updateAuthState(session, event);
            // Сбрасываем circuit breaker при успешном входе
            if (event === 'SIGNED_IN') {
              circuitBreakerRef.current.isOpen = false;
              circuitBreakerRef.current.failureCount = 0;
            }
            break;
            
          case 'TOKEN_REFRESHED':
            // Игнорируем TOKEN_REFRESHED события для предотвращения rate limiting
            console.log('Ignoring TOKEN_REFRESHED event to prevent rate limiting');
            break;
            
          default:
            console.log('Unhandled auth event:', event);
        }
      }
    );

    // Инициализируем аутентификацию
    initializeAuth();

    return () => {
      mounted = false;
      mountedRef.current = false;
      activeRequestsRef.current.clear();
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const requestId = 'signup';
    
    if (activeRequestsRef.current.has(requestId)) {
      return { error: { message: 'Sign up already in progress' } };
    }
    
    if (!checkCircuitBreaker()) {
      return { error: { message: 'Service temporarily unavailable. Please try again later.' } };
    }
    
    activeRequestsRef.current.add(requestId);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        activateCircuitBreaker();
      }
      
      return { error };
    } catch (error) {
      activateCircuitBreaker();
      return { error };
    } finally {
      activeRequestsRef.current.delete(requestId);
    }
  };

  const signIn = async (email: string, password: string) => {
    const requestId = 'signin';
    
    if (activeRequestsRef.current.has(requestId)) {
      return { error: { message: 'Sign in already in progress' } };
    }
    
    if (!checkCircuitBreaker()) {
      return { error: { message: 'Service temporarily unavailable. Please try again later.' } };
    }
    
    activeRequestsRef.current.add(requestId);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        activateCircuitBreaker();
      } else {
        // Сбрасываем circuit breaker при успешном входе
        circuitBreakerRef.current.isOpen = false;
        circuitBreakerRef.current.failureCount = 0;
      }
      
      return { error };
    } catch (error) {
      activateCircuitBreaker();
      return { error };
    } finally {
      activeRequestsRef.current.delete(requestId);
    }
  };

  const signOut = async () => {
    const requestId = 'signout';
    
    if (activeRequestsRef.current.has(requestId)) {
      return { error: { message: 'Sign out already in progress' } };
    }
    
    activeRequestsRef.current.add(requestId);
    
    try {
      // Очищаем кэш перед выходом
      localStorage.removeItem('cached_session');
      
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    } finally {
      activeRequestsRef.current.delete(requestId);
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
