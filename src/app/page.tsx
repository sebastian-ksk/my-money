import Link from 'next/link';
import { Layout } from '@/components/layout';
import { HeroSection, FeaturesSection } from '@/components/home';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

const benefits = [
  'Planifica tus finanzas con gastos fijos e ingresos esperados',
  'Ejecuta y confirma transacciones cada mes',
  'Visualiza tu balance en tiempo real',
  'Historial completo de todos tus períodos',
];

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />

      {/* CTA Section */}
      <section className='py-20'>
        <div className='container mx-auto px-4'>
          <div className='relative overflow-hidden rounded-3xl gradient-dark p-8 md:p-16'>
            {/* Background glow */}
            <div className='absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl' />

            <div className='relative z-10 grid lg:grid-cols-2 gap-12 items-center'>
              <div>
                <h2 className='text-3xl md:text-4xl font-bold text-primary-foreground mb-6'>
                  Comienza a controlar tu dinero hoy mismo
                </h2>
                <ul className='space-y-4 mb-8'>
                  {benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className='flex items-start gap-3 text-primary-foreground/80'
                    >
                      <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <Check className='w-4 h-4 text-primary-foreground' />
                      </div>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className='flex flex-wrap gap-4'>
                  <Link href='/auth/register'>
                    <Button variant='gold' size='xl'>
                      Comenzar Gratis
                      <ArrowRight className='w-5 h-5' />
                    </Button>
                  </Link>
                  <Link href='/auth/login'>
                    <Button
                      variant='outline'
                      size='xl'
                      className='border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10'
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </div>

              <div className='hidden lg:block'>
                <div className='glass-card rounded-2xl p-6 bg-card/10 backdrop-blur-xl border-primary-foreground/10'>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-4 p-4 rounded-xl bg-income/20'>
                      <div className='w-3 h-3 rounded-full bg-income animate-pulse' />
                      <span className='text-primary-foreground'>
                        Salario depositado
                      </span>
                      <span className='ml-auto font-bold text-income'>
                        +$5,000,000
                      </span>
                    </div>
                    <div className='flex items-center gap-4 p-4 rounded-xl bg-expense/20'>
                      <div className='w-3 h-3 rounded-full bg-expense animate-pulse' />
                      <span className='text-primary-foreground'>
                        Pago de arriendo
                      </span>
                      <span className='ml-auto font-bold text-expense'>
                        -$1,500,000
                      </span>
                    </div>
                    <div className='flex items-center gap-4 p-4 rounded-xl bg-savings/20'>
                      <div className='w-3 h-3 rounded-full bg-savings animate-pulse' />
                      <span className='text-primary-foreground'>
                        Ahorro mensual
                      </span>
                      <span className='ml-auto font-bold text-savings'>
                        -$500,000
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-border py-8'>
        <div className='container mx-auto px-4 text-center text-muted-foreground'>
          <p>© 2024 MyMoney. Gestiona tus finanzas con inteligencia.</p>
        </div>
      </footer>
    </Layout>
  );
}
