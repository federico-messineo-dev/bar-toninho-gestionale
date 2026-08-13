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
    !isConfigured ? 'bg-[#7A6A54]' :
    status === 'offline' ? 'bg-[#B85C4A] shadow-[0_0_6px_rgba(184,92,74,0.6)]' :
    status === 'syncing' ? 'bg-[#D9A441] shadow-[0_0_6px_rgba(217,164,65,0.6)] animate-pulse' :
    unsyncedCount > 0 ? 'bg-[#D9A441] shadow-[0_0_6px_rgba(217,164,65,0.5)]' :
    'bg-[#7F9B6B] shadow-[0_0_6px_rgba(127,155,107,0.5)]';

  const syncTitle =
    !isConfigured ? 'Supabase non configurato' :
    status === 'offline' ? 'Offline' :
    status === 'syncing' ? 'Sincronizzazione in corso...' :
    unsyncedCount > 0 ? `${unsyncedCount} modifiche in attesa` :
    'Sincronizzato';

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-card border-b border-outline-variant p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/toninho-logo.png" alt="Caffè Toninho" className="h-8 w-auto shrink-0" />
        <div className="flex-1" />
        <div
          className={`w-3.5 h-3.5 rounded-full ${syncColor} shrink-0`}
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
