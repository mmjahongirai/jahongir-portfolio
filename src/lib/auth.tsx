'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { Profile } from './supabase';

type AuthContextType = {
  user: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = useCallback(async (userId: string, email: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) return data as Profile;

      // Table missing / RLS / network
      if (error && (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache'))) {
        return null;
      }

      // Create profile only if missing (do not overwrite admin role)
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, email, role: 'user' })
        .select('*')
        .maybeSingle();

      if (insertError) {
        const { data: again } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        return (again as Profile | null) ?? null;
      }
      return (inserted as Profile | null) ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const profile = await ensureProfile(session.user.id, session.user.email || '');
          if (mounted) setUser(profile);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      ;(async () => {
        if (!mounted) return;
        if (session?.user) {
          const profile = await ensureProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setUser(profile);
            setLoading(false);
          }
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      const profile = await ensureProfile(data.user.id, data.user.email || email);
      setUser(profile);
      if (!profile) {
        return {
          error:
            'Logged in, but profiles table is missing or incomplete. Run supabase/SETUP_ALL.sql in the Supabase SQL Editor.',
        };
      }
      if (profile.role !== 'admin') {
        return {
          error:
            "Account exists but is not admin. In Supabase SQL run: update profiles set role = 'admin' where email = 'mmjahongirai@gmail.com';",
        };
      }
    }

    return { error: null };
  }, [ensureProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.role === 'admin', signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
