'use client';

import React, { useState, useEffect } from 'react';

interface MonthTabsProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  children: React.ReactNode;
}

const MonthTabs: React.FC<MonthTabsProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  children,
}) => {
  const [showSemesters, setShowSemesters] = useState(false);

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

  const monthsShort = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  // Calcular el semestre basado en el mes seleccionado
  const selectedSemester = selectedMonth < 6 ? 1 : 2;

  useEffect(() => {
    // Determinar si mostrar semestres basado en el tamaño de pantalla
    const checkScreenSize = () => {
      const width = window.innerWidth;
      // En pantallas menores a 768px, mostrar semestres
      setShowSemesters(width < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleMonthClick = (monthIndex: number) => {
    onMonthChange(monthIndex, selectedYear);
  };

  const handleSemesterClick = (semester: 1 | 2) => {
    // Si cambia de semestre, seleccionar el primer mes del semestre
    const firstMonth = semester === 1 ? 0 : 6;
    onMonthChange(firstMonth, selectedYear);
  };

  const getMonthsToShow = () => {
    if (showSemesters) {
      // Mostrar solo los meses del semestre seleccionado
      return selectedSemester === 1 ? months.slice(0, 6) : months.slice(6, 12);
    }
    return months;
  };

  const getMonthsShortToShow = () => {
    if (showSemesters) {
      return selectedSemester === 1
        ? monthsShort.slice(0, 6)
        : monthsShort.slice(6, 12);
    }
    return monthsShort;
  };

  const getMonthIndex = (monthName: string) => {
    return months.indexOf(monthName);
  };

  const monthsToShow = getMonthsToShow();
  const monthsShortToShow = getMonthsShortToShow();

  return (
    <div>
      {/* Selector de semestres (solo en móvil) */}
      {showSemesters && (
        <div className=' flex gap-2'>
          <button
            onClick={() => handleSemesterClick(1)}
            type='button'
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
              selectedSemester === 1
                ? 'bg-primary-dark text-white'
                : 'bg-neutral-light text-primary-dark hover:bg-primary-light hover:text-white'
            }`}
          >
            Primer Semestre
          </button>
          <button
            onClick={() => handleSemesterClick(2)}
            type='button'
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
              selectedSemester === 2
                ? 'bg-primary-dark text-white'
                : 'bg-neutral-light text-primary-dark hover:bg-primary-light hover:text-white'
            }`}
          >
            Segundo Semestre
          </button>
        </div>
      )}

      {/* Tabs de meses */}
      <ul className='flex flex-wrap text-sm font-medium text-center border-b border-zinc-200 mb-3'>
        {monthsToShow.map((month, index) => {
          const monthIndex = showSemesters ? getMonthIndex(month) : index;
          const isSelected = selectedMonth === monthIndex;
          const monthShort = monthsShortToShow[index];

          return (
            <li key={monthIndex} className='flex-1 min-w-0'>
              <button
                onClick={() => handleMonthClick(monthIndex)}
                type='button'
                aria-current={isSelected ? 'page' : undefined}
                title={month}
                className={`w-full inline-block  sm:p-3 md:p-4 rounded-t-lg transition-colors text-[10px] sm:text-xs md:text-sm overflow-hidden text-ellipsis whitespace-nowrap ${
                  isSelected
                    ? 'text-primary-dark bg-neutral-light'
                    : 'text-zinc-600 hover:text-primary-dark hover:bg-neutral-light'
                }`}
              >
                <span className='hidden sm:inline'>{month}</span>
                <span className='sm:hidden'>{monthShort}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Contenido */}
      <div>{children}</div>
    </div>
  );
};

export default MonthTabs;
