'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/Redux/store/hooks';
import {
  selectIsAuthenticated,
  selectUser,
  selectOnboardingCompleted,
} from '@/Redux/features/auth';
import Header from '@/features/app/widgets/Header/header';
import Sidebar from '@/features/app/widgets/Sidebar/sidebar';

// Rutas permitidas sin completar onboarding
const ONBOARDING_EXEMPT_PATHS = ['/config-my-money'];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const onboardingCompleted = useAppSelector(selectOnboardingCompleted);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const authCheckAttempts = useRef(0);
  const maxAuthCheckAttempts = 25; // Máximo 5 segundos (25 * 200ms)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Asegurar que solo se ejecute en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') {
      return;
    }

    // Si el usuario está autenticado, verificar onboarding
    if (isAuthenticated && user?.uid) {
      console.log('Usuario autenticado, verificando onboarding');
      setIsCheckingAuth(false);
      authCheckAttempts.current = 0;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }

      // Si no ha completado el onboarding y no está en una ruta exenta, redirigir
      const isExemptPath = ONBOARDING_EXEMPT_PATHS.some((path) =>
        pathname.startsWith(path)
      );
      if (!onboardingCompleted && !isExemptPath) {
        console.log('Onboarding no completado, redirigiendo a config-my-money');
        router.replace('/config-my-money');
      }
      return;
    }

    // Si no está autenticado y aún estamos checking, continuar verificando
    if (isCheckingAuth) {
      const checkAuth = () => {
        authCheckAttempts.current += 1;

        // Si el usuario está autenticado, verificar onboarding
        if (isAuthenticated && user?.uid) {
          console.log('Usuario autenticado, verificando onboarding');
          setIsCheckingAuth(false);
          authCheckAttempts.current = 0;
          if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
            redirectTimeoutRef.current = null;
          }

          // Si no ha completado el onboarding y no está en una ruta exenta, redirigir
          const isExemptPath = ONBOARDING_EXEMPT_PATHS.some((path) =>
            pathname.startsWith(path)
          );
          if (!onboardingCompleted && !isExemptPath) {
            console.log(
              'Onboarding no completado, redirigiendo a config-my-money'
            );
            router.replace('/config-my-money');
          }
          return;
        }

        // Si hemos intentado muchas veces y aún no hay usuario, redirigir
        if (authCheckAttempts.current >= maxAuthCheckAttempts) {
          console.log('Timeout esperando autenticación, redirigiendo a login');
          setIsCheckingAuth(false);
          // Usar replace para evitar problemas de historial
          redirectTimeoutRef.current = setTimeout(() => {
            router.replace('/auth/login');
          }, 100);
          return;
        }

        // Continuar verificando cada 200ms
        redirectTimeoutRef.current = setTimeout(checkAuth, 200);
      };

      // Iniciar verificación después de un delay para dar tiempo a la rehidratación
      redirectTimeoutRef.current = setTimeout(checkAuth, 800);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [
    router,
    isAuthenticated,
    user,
    isCheckingAuth,
    isMounted,
    onboardingCompleted,
    pathname,
  ]);

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
