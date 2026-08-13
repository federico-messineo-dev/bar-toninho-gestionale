import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import NavigationSidebar from '../components/NavigationSidebar';
import NavigationBottom from '../components/NavigationBottom';
import TopAppBar from '../components/TopAppBar';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useAppStore((s) => s.authUser);

  useEffect(() => {
    if (!authUser) navigate('/login', { replace: true });
  }, [authUser, navigate]);

  return (
    <div className="min-h-screen bg-transparent text-[#F3E9D7] flex flex-col antialiased overflow-x-hidden">
      <NavigationSidebar />

      <div className="flex-1 flex flex-col lg:ml-[280px]">
        <TopAppBar />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <NavigationBottom />
    </div>
  );
};

export default AdminLayout;
