import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const sidebarItems = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'prodotti', icon: 'inventory_2', label: 'Prodotti', path: '/prodotti' },
  { id: 'qr-menu', icon: 'qr_code_2', label: 'Menu QR', path: '/qr-menu' },
  { id: 'utenti', icon: 'group', label: 'Utenti', path: '/utenti', adminOnly: true },
  { id: 'profilo', icon: 'person', label: 'Profilo', path: '/profilo' },
];

const NavigationSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAppStore((s) => s.logout);
  const authUser = useAppStore((s) => s.authUser);

  const activeTab = (location.pathname.split('/')[1] || 'dashboard');
  const filteredItems = sidebarItems.filter((item) => !item.adminOnly || authUser?.role === 'admin');

  const handleNav = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#FFFDD0] border-r border-[#E5E0D6] p-6 fixed left-0 top-0 z-30">
      <div className="flex items-center gap-3 mb-10 pl-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-white">storefront</span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md text-primary leading-tight">Caffè Toninho</h1>
          <p className="font-body-sm text-outline text-[11px]">Gestione Magazzino</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-body-md text-body-md transition-colors relative overflow-hidden cursor-pointer active:scale-[0.97] ${
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary-container rounded-2xl -z-10" />
              )}
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => { logout(); navigate('/login', { replace: true }); }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl font-body-md text-outline hover:text-on-error hover:bg-error-container/50 transition-colors mt-auto cursor-pointer active:scale-[0.97]"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        Esci
      </button>
    </aside>
  );
};

export default NavigationSidebar;
