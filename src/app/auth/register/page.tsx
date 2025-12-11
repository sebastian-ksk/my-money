'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/config/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.createUserWithEmailAndPassword(email, password);
      router.push('/mymoney');
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='flex min-h-screen items-center justify-center px-4'
      style={{ backgroundColor: '#F2F2F2' }}
    >
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <h1
            className='text-3xl font-bold text-center mb-8'
            style={{ color: '#233ED9' }}
          >
            Crear Cuenta
          </h1>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium mb-2'
                style={{ color: '#263DBF' }}
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white'
                style={{
                  borderColor: '#5F72D9',
                  color: '#171717',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #5F72D9';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder='tu@email.com'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium mb-2'
                style={{ color: '#263DBF' }}
              >
                Contraseña
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white'
                style={{
                  borderColor: '#5F72D9',
                  color: '#171717',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #5F72D9';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder='••••••••'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90'
              style={{ backgroundColor: '#233ED9' }}
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm' style={{ color: '#666' }}>
            ¿Ya tienes cuenta?{' '}
            <Link
              href='/auth/login'
              className='font-medium hover:underline'
              style={{ color: '#5F72D9' }}
            >
              Inicia sesión
            </Link>
          </p>

          <div className='mt-4 text-center'>
            <Link
              href='/home'
              className='text-sm hover:underline'
              style={{ color: '#BF815E' }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
