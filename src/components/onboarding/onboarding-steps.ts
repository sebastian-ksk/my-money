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
    content: '¡Bienvenido a "Mi Mes"! Esta es la pantalla principal donde gestionarás tu dinero día a día. Aquí podrás registrar todos tus movimientos y ver tu situación financiera en tiempo real.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="liquidity-card"]',
    content: 'La Liquidez Inicial representa el dinero disponible que tienes al comenzar el mes. Te recomendamos actualizarla con el valor real de tu dinero líquido (efectivo, cuentas bancarias, etc.). Esto permite comparar mes a mes y detectar si hay diferencias entre lo calculado y lo real, ayudándote a identificar gastos no registrados o errores.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="income-card"]',
    content: 'Aquí verás el total de tus ingresos del mes, incluyendo tanto los ingresos esperados (como tu salario) como los ingresos adicionales o inesperados que recibas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="expense-card"]',
    content: 'El total de tus gastos del mes: incluye tanto los gastos fijos (arriendo, servicios, etc.) como los gastos variables del día a día. Mantener este número controlado es clave para tu salud financiera.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="balance-card"]',
    content: 'Tu Balance Final muestra el dinero disponible después de todos tus ingresos y gastos. Este valor debería coincidir aproximadamente con tu dinero real al final del mes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="add-expense-btn"]',
    content: 'Desde aquí puedes agregar tus gastos. Puedes registrar un gasto fijo (como el arriendo o servicios que ya configuraste) o un gasto ocasional del día a día (compras, transporte, comida, etc.).',
    placement: 'bottom',
  },
  {
    target: '[data-tour="add-income-btn"]',
    content: 'Registra tus ingresos aquí. Puedes agregar un ingreso esperado (como tu salario configurado) o un ingreso adicional inesperado.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="add-savings-btn"]',
    content: 'Cuando destines dinero al ahorro, regístralo aquí. Podrás seleccionar a qué fuente de ahorro va (cuenta de ahorros, fondo de emergencia, etc.) y cuánto estás apartando.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="transactions-section"]',
    content: 'En esta tabla verás todas tus transacciones del mes. Los gastos fijos e ingresos esperados pendientes aparecerán automáticamente para que los registres cuando ocurran. Puedes filtrar por tipo de transacción y editar o eliminar registros.',
    placement: 'top',
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
