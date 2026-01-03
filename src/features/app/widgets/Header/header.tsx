'use client';

import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/config/firebase';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  selectSelectedMonth,
  selectSelectedYear,
  setSelectedMonthAndYear,
} from '@/Redux/features/my-month';

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const selectedMonth = useAppSelector(selectSelectedMonth);
  const selectedYear = useAppSelector(selectSelectedYear);

  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Generar años (últimos 5 años y próximos 2 años)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    dispatch(setSelectedMonthAndYear({ month: newMonth, year: selectedYear }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    dispatch(setSelectedMonthAndYear({ month: selectedMonth, year: newYear }));
  };

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

  // Solo mostrar selectores en la ruta /my-month
  const showMonthSelectors = pathname === '/my-month';

  return (
    <header className='bg-white sticky top-0 z-40 transition-all duration-300 border-b border-zinc-200'>
      <div className='max-w-full mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center gap-4 flex-1'>
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

            {/* Selectores de Mes y Año */}
            {showMonthSelectors && (
              <div className='hidden sm:flex items-center gap-3 ml-4'>
                <div className='flex items-center gap-2'>
                  <label
                    htmlFor='month-select'
                    className='text-sm font-medium text-zinc-700'
                  >
                    Mes:
                  </label>
                  <select
                    id='month-select'
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className='px-3 py-1.5 text-sm border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-colors'
                    style={{ color: '#233ED9' }}
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex items-center gap-2'>
                  <label
                    htmlFor='year-select'
                    className='text-sm font-medium text-zinc-700'
                  >
                    Año:
                  </label>
                  <select
                    id='year-select'
                    value={selectedYear}
                    onChange={handleYearChange}
                    className='px-3 py-1.5 text-sm border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-colors'
                    style={{ color: '#233ED9' }}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
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

        {/* Selectores móviles */}
        {showMonthSelectors && (
          <div className='sm:hidden pb-3 flex items-center gap-3'>
            <div className='flex items-center gap-2 flex-1'>
              <label
                htmlFor='month-select-mobile'
                className='text-xs font-medium text-zinc-700 whitespace-nowrap'
              >
                Mes:
              </label>
              <select
                id='month-select-mobile'
                value={selectedMonth}
                onChange={handleMonthChange}
                className='flex-1 px-2 py-1.5 text-sm border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent'
                style={{ color: '#233ED9' }}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex items-center gap-2 flex-1'>
              <label
                htmlFor='year-select-mobile'
                className='text-xs font-medium text-zinc-700 whitespace-nowrap'
              >
                Año:
              </label>
              <select
                id='year-select-mobile'
                value={selectedYear}
                onChange={handleYearChange}
                className='flex-1 px-2 py-1.5 text-sm border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent'
                style={{ color: '#233ED9' }}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
