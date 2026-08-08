import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AuthUser } from '../types';

function getAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;
  if (!raw) return [];
  return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

function roleFromEmail(email: string): 'admin' | 'staff' {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'staff';
}

function nameFromEmail(email: string): string {
  if (email.includes('gaia')) return 'Gaia';
  return email.split('@')[0];
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          name: nameFromEmail(u.email || ''),
          role: roleFromEmail(u.email || ''),
          email: u.email || '',
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          name: nameFromEmail(u.email || ''),
          role: roleFromEmail(u.email || ''),
          email: u.email || '',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase non configurato. Controlla il file .env' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message.includes('Invalid login') ? 'Credenziali non valide' : error.message };
      }
      return { success: true };
    } catch (e) {
      if (!navigator.onLine) {
        return { success: false, error: 'Sei offline. Verifica la connessione.' };
      }
      return { success: false, error: 'Errore di connessione' };
    }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  return { user, loading, login, logout, isConfigured: isSupabaseConfigured };
}
