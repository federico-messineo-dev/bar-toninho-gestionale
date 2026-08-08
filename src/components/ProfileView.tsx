import React from 'react';
import { ADMIN_AVATAR, BRAND_LOGO_URL } from '../data/mockData';

interface ProfileViewProps {
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onLogout }) => {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-6 md:py-8 pb-28 min-h-screen">
      <h2 className="font-headline-lg text-headline-lg text-primary font-bold mb-6">
        Profilo Caffè Toninho
      </h2>

      {/* User Card */}
      <div className="bg-[#FFFDD0] rounded-xl p-6 border border-[#E5E0D6] soft-shadow mb-6 flex flex-col md:flex-row items-center gap-6">
        <img
          src={ADMIN_AVATAR}
          alt="Admin Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-md"
        />
        <div className="text-center md:text-left flex-1">
          <h3 className="font-headline-md text-headline-md text-primary font-bold">
            Gaia (Admin)
          </h3>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Gestore Principale • gaia.bilardi25@gmail.com
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm text-xs rounded-full font-semibold">
            Super Administrator
          </span>
        </div>
      </div>

      {/* Store Info Card */}
      <div className="bg-[#FFFDD0] rounded-xl p-6 border border-[#E5E0D6] soft-shadow space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-outline-variant">
          <img
            src={BRAND_LOGO_URL}
            alt="Caffè Toninho Logo"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h4 className="font-headline-md text-lg text-primary font-bold">
              Caffè Toninho
            </h4>
            <p className="text-sm text-outline">
              Locale Storico & Torrefazione Artigianale
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <span className="block text-xs text-outline font-semibold uppercase tracking-wider">
              Indirizzo
            </span>
            <span className="text-body-md text-on-surface">
              Via Roma 42, Firenze, Italia
            </span>
          </div>
          <div>
            <span className="block text-xs text-outline font-semibold uppercase tracking-wider">
              Partita IVA / C.F.
            </span>
            <span className="text-body-md text-on-surface">
              IT 08291030481
            </span>
          </div>
          <div>
            <span className="block text-xs text-outline font-semibold uppercase tracking-wider">
              Licenza Inventario
            </span>
            <span className="text-body-md text-on-surface">
              Piano Pro • Attiva
            </span>
          </div>
          <div>
            <span className="block text-xs text-outline font-semibold uppercase tracking-wider">
              Ultimo Backup Sincronizzato
            </span>
            <span className="text-body-md text-on-surface">
              Oggi, 16:45
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-outline-variant flex justify-end">
          <button
            onClick={onLogout}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Disconnetti da Caffè Toninho
          </button>
        </div>
      </div>
    </div>
  );
};
