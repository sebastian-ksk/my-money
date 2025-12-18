import firebase from 'firebase/app';

export interface UserConfig {
  userId: string;
  monthResetDay: number;
  currency: string; // Código de moneda (COP, USD, EUR, etc.)
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface ExpenseCategory {
  id?: string;
  userId: string;
  name: string;
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface FixedExpense {
  id?: string;
  userId: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  categoryId: string;
  months?: number[]; // Array de meses (1-12). Si está vacío o undefined, aplica a todos los meses
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface ExpectedIncome {
  id?: string;
  userId: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  months?: number[]; // Array de meses (1-12). Si está vacío o undefined, aplica a todos los meses
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface BalanceSource {
  id?: string;
  userId: string;
  name: string;
  amount: number;
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface SavingsSource {
  id?: string;
  userId: string;
  name: string;
  amount: number;
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface ConfigMyMoneyState {
  userConfig: UserConfig | null;
  expenseCategories: ExpenseCategory[];
  fixedExpenses: FixedExpense[];
  expectedIncomes: ExpectedIncome[];
  balanceSources: BalanceSource[];
  savingsSources: SavingsSource[];
  loading: boolean;
  error: string | null;
}
