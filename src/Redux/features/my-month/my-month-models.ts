import firebase from 'firebase/app';

export type TransactionType =
  | 'fixed_expense' // Gasto fijo del mes (con referencia a fixedExpenseId)
  | 'expected_income' // Ingreso esperado (con referencia a expectedIncomeId)
  | 'unexpected_income' // Ingreso inesperado (con descripción)
  | 'regular_expense' // Gasto eventual (con descripción)
  | 'savings'; // Ahorro (con referencia a savingsSourceId)

export interface Transaction {
  id?: string;
  userId: string;
  type: TransactionType;
  value: number; // Valor real de la transacción
  expectedAmount?: number; // Valor esperado (solo para fixed_expense y expected_income)
  concept: string; // Descripción/concepto
  paymentMethod: string;
  date: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  monthPeriod: string; // Formato: "YYYY-MM" basado en fecha de corte

  // Referencias opcionales según el tipo
  fixedExpenseId?: string; // Para type: 'fixed_expense'
  expectedIncomeId?: string; // Para type: 'expected_income'
  savingsSourceId?: string; // Para type: 'savings' - destino del ahorro

  // Campos adicionales para ahorros
  originSource?: string; // Fuente de origen del ahorro (ej: "efectivo", "cuenta bancaria")

  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface LiquiditySource {
  id?: string;
  userId: string;
  name: string;
  liquidSourceId?: string; // Referencia al ID en la colección liquidSources
  expectedAmount: number; // Valor esperado de esta fuente
  realAmount: number | null; // Valor real de esta fuente (puede ser null)
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

// Modelo para la colección liquidSources (sin duplicados por nombre)
export interface LiquidSource {
  id?: string;
  userId: string;
  name: string; // Nombre único por usuario
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface MonthlyLiquidityState {
  id?: string;
  userId: string;
  monthPeriod: string; // Formato: "YYYY-MM" basado en fecha de corte (mantener para compatibilidad)
  startDate: firebase.firestore.Timestamp; // Fecha de inicio del periodo
  endDate: firebase.firestore.Timestamp; // Fecha de fin del periodo
  expectedAmount: number; // Valor esperado total (suma de todas las fuentes)
  realAmount: number | null; // Valor real total (suma de todas las fuentes, puede ser null)
  liquiditySources: LiquiditySource[]; // Fuentes de liquidez (referencias por ID)
  totalExpenses?: number; // Total de gastos del mes (fixed_expense + regular_expense)
  totalIncomes?: number; // Total de ingresos del mes (expected_income + unexpected_income)
  finalBalance?: number; // Balance final: liquidez inicial + ingresos - gastos
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface MoneySource {
  id?: string;
  userId: string;
  name: string;
  expectedAmount: number; // Valor esperado de esta fuente
  realAmount: number | null; // Valor real de esta fuente (puede ser null)
  periodId: string; // ID del periodo al que pertenece
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface MyMonthState {
  transactions: Transaction[];
  monthlyLiquidity: MonthlyLiquidityState | null; // Estado de liquidez del mes actual
  moneySources: MoneySource[]; // Fuentes de dinero del periodo actual
  totalSavings: number; // Total de ahorros del período actual
  totalSavingsBalance: number; // Balance total acumulado en todas las fuentes de ahorro
  loading: boolean;
  error: string | null;
  currentMonthPeriod: string | null; // Periodo del mes actual basado en fecha de corte
  selectedMonth: number; // Mes seleccionado (0-11)
  selectedYear: number; // Año seleccionado
  isInitialized: boolean; // Si ya se inicializó con la configuración del usuario
}
