import firebase from 'firebase/app';

export interface UserConfig {
  userId: string;
  monthResetDay: number;
  initialBalance: number;
  initialSavings: number;
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
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface ExpectedIncome {
  id?: string;
  userId: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface ConfigMyMoneyState {
  userConfig: UserConfig | null;
  expenseCategories: ExpenseCategory[];
  fixedExpenses: FixedExpense[];
  expectedIncomes: ExpectedIncome[];
  loading: boolean;
  error: string | null;
}
