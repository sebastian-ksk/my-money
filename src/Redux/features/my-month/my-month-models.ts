import firebase from 'firebase/app';

export type TransactionType =
  | 'fixed_expense' // Gasto fijo del mes (con referencia a fixedExpenseId)
  | 'expected_income' // Ingreso esperado (con referencia a expectedIncomeId)
  | 'unexpected_income' // Ingreso inesperado (con descripción)
  | 'regular_expense'; // Gasto eventual (con descripción)

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

  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface MonthlyLiquidityState {
  id?: string;
  userId: string;
  monthPeriod: string; // Formato: "YYYY-MM" basado en fecha de corte
  expectedAmount: number; // Valor esperado (resultado del mes anterior)
  realAmount: number | null; // Valor real (puede ser null si no se ha establecido)
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface MyMonthState {
  transactions: Transaction[];
  monthlyLiquidity: MonthlyLiquidityState | null; // Estado de liquidez del mes actual
  loading: boolean;
  error: string | null;
  currentMonthPeriod: string | null; // Periodo del mes actual basado en fecha de corte
}
