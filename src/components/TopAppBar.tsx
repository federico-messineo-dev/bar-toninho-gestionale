import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSync } from '../hooks/useSync';
import useAppStore from '../store/useAppStore';

const TopAppBar: React.FC = () => {
  const navigate = useNavigate();
  const { status, isConfigured } = useSync();
  const products = useAppStore((s) => s.products);
  const unsyncedCount = products.filter((p) => !p.synced).length;

  const syncColor =
    !isConfigured ? 'bg-outline/40' :
    status === 'offline' ? 'bg-[#ba1a1a]' :
    status === 'syncing' ? 'bg-[#f9a825] animate-pulse' :
    unsyncedCount > 0 ? 'bg-[#f9a825]' :
    'bg-[#3d6b4f]';

  const syncTitle =
    !isConfigured ? 'Supabase non configurato' :
    status === 'offline' ? 'Offline' :
    status === 'syncing' ? 'Sincronizzazione in corso...' :
    unsyncedCount > 0 ? `${unsyncedCount} modifiche in attesa` :
    'Sincronizzato';

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-[#FFFDD0] border-b border-[#E5E0D6] p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/toninho-logo.png" alt="Caffè Toninho" className="h-8 w-auto shrink-0" />
        <div className="flex-1" />
        <div
          className={`w-2.5 h-2.5 rounded-full ${syncColor} shrink-0`}
          title={syncTitle}
        />
        <button
          onClick={() => navigate('/profilo')}
          className="w-10 h-10 bg-primary-container text-on-primary rounded-full flex items-center justify-center shadow-sm cursor-pointer active:scale-90"
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
        </button>
      </div>
    </header>
  );
};

export default TopAppBar;
