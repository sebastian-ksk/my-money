'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/config/firebase';
import firebase from 'firebase/app';
import { userService } from '@/services/Firebase/fireabase-user-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
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
      const result = await auth.signInWithEmailAndPassword(email, password);
      if (result.user) {
        const userData = await userService.findOrCreateUser(result.user);
        saveUserToSession(userData);
      }
      router.push('/my-month');
    } catch (err) {
      const error = err as { message?: string };
      if (
        error.message?.includes('Invalid login credentials') ||
        error.message?.includes('wrong-password')
      ) {
        setError('Credenciales inválidas');
      } else {
        setError(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      if (result.user) {
        const userData = await userService.findOrCreateUser(result.user);
        saveUserToSession(userData);
      }
      router.push('/my-month');
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex bg-background'>
      {/* Left side - Form */}
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo */}
          <div className='text-center'>
            <div className='inline-flex items-center gap-3 mb-6'>
              <div className='w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow'>
                <Wallet className='w-6 h-6 text-primary-foreground' />
              </div>
              <span className='text-2xl font-bold text-gradient'>yMoney</span>
            </div>
            <h1 className='text-2xl font-bold'>Inicia sesión</h1>
            <p className='text-muted-foreground mt-2'>
              Accede a tu panel de finanzas
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
                />
              </div>
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
                  Iniciar Sesión
                  <ArrowRight className='w-5 h-5 ml-2' />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-background text-muted-foreground'>
                O
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type='button'
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant='outline'
            className='w-full'
          >
            <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Continuar con Google
          </Button>

          {/* Toggle */}
          <div className='text-center'>
            <p className='text-sm text-muted-foreground'>
              ¿No tienes cuenta?{' '}
              <Link
                href='/auth/register'
                className='text-primary font-medium hover:underline'
              >
                Regístrate
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

      {/* Right side - Visual */}
      <div className='hidden lg:flex flex-1 gradient-dark items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl' />

        <div className='relative z-10 max-w-md text-center'>
          <h2 className='text-3xl font-bold text-primary-foreground mb-4'>
            Tu dinero, bajo control
          </h2>
          <p className='text-primary-foreground/70 text-lg'>
            Planifica, ejecuta y visualiza tus finanzas personales de forma
            simple y efectiva.
          </p>

          {/* Mock card */}
          <div className='mt-12 glass-card rounded-2xl p-6 bg-card/10 backdrop-blur-xl border-primary-foreground/10 text-left'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 rounded-lg bg-income/20'>
                <span className='text-primary-foreground text-sm'>
                  Balance disponible
                </span>
                <span className='font-bold text-income'>$4,500,000</span>
              </div>
              <div className='flex items-center justify-between p-3 rounded-lg bg-savings/20'>
                <span className='text-primary-foreground text-sm'>
                  Ahorros del mes
                </span>
                <span className='font-bold text-savings'>$800,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
