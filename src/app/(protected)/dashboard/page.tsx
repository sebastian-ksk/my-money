'use client';

import { StatsCards, ExpenseChart, MonthlyTrend } from '@/components/dashboard';
import { PieChart, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DashboardPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shadow-gold'>
            <PieChart className='w-6 h-6 text-secondary-foreground' />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <p className='text-muted-foreground'>Análisis de tus finanzas</p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-muted-foreground' />
            <Select defaultValue='6m'>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Período' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1m'>Último mes</SelectItem>
                <SelectItem value='3m'>3 meses</SelectItem>
                <SelectItem value='6m'>6 meses</SelectItem>
                <SelectItem value='1y'>1 año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant='outline'>
            <Download className='w-4 h-4 mr-2' />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='mb-8'>
        <StatsCards />
      </div>

      {/* Charts */}
      <div className='grid lg:grid-cols-2 gap-6 mb-8'>
        <MonthlyTrend />
        <ExpenseChart />
      </div>

      {/* Recent Activity */}
      <div className='glass-card rounded-2xl p-6'>
        <h3 className='text-lg font-semibold mb-6'>Resumen del Período</h3>
        <div className='grid sm:grid-cols-3 gap-6'>
          <div className='text-center p-6 rounded-xl bg-muted/50'>
            <p className='text-4xl font-bold text-gradient mb-2'>23</p>
            <p className='text-muted-foreground'>Transacciones</p>
          </div>
          <div className='text-center p-6 rounded-xl bg-muted/50'>
            <p className='text-4xl font-bold text-gradient-gold mb-2'>77%</p>
            <p className='text-muted-foreground'>Tasa de Ahorro</p>
          </div>
          <div className='text-center p-6 rounded-xl bg-muted/50'>
            <p className='text-4xl font-bold text-gradient mb-2'>+12%</p>
            <p className='text-muted-foreground'>vs. Mes Anterior</p>
          </div>
        </div>
      </div>
    </div>
  );
}
