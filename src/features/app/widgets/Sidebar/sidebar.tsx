'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Settings,
  PieChart,
  MessageCircle,
  Wallet,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import { selectUser } from '@/Redux/features/auth';
import { logoutUser } from '@/Redux/features/auth/auth-thunks';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

const menuItems = [
  { path: '/my-month', label: 'Mi Mes', icon: LayoutDashboard },
  { path: '/dashboard', label: 'Dashboard', icon: PieChart },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/config-my-money', label: 'Configuración', icon: Settings },
];

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed: externalIsCollapsed = true,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [isMobile, setIsMobile] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(true);

  const isCollapsed = onToggleCollapse
    ? externalIsCollapsed
    : internalCollapsed;

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

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar redirección aunque falle
      router.push('/');
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-in-out z-50',
          isOpen || !isMobile
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
          isCollapsed && !isMobile ? 'w-20' : 'w-64'
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <nav className='h-full flex flex-col overflow-hidden'>
          {/* Header con Logo */}
          <div
            className={cn(
              'p-4 border-b border-sidebar-border transition-all duration-300',
              isCollapsed && !isMobile ? 'px-2' : ''
            )}
          >
            <button
              onClick={() => handleNavigation('/my-month')}
              className={cn(
                'flex items-center gap-2 group',
                isCollapsed && !isMobile ? 'justify-center' : ''
              )}
            >
              <div className='w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform shrink-0'>
                <Wallet className='w-5 h-5 text-primary-foreground' />
              </div>
              {(!isCollapsed || isMobile) && (
                <span className='text-xl font-bold text-gradient'>MyMoney</span>
              )}
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div
              className={cn(
                'p-4 border-b border-sidebar-border transition-all duration-300',
                isCollapsed && !isMobile ? 'px-2' : ''
              )}
            >
              <div
                className={cn(
                  'flex items-center gap-3 transition-all duration-300 w-full',
                  isCollapsed && !isMobile ? 'justify-center' : ''
                )}
              >
                {user.photoURL && (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'Usuario'}
                    width={40}
                    height={40}
                    className='rounded-full shrink-0 ring-2 ring-sidebar-border'
                  />
                )}
                {(!isCollapsed || isMobile) && user.displayName && (
                  <div className='min-w-0 flex-1'>
                    <p className='font-semibold text-sm truncate text-sidebar-foreground'>
                      {user.displayName}
                    </p>
                    {user.email && (
                      <p className='text-xs truncate text-sidebar-foreground/60'>
                        {user.email}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className='flex-1 overflow-y-auto p-4'>
            {(!isCollapsed || isMobile) && (
              <p className='text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3'>
                Menú Principal
              </p>
            )}
            <nav className='space-y-1'>
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                      isCollapsed && !isMobile ? 'justify-center px-2' : ''
                    )}
                    title={isCollapsed && !isMobile ? item.label : ''}
                  >
                    <item.icon className='w-5 h-5 shrink-0' />
                    {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className='p-4 border-t border-sidebar-border'>
            <Button
              variant='ghost'
              className={cn(
                'w-full gap-3 text-muted-foreground hover:text-destructive',
                isCollapsed && !isMobile
                  ? 'justify-center px-2'
                  : 'justify-start'
              )}
              onClick={handleLogout}
              title={isCollapsed && !isMobile ? 'Cerrar Sesión' : ''}
            >
              <LogOut className='w-5 h-5 shrink-0' />
              {(!isCollapsed || isMobile) && <span>Cerrar Sesión</span>}
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}
