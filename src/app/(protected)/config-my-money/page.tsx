'use client';

import { ConfigTabs } from '@/components/config';
import { Settings } from 'lucide-react';

export default function ConfigMyMoneyPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow'>
            <Settings className='w-6 h-6 text-primary-foreground' />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>Configuración</h1>
            <p className='text-muted-foreground'>
              Personaliza tu economía personal
            </p>
          </div>
        </div>
      </div>

      {/* Config Tabs */}
      <ConfigTabs />
    </div>
  );
}
