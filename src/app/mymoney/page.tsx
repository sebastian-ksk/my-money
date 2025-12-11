'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth } from '@/config/firebase';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  providerId: string;
}

export default function MyMoneyPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Verificar autenticación desde sessionStorage
    const authStatus = sessionStorage.getItem('isAuthenticated');
    const userData = sessionStorage.getItem('user');

    if (!authStatus || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setIsAuthenticated(true);
  }, [router]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: '#F2F2F2' }}>
      <header className='bg-white border-b' style={{ borderColor: '#5F72D9' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              {user?.photoURL && (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  width={40}
                  height={40}
                  className='rounded-full'
                />
              )}
              <div>
                <h1 className='text-2xl font-bold' style={{ color: '#233ED9' }}>
                  MyMoney
                </h1>
                {user?.displayName && (
                  <p className='text-sm' style={{ color: '#666' }}>
                    {user.displayName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className='px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-[#F2B56B] hover:text-white'
              style={{ color: '#BF815E' }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <h2 className='text-3xl font-bold mb-6' style={{ color: '#233ED9' }}>
            Panel Principal
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div
              className='rounded-lg p-6'
              style={{ backgroundColor: '#F2F2F2' }}
            >
              <h3
                className='text-lg font-semibold mb-2'
                style={{ color: '#263DBF' }}
              >
                Balance Total
              </h3>
              <p className='text-3xl font-bold' style={{ color: '#233ED9' }}>
                $0.00
              </p>
            </div>

            <div
              className='rounded-lg p-6'
              style={{ backgroundColor: '#F2F2F2' }}
            >
              <h3
                className='text-lg font-semibold mb-2'
                style={{ color: '#263DBF' }}
              >
                Ingresos
              </h3>
              <p className='text-3xl font-bold' style={{ color: '#5F72D9' }}>
                $0.00
              </p>
            </div>

            <div
              className='rounded-lg p-6'
              style={{ backgroundColor: '#F2F2F2' }}
            >
              <h3
                className='text-lg font-semibold mb-2'
                style={{ color: '#263DBF' }}
              >
                Gastos
              </h3>
              <p className='text-3xl font-bold' style={{ color: '#BF815E' }}>
                $0.00
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-xl font-semibold' style={{ color: '#233ED9' }}>
              Transacciones Recientes
            </h3>
            <div className='text-center py-12' style={{ color: '#666' }}>
              <p>No hay transacciones aún</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
