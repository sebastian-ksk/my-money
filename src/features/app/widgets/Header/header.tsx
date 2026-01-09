'use client';

import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  selectSelectedMonth,
  selectSelectedYear,
  setSelectedMonthAndYear,
} from '@/Redux/features/my-month';
import { Menu, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
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

  const handleMonthChange = (value: string) => {
    const newMonth = parseInt(value, 10);
    dispatch(setSelectedMonthAndYear({ month: newMonth, year: selectedYear }));
  };

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value, 10);
    dispatch(setSelectedMonthAndYear({ month: selectedMonth, year: newYear }));
  };

  // Solo mostrar selectores en la ruta /my-month
  const showMonthSelectors = pathname === '/my-month';

  return (
    <header className='glass-card sticky top-0 z-40 border-b'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Left section: Menu button + Title */}
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              className='lg:hidden'
              onClick={onMenuClick}
              aria-label='Toggle menu'
            >
              {isSidebarOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </Button>

            <h1 className='text-xl font-bold text-gradient'>MyMoney</h1>
          </div>

          {/* Right section: Month/Year selectors (desktop) */}
          {showMonthSelectors && (
            <div className='hidden md:flex items-center gap-3'>
              <Calendar className='w-4 h-4 text-muted-foreground' />
              <Select
                value={selectedMonth.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className='w-[130px]'>
                  <SelectValue placeholder='Mes' />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className='w-[100px]'>
                  <SelectValue placeholder='Año' />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Mobile selectors */}
        {showMonthSelectors && (
          <div className='md:hidden pb-3 flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-muted-foreground shrink-0' />
            <Select
              value={selectedMonth.toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className='flex-1'>
                <SelectValue placeholder='Mes' />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className='w-[90px]'>
                <SelectValue placeholder='Año' />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </header>
  );
}
