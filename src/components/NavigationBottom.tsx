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
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-elevated/85 backdrop-blur-md rounded-[40px] shadow-xl shadow-primary/10 border border-outline-variant/60 px-2 py-1.5 flex justify-around items-center">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-full min-w-[52px] transition-all duration-200 relative cursor-pointer active:scale-90 ${
                isActive ? 'text-primary' : 'text-outline hover:text-on-surface-variant'
              }`}
            >
              {isActive && (
                <div className="absolute inset-x-2 -top-0.5 h-[3px] bg-primary rounded-full" />
              )}
              <span className={`material-symbols-outlined text-[22px] mb-0.5 ${isActive ? 'font-variation-settings-[\'FILL\'_1]' : ''}`}>{item.icon}</span>
              <span className={`font-label-xs text-[10px] leading-tight ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBottom;
