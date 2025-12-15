'use client';

import React, { useState } from 'react';
import Header from '@/features/app/widgets/Header/header';
import Sidebar from '@/features/app/widgets/Sidebar/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
