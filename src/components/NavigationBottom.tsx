import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const bottomItems = [
  { id: 'dashboard', icon: 'dashboard', label: 'Home', path: '/dashboard' },
  { id: 'prodotti', icon: 'inventory_2', label: 'Prodotti', path: '/prodotti' },
  { id: 'qr-menu', icon: 'qr_code_2', label: 'QR Menu', path: '/qr-menu' },
  { id: 'utenti', icon: 'group', label: 'Utenti', path: '/utenti', adminOnly: true },
  { id: 'profilo', icon: 'person', label: 'Profilo', path: '/profilo' },
];

const NavigationBottom: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useAppStore((s) => s.authUser);

  const activeTab = (location.pathname.split('/')[1] || 'dashboard');
  const filteredItems = bottomItems.filter((item) => !item.adminOnly || authUser?.role === 'admin');

  const handleNav = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDD0] border-t border-[#E5E0D6] z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-[56px] transition-colors relative cursor-pointer active:scale-90 ${
                isActive ? 'text-primary' : 'text-outline'
              }`}
            >
              {isActive && (
                <div className="absolute inset-x-1 -top-1 h-1 bg-primary rounded-full" />
              )}
              <span className="material-symbols-outlined text-[22px] mb-0.5">{item.icon}</span>
              <span className="font-label-xs text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBottom;
