'use client';

import React from 'react';

interface MonthTabsProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const MonthTabs: React.FC<MonthTabsProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
}) => {
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

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const handleMonthClick = (monthIndex: number) => {
    onMonthChange(monthIndex, selectedYear);
  };

  const handleYearChange = (newYear: number) => {
    onMonthChange(selectedMonth, newYear);
  };

  return (
    <div className='mb-6'>
      {/* Selector de año */}
      <div className='flex items-center gap-4 mb-4'>
        <label className='text-sm font-medium text-primary-medium'>Año:</label>
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className='px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
          style={{ borderColor: '#E5E5E5' }}
        >
          {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>
      </div>

      {/* Tabs de meses */}
      <div className='flex flex-wrap gap-2 overflow-x-auto pb-2'>
        {months.map((month, index) => {
          const isSelected = selectedMonth === index;
          const isCurrentMonth =
            index === currentMonth && selectedYear === currentYear;

          return (
            <button
              key={index}
              onClick={() => handleMonthClick(index)}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-primary-dark text-white'
                  : 'bg-neutral-light text-primary-dark hover:bg-primary-light hover:text-white'
              } ${
                isCurrentMonth && !isSelected ? 'ring-2 ring-primary-dark' : ''
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthTabs;
