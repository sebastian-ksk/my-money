'use client';

import Link from 'next/link';
import { Wallet, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className='fixed top-0 left-0 right-0 z-50 glass-card border-b'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-2 group'>
            <div className='w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform'>
              <Wallet className='w-5 h-5 text-primary-foreground' />
            </div>
            <span className='text-xl font-bold text-gradient'>MyMoney</span>
          </Link>

          {/* Auth Button */}
          <Link href='/auth/login'>
            <Button variant='hero' className='gap-2'>
              <LogIn className='w-4 h-4' />
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
