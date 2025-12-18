import { ButtonLink } from '@/components/ui';

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-neutral-light dark:bg-white'>
      {/* Header */}
      <header className='w-full py-6 px-4 sm:px-8 bg-white dark:bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl bg-primary-dark'>
              M
            </div>
            <h1 className='text-2xl font-bold text-primary-dark'>MyMoney</h1>
          </div>
          <nav className='flex items-center gap-4'>
            <ButtonLink href='/auth/login' variant='ghost' size='md'>
              Iniciar Sesión
            </ButtonLink>
            <ButtonLink href='/auth/register' variant='primary' size='md'>
              Registrarse
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className='flex-1'>
        <section className='max-w-7xl mx-auto px-4 sm:px-8 py-20'>
          <div className='text-center mb-16'>
            <h2 className='text-5xl sm:text-6xl font-bold mb-6 text-primary-dark'>
              Controla tus Finanzas
            </h2>
            <p className='text-xl sm:text-2xl text-zinc-600 dark:text-zinc-600 max-w-2xl mx-auto mb-10'>
              Gestiona tu dinero de manera inteligente y toma el control de tu
              futuro financiero
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <ButtonLink
                href='/auth/register'
                variant='primary'
                size='lg'
                className='hover:scale-105'
              >
                Comenzar Gratis
              </ButtonLink>
              <ButtonLink href='/auth/login' variant='outline' size='lg'>
                Iniciar Sesión
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Sección de Explicación del Proyecto */}
        <section className='max-w-7xl mx-auto px-4 sm:px-8 py-16 bg-white dark:bg-white'>
          <div className='text-center mb-12'>
            <h3 className='text-3xl sm:text-4xl font-bold mb-4 text-primary-medium'>
              ¿Qué es MyMoney?
            </h3>
            <p className='text-lg text-zinc-600 dark:text-zinc-600 max-w-3xl mx-auto'>
              MyMoney es una plataforma diseñada para ayudarte a gestionar tus
              finanzas personales de manera sencilla y efectiva. Organiza tus
              ingresos, gastos y ahorros en un solo lugar.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12'>
            <div className='p-6 rounded-xl bg-neutral-light dark:bg-neutral-light'>
              <div className='w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary-light'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <h4 className='text-xl font-semibold mb-2 text-primary-dark'>
                Seguimiento de Gastos
              </h4>
              <p className='text-zinc-600 dark:text-zinc-600'>
                Registra y categoriza todos tus gastos para tener una visión
                clara de hacia dónde va tu dinero.
              </p>
            </div>

            <div className='p-6 rounded-xl bg-neutral-light dark:bg-neutral-light'>
              <div className='w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary-light'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h4 className='text-xl font-semibold mb-2 text-primary-dark'>
                Gestión de Ingresos
              </h4>
              <p className='text-zinc-600 dark:text-zinc-600'>
                Lleva un registro detallado de todos tus ingresos y mantén un
                balance preciso de tus finanzas.
              </p>
            </div>

            <div className='p-6 rounded-xl bg-neutral-light dark:bg-neutral-light'>
              <div className='w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary-light'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h4 className='text-xl font-semibold mb-2 text-primary-dark'>
                Planificación Mensual
              </h4>
              <p className='text-zinc-600 dark:text-zinc-600'>
                Planifica tus finanzas mes a mes y establece metas de ahorro
                para alcanzar tus objetivos.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='w-full py-8 px-4 sm:px-8 bg-white dark:bg-white border-t border-zinc-200 dark:border-zinc-200'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white bg-primary-dark'>
                M
              </div>
              <span className='font-semibold text-primary-dark'>MyMoney</span>
            </div>
            <div className='flex flex-wrap items-center justify-center gap-6'>
              <ButtonLink href='/auth/login' variant='ghost' size='sm'>
                Iniciar Sesión
              </ButtonLink>
              <ButtonLink href='/auth/register' variant='ghost' size='sm'>
                Registrarse
              </ButtonLink>
            </div>
            <p className='text-sm text-zinc-500 dark:text-zinc-600'>
              © 2024 MyMoney. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
