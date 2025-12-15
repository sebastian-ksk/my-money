'use client';

import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    router.push('/home');
  };

  return (
    <header className='bg-white sticky top-0 z-40 transition-all duration-300'>
      <div className='max-w-full mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center gap-4'>
            <button
              onClick={onMenuClick}
              className='lg:hidden p-2 rounded-md hover:bg-neutral-light transition-colors'
              aria-label='Toggle menu'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                style={{ color: '#233ED9' }}
              >
                {isSidebarOpen ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                )}
              </svg>
            </button>

            <h1
              className='text-xl sm:text-2xl font-bold'
              style={{ color: '#233ED9' }}
            >
              MyMoney
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className='px-3 sm:px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-accent-light hover:text-white whitespace-nowrap'
            style={{ color: '#BF815E' }}
          >
            <span className='hidden sm:inline'>Cerrar Sesión</span>
            <span className='sm:hidden'>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
