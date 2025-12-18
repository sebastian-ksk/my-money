/**
 * Utilidades para formateo de moneda
 */

export const CURRENCIES = {
  COP: { code: 'COP', name: 'Peso Colombiano', symbol: '$', locale: 'es-CO' },
  USD: {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    locale: 'en-US',
  },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'es-ES' },
  MXN: { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX' },
  ARS: { code: 'ARS', name: 'Peso Argentino', symbol: '$', locale: 'es-AR' },
  CLP: { code: 'CLP', name: 'Peso Chileno', symbol: '$', locale: 'es-CL' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * Formatea un número como moneda según el código de moneda proporcionado
 */
export const formatCurrency = (
  value: number,
  currencyCode: string = 'COP'
): string => {
  const currency = CURRENCIES[currencyCode as CurrencyCode] || CURRENCIES.COP;

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Parsea un string formateado como moneda a número
 */
export const parseCurrencyInput = (value: string): string => {
  // Remover todo excepto números y punto decimal
  return value.replace(/[^\d.]/g, '');
};

/**
 * Formatea un input mientras el usuario escribe
 */
export const formatCurrencyInput = (
  value: string,
  currencyCode: string = 'COP'
): string => {
  const numericValue = parseCurrencyInput(value);
  if (!numericValue) return '';

  const num = parseFloat(numericValue);
  if (isNaN(num)) return '';

  return formatCurrency(num, currencyCode);
};
