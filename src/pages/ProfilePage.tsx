import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useAppStore((s) => s.authUser);
  const storeLogout = useAppStore((s) => s.logout);
  const { logout: supabaseLogout } = useAuth();

  if (!authUser) return null;

  return (
    <div className="p-4 md:p-8 lg:px-12 max-w-[1440px] mx-auto w-full pb-28 md:pb-12 min-h-screen animate-[fadeIn_0.3s_ease]">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
        Il Mio Profilo
      </h2>

      <div className="max-w-lg mx-auto">
        <div className="bg-[#FFFDD0] rounded-3xl p-6 soft-shadow border border-[#E5E0D6] mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-headline-md text-headline-md">{authUser.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">{authUser.name}</h3>
              <p className="font-body-md text-outline">{authUser.email}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-outline-variant/30 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-outline">Ruolo</span>
              <span className="font-body-lg text-on-surface capitalize bg-primary-container/20 px-3 py-1 rounded-full text-primary-container font-semibold">{authUser.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-md text-outline">Stato</span>
              <span className="font-body-lg text-[#4a7c59] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4a7c59] inline-block" />
                Attivo
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/20 shadow-sm">
          <h4 className="font-label-lg text-label-lg text-on-surface mb-3">Cambia Password</h4>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Vecchia Password"
              className="w-full p-3 rounded-full border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md bg-surface-container-lowest"
            />
            <input
              type="password"
              placeholder="Nuova Password"
              className="w-full p-3 rounded-full border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md bg-surface-container-lowest"
            />
            <button
              className="bg-primary-container text-on-primary font-label-md px-4 py-2.5 rounded-full hover:bg-primary transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              Aggiorna Password
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={async () => { storeLogout(); await supabaseLogout(); navigate('/login', { replace: true }); }}
            className="w-full bg-surface-container-lowest text-on-error font-label-lg py-3 rounded-full hover:bg-error-container transition-colors shadow-sm flex justify-center items-center gap-2 border border-outline-variant/40 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Esci dall'Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
