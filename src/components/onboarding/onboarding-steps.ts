import type { Step } from 'react-joyride';

// Pasos para la página de Configuración
export const configOnboardingSteps: Step[] = [
  {
    target: 'body',
    content: '¡Bienvenido a MyMoney! Te guiaremos para configurar tu economía personal. Empecemos por lo básico.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="config-general"]',
    content: 'Primero, configura tu día de corte mensual. Este es el día en que inicia tu período financiero. Generalmente se elige un día importante como tu día de pago o el día siguiente. También puedes usar del 1 al 1 de cada mes. ¡Tú decides lo que mejor funcione para ti!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="config-currency"]',
    content: 'Selecciona la moneda que usarás para registrar tus finanzas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-savings"]',
    content: 'En la pestaña de Ahorros podrás registrar tus fuentes de ahorro: cuentas de ahorro, fondos de emergencia, inversiones, etc. Así tendrás control de dónde guardas tu dinero y verás cómo crece con el tiempo.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-expenses"]',
    content: 'Aquí configurarás tus gastos fijos mensuales: arriendo, hipoteca, servicios públicos, suscripciones, etc. Puedes especificar la fecha de cada gasto y si aplica a todos los meses o solo a algunos.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-income"]',
    content: 'Registra tus ingresos esperados como tu salario y la fecha en que lo recibes. Esto te ayudará a tener una proyección clara de tu flujo de dinero cada mes.',
    placement: 'bottom',
  },
];

// Pasos para la página Mi Mes
export const myMonthOnboardingSteps: Step[] = [
  {
    target: 'body',
    content: '¡Excelente! Ahora veamos cómo funciona "Mi Mes", el corazón de tu control financiero mensual.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="liquidity-card"]',
    content: 'Al inicio de cada mes, registra aquí cuánto dinero te quedó realmente del mes anterior. Esto te permite comparar el saldo real con el calculado, ayudándote a identificar gastos no registrados o posibles fugas de dinero. ¡Ser juicioso con tus registros marca la diferencia!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="income-card"]',
    content: 'Aquí verás el total de ingresos del mes: tanto los esperados (como tu salario) como los adicionales.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="expense-card"]',
    content: 'El total de tus gastos del mes: fijos y variables. Mantén este número bajo control.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="balance-card"]',
    content: 'Tu balance final: lo que te queda disponible después de ingresos y gastos. Este es el número que deberías comparar con tu saldo real al iniciar el siguiente mes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="transactions-section"]',
    content: 'Aquí verás todas tus transacciones del mes. Los gastos fijos e ingresos esperados aparecerán automáticamente para que los registres cuando ocurran.',
    placement: 'top',
  },
  {
    target: '[data-tour="add-expense-btn"]',
    content: 'Usa este botón para agregar gastos: tanto fijos (configurados previamente) como gastos variables del día a día.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="add-income-btn"]',
    content: 'Registra aquí tus ingresos cuando los recibas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="add-savings-btn"]',
    content: 'Cuando destines dinero a tus ahorros, regístralo aquí para mantener un control de cuánto estás ahorrando.',
    placement: 'bottom',
  },
];

// Estilos personalizados para Joyride
export const joyrideStyles = {
  options: {
    arrowColor: 'hsl(var(--background))',
    backgroundColor: 'hsl(var(--background))',
    primaryColor: 'hsl(var(--primary))',
    textColor: 'hsl(var(--foreground))',
    overlayColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: '16px',
    padding: '20px',
  },
  tooltipContainer: {
    textAlign: 'left' as const,
  },
  tooltipTitle: {
    fontSize: '18px',
    fontWeight: 600,
  },
  tooltipContent: {
    fontSize: '14px',
    lineHeight: '1.6',
  },
  buttonNext: {
    backgroundColor: 'hsl(var(--primary))',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
  },
  buttonBack: {
    color: 'hsl(var(--muted-foreground))',
    marginRight: '8px',
  },
  buttonSkip: {
    color: 'hsl(var(--muted-foreground))',
  },
};

// Textos en español para Joyride
export const joyrideLocale = {
  back: 'Anterior',
  close: 'Cerrar',
  last: '¡Entendido!',
  next: 'Siguiente',
  open: 'Abrir',
  skip: 'Omitir tour',
};
