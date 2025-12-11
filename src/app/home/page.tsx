import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-5xl font-bold mb-6" style={{ color: '#233ED9' }}>
          MyMoney
        </h1>
        <p className="text-xl mb-12" style={{ color: '#263DBF' }}>
          Gestiona tus finanzas de manera sencilla
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-4 text-white rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#233ED9' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#263DBF'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#233ED9'}
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-4 border-2 rounded-lg font-medium transition-colors text-white"
            style={{ 
              borderColor: '#5F72D9',
              backgroundColor: '#5F72D9'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F2B56B';
              e.currentTarget.style.borderColor = '#F2B56B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#5F72D9';
              e.currentTarget.style.borderColor = '#5F72D9';
            }}
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

