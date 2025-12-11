'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de login - en producción usarías autenticación real
    if (email && password) {
      // Guardar en localStorage como simulación
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/mymoney');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#233ED9' }}>
            Iniciar Sesión
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#263DBF' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ 
                  borderColor: '#5F72D9',
                  color: '#171717'
                }}
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #5F72D9'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#263DBF' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ 
                  borderColor: '#5F72D9',
                  color: '#171717'
                }}
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #5F72D9'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 text-white rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#233ED9' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#263DBF'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#233ED9'}
            >
              Entrar
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#666' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="font-medium hover:underline" style={{ color: '#5F72D9' }}>
              Regístrate
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link href="/home" className="text-sm hover:underline" style={{ color: '#BF815E' }}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

