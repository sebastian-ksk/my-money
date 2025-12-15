'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/features/app/widgets/Header/header';
import Sidebar from '@/features/app/widgets/Sidebar/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsCheckingAuth(false);
      return;
    }

    const checkAuth = () => {
      try {
        const authStatus = sessionStorage.getItem('isAuthenticated');
        const userData = sessionStorage.getItem('user');

        if (!authStatus || !userData) {
          router.replace('/auth/login');
          return;
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/auth/login');
      }
    };

    // Pequeño delay para asegurar que el cliente está completamente hidratado
    const timer = setTimeout(checkAuth, 0);
    return () => clearTimeout(timer);
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isCheckingAuth) {
    return (
      <div
        className='min-h-screen flex items-center justify-center'
        style={{ backgroundColor: '#F2F2F2' }}
      >
        <p style={{ color: '#666' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex' style={{ backgroundColor: '#F2F2F2' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      <div className='flex-1 flex flex-col min-w-0'>
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className='flex-1 transition-all duration-300'>{children}</main>
      </div>
    </div>
  );
}
