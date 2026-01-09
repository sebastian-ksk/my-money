'use client';

import {
  Wallet,
  PieChart,
  Settings,
  Calendar,
  TrendingUp,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Control de Liquidez',
    description:
      'Visualiza tu dinero disponible en tiempo real después de todas tus obligaciones.',
  },
  {
    icon: Calendar,
    title: 'Periodos Personalizados',
    description: 'Define tu día de corte mensual según tu fecha de pago.',
  },
  {
    icon: PieChart,
    title: 'Análisis Detallado',
    description:
      'Gráficos y estadísticas de tus finanzas para tomar mejores decisiones.',
  },
  {
    icon: Settings,
    title: 'Configuración Flexible',
    description:
      'Personaliza gastos fijos, ingresos esperados y fuentes de ahorro.',
  },
  {
    icon: TrendingUp,
    title: 'Seguimiento de Ahorros',
    description:
      'Monitorea el crecimiento de tus diferentes cuentas de ahorro.',
  },
  {
    icon: Shield,
    title: 'Historial Completo',
    description:
      'Consulta períodos anteriores para entender tus patrones financieros.',
  },
];

export function FeaturesSection() {
  return (
    <section className='py-20 bg-muted/50'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Todo lo que necesitas para{' '}
            <span className='text-gradient'>gestionar tu dinero</span>
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Herramientas diseñadas para que tengas control total sobre tus
            finanzas personales.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className='group glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className='w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors'>
                  <Icon className='w-7 h-7 text-primary' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

