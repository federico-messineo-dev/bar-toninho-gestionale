import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const localLogin = useAppStore((s) => s.hydrate);
  const { user, loading: authLoading, login: supabaseLogin, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      setAuthUser(user);
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate, setAuthUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isConfigured) {
      const result = await supabaseLogin(email, password);
      if (result.success) {
        return;
      }
      setError(result.error || 'Credenziali non valide');
      setLoading(false);
    } else {
      await new Promise((r) => setTimeout(r, 300));
      const success = useAppStore.getState().authUser !== null;
      if (success) {
        navigate('/dashboard');
      } else {
        const { default: db } = await import('../db/dexie');
        const userDoc = await db.users.where('email').equals(email).first();
        if (userDoc && userDoc.password === password) {
          const authUser = {
            id: userDoc.id,
            name: userDoc.name,
            role: userDoc.role === 'Admin' ? 'admin' as const : 'staff' as const,
            email: userDoc.email,
          };
          setAuthUser(authUser);
          navigate('/dashboard');
        } else {
          setError('Email o password non validi.');
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#722F37] via-[#8a3840] to-[#5a252c] p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="bg-[#FFFDD0] rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl relative z-10 border border-white/20 animate-[fadeIn_0.4s_ease]">
        <div className="text-center mb-8">
          <img src="/toninho-logo.png" alt="Caffè Toninho" className="h-14 w-auto mx-auto mb-3" />
          <p className="font-body-md text-outline">Gestione Magazzino e Menu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-container text-on-error p-3 rounded-xl font-label-sm animate-[slideDown_0.2s_ease]">
              {error}
            </div>
          )}

          <div>
            <label className="font-label-md text-label-md text-outline block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gaia@bottega.it"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant p-3 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md placeholder:text-outline-variant"
            />
          </div>

          <div>
            <label className="font-label-md text-label-md text-outline block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant p-3 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md placeholder:text-outline-variant"
            />
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full bg-primary text-white font-label-lg py-3.5 rounded-xl shadow-md hover:bg-primary/90 transition-colors disabled:opacity-70 cursor-pointer active:scale-[0.98]"
          >
            {loading || authLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                Accesso in corso...
              </span>
            ) : (
              'Accedi'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant/40 text-center">
          <p className="font-body-sm text-outline text-xs mb-2">
            {isConfigured ? 'Accesso via Supabase' : 'Modalità offline (Supabase non configurato)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
