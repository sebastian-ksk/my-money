'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  providerId: string;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactElement;
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/mymoney',
    icon: (
      <svg
        className='w-5 h-5'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        />
      </svg>
    ),
  },
  {
    label: 'Transacciones',
    path: '/mymoney/transactions',
    icon: (
      <svg
        className='w-5 h-5'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
        />
      </svg>
    ),
  },
  {
    label: 'Categorías',
    path: '/mymoney/categories',
    icon: (
      <svg
        className='w-5 h-5'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
        />
      </svg>
    ),
  },
  {
    label: 'Reportes',
    path: '/mymoney/reports',
    icon: (
      <svg
        className='w-5 h-5'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        />
      </svg>
    ),
  },
];

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed: externalIsCollapsed = true,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  const isCollapsed = onToggleCollapse
    ? externalIsCollapsed
    : internalCollapsed;

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024 && onToggleCollapse) {
        onToggleCollapse(false);
      } else if (window.innerWidth < 1024) {
        setInternalCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [onToggleCollapse]);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && isCollapsed) {
      if (onToggleCollapse) {
        onToggleCollapse(false);
      } else {
        setInternalCollapsed(false);
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isCollapsed) {
      if (onToggleCollapse) {
        onToggleCollapse(true);
      } else {
        setInternalCollapsed(true);
      }
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white transition-all duration-300 ease-in-out z-50 ${
          isOpen || !isMobile
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed && !isMobile ? 'w-20' : 'w-64'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <nav className='h-full flex flex-col overflow-hidden'>
          {/* User Info */}
          <div
            className={`h-16 flex items-center transition-all duration-300 ${
              isCollapsed && !isMobile ? 'px-2 justify-center' : 'px-4'
            }`}
          >
            <div
              className={`flex items-center gap-3 transition-all duration-300 w-full ${
                isCollapsed && !isMobile ? 'justify-center' : ''
              }`}
            >
              {user?.photoURL && (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  width={48}
                  height={48}
                  className='rounded-full shrink-0'
                />
              )}
              {(!isCollapsed || isMobile) && user?.displayName && (
                <div className='min-w-0 flex-1'>
                  <p
                    className='font-semibold text-sm truncate'
                    style={{ color: '#233ED9' }}
                  >
                    {user.displayName}
                  </p>
                  {user?.email && (
                    <p className='text-xs truncate' style={{ color: '#666' }}>
                      {user.email}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className='flex-1 overflow-y-auto p-4'>
            <ul className='space-y-2'>
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-light text-white'
                          : 'text-gray-700 hover:bg-neutral-light'
                      } ${
                        isCollapsed && !isMobile ? 'justify-center px-2' : ''
                      }`}
                      style={
                        isActive
                          ? {}
                          : {
                              color: '#263DBF',
                            }
                      }
                      title={isCollapsed && !isMobile ? item.label : ''}
                    >
                      <span
                        className={`shrink-0 ${isActive ? 'text-white' : ''}`}
                        style={!isActive ? { color: '#5F72D9' } : {}}
                      >
                        {item.icon}
                      </span>
                      {(!isCollapsed || isMobile) && (
                        <span className='font-medium truncate'>
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
