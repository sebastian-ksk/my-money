'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/config/firebase';
import { userService } from '@/services/Firebase/fireabase-user-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveUserToSession = (userData: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    providerId: string;
  }) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      if (result.user) {
        const userData = await userService.findOrCreateUser(result.user);
        saveUserToSession(userData);
      }
      router.push('/config-my-money');
    } catch (err) {
      const error = err as { message?: string };
      if (
        error.message?.includes('already registered') ||
        error.message?.includes('email-already-in-use')
      ) {
        setError('Este email ya está registrado');
      } else {
        setError(error.message || 'Error al crear la cuenta');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex bg-background'>
      {/* Left side - Visual */}
      <div className='hidden lg:flex flex-1 gradient-dark items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl' />
        <div className='absolute bottom-0 right-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl' />

        <div className='relative z-10 max-w-md text-center'>
          <h2 className='text-3xl font-bold text-primary-foreground mb-4'>
            Empieza tu viaje financiero
          </h2>
          <p className='text-primary-foreground/70 text-lg'>
            Únete a miles de usuarios que ya controlan sus finanzas de manera
            inteligente.
          </p>

          {/* Mock card */}
          <div className='mt-12 glass-card rounded-2xl p-6 bg-card/10 backdrop-blur-xl border-primary-foreground/10 text-left'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 rounded-lg bg-income/20'>
                <span className='text-primary-foreground text-sm'>
                  Ingresos totales
                </span>
                <span className='font-bold text-income'>+$5,000,000</span>
              </div>
              <div className='flex items-center justify-between p-3 rounded-lg bg-expense/20'>
                <span className='text-primary-foreground text-sm'>
                  Gastos controlados
                </span>
                <span className='font-bold text-expense'>-$2,500,000</span>
              </div>
              <div className='flex items-center justify-between p-3 rounded-lg bg-savings/20'>
                <span className='text-primary-foreground text-sm'>
                  Meta de ahorro
                </span>
                <span className='font-bold text-savings'>$1,000,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo */}
          <div className='text-center'>
            <div className='inline-flex items-center gap-3 mb-6'>
              <div className='w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow'>
                <Wallet className='w-6 h-6 text-primary-foreground' />
              </div>
              <span className='text-2xl font-bold text-gradient'>MyMoney</span>
            </div>
            <h1 className='text-2xl font-bold'>Crea tu cuenta</h1>
            <p className='text-muted-foreground mt-2'>
              Comienza a gestionar tu dinero
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='tu@email.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='pl-10'
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Contraseña</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='pl-10'
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                Mínimo 6 caracteres
              </p>
            </div>

            <Button
              type='submit'
              className='w-full'
              variant='hero'
              disabled={loading}
            >
              {loading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className='w-5 h-5 ml-2' />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className='text-center'>
            <p className='text-sm text-muted-foreground'>
              ¿Ya tienes cuenta?{' '}
              <Link
                href='/auth/login'
                className='text-primary font-medium hover:underline'
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          <div className='text-center'>
            <Link
              href='/'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors'
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
