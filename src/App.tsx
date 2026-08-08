import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAppStore from './store/useAppStore';
import { useAuth } from './hooks/useAuth';
import { startOnlineSyncListener } from './utils/syncQueue';

import AdminLayout from './pages/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailView from './components/ProductDetailView';
import ProductFormPage from './pages/ProductFormPage';
import MenuQRPage from './pages/MenuQRPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import PublicMenu from './pages/PublicMenu';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authUser = useAppStore((s) => s.authUser);
  const hydrated = useAppStore((s) => s.hydrated);
  if (!hydrated) return (
    <div className="h-screen flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return authUser ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const hydrate = useAppStore((s) => s.hydrate);
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    hydrate();
    startOnlineSyncListener();
  }, [hydrate]);

  useEffect(() => {
    if (!authLoading) {
      setAuthUser(user);
    }
  }, [user, authLoading, setAuthUser]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/menu" element={<PublicMenu />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="prodotti" element={<ProductsPage />} />
          <Route path="prodotti/nuovo" element={<ProductFormPage />} />
          <Route path="prodotti/:id" element={<ProductDetailView />} />
          <Route path="qr-menu" element={<MenuQRPage />} />
          <Route path="utenti" element={<UsersPage />} />
          <Route path="profilo" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default App;
