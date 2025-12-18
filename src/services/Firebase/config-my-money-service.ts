import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';

// Modelos
export interface UserConfig {
  id?: string;
  userId: string;
  monthResetDay: number; // Día del mes (1-31)
  currency: string; // Código de moneda (COP, USD, EUR, etc.)
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
  dayOfMonth: number; // Día del mes (1-31)
  categoryId: string; // Referencia a expense_categories
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface ExpectedIncome {
  id?: string;
  userId: string;
  name: string;
  amount: number;
  dayOfMonth: number; // Día del mes (1-31)
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export const configMyMoneyService = {
  // ========== User Config ==========
  async getUserConfig(userId: string): Promise<UserConfig | null> {
    const configRef = firestore.collection('user_config');
    const querySnapshot = await configRef
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserConfig;
  },

  async createOrUpdateUserConfig(
    userId: string,
    config: Omit<UserConfig, 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserConfig> {
    const configRef = firestore.collection('user_config');
    const querySnapshot = await configRef
      .where('userId', '==', userId)
      .limit(1)
      .get();

    const now = firebase.firestore.Timestamp.now();
    const configData: UserConfig = {
      userId,
      ...config,
      updatedAt: now,
    };

    if (querySnapshot.empty) {
      // Crear nuevo
      const docRef = await configRef.add({
        ...configData,
        createdAt: now,
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as UserConfig;
    } else {
      // Actualizar existente
      const doc = querySnapshot.docs[0];
      await doc.ref.update(configData);
      return { id: doc.id, ...configData };
    }
  },

  // ========== Expense Categories ==========
  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    const categoriesRef = firestore.collection('expense_categories');
    const querySnapshot = await categoriesRef
      .where('userId', '==', userId)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ExpenseCategory[];
  },

  async createExpenseCategory(
    userId: string,
    name: string
  ): Promise<ExpenseCategory> {
    const categoriesRef = firestore.collection('expense_categories');
    const now = firebase.firestore.Timestamp.now();

    // Verificar si ya existe
    const existingQuery = await categoriesRef
      .where('userId', '==', userId)
      .where('name', '==', name)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      const doc = existingQuery.docs[0];
      return { id: doc.id, ...doc.data() } as ExpenseCategory;
    }

    const categoryData: ExpenseCategory = {
      userId,
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await categoriesRef.add(categoryData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as ExpenseCategory;
  },

  async updateExpenseCategory(
    categoryId: string,
    name: string
  ): Promise<ExpenseCategory> {
    const categoryRef = firestore
      .collection('expense_categories')
      .doc(categoryId);
    const now = firebase.firestore.Timestamp.now();

    await categoryRef.update({
      name: name.trim(),
      updatedAt: now,
    });

    const doc = await categoryRef.get();
    return { id: doc.id, ...doc.data() } as ExpenseCategory;
  },

  async deleteExpenseCategory(categoryId: string): Promise<void> {
    await firestore.collection('expense_categories').doc(categoryId).delete();
  },

  // ========== Fixed Expenses ==========
  async getFixedExpenses(userId: string): Promise<FixedExpense[]> {
    const expensesRef = firestore.collection('fixed_expenses');
    const querySnapshot = await expensesRef.where('userId', '==', userId).get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FixedExpense[];
  },

  async createFixedExpense(
    userId: string,
    expense: Omit<FixedExpense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<FixedExpense> {
    const expensesRef = firestore.collection('fixed_expenses');
    const now = firebase.firestore.Timestamp.now();

    const expenseData: FixedExpense = {
      userId,
      ...expense,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await expensesRef.add(expenseData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as FixedExpense;
  },

  async updateFixedExpense(
    expenseId: string,
    expense: Partial<
      Omit<FixedExpense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<FixedExpense> {
    const expenseRef = firestore.collection('fixed_expenses').doc(expenseId);
    const now = firebase.firestore.Timestamp.now();

    await expenseRef.update({
      ...expense,
      updatedAt: now,
    });

    const doc = await expenseRef.get();
    return { id: doc.id, ...doc.data() } as FixedExpense;
  },

  async deleteFixedExpense(expenseId: string): Promise<void> {
    await firestore.collection('fixed_expenses').doc(expenseId).delete();
  },

  // ========== Expected Incomes ==========
  async getExpectedIncomes(userId: string): Promise<ExpectedIncome[]> {
    const incomesRef = firestore.collection('expected_incomes');
    const querySnapshot = await incomesRef.where('userId', '==', userId).get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ExpectedIncome[];
  },

  async createExpectedIncome(
    userId: string,
    income: Omit<ExpectedIncome, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<ExpectedIncome> {
    const incomesRef = firestore.collection('expected_incomes');
    const now = firebase.firestore.Timestamp.now();

    const incomeData: ExpectedIncome = {
      userId,
      ...income,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await incomesRef.add(incomeData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as ExpectedIncome;
  },

  async updateExpectedIncome(
    incomeId: string,
    income: Partial<
      Omit<ExpectedIncome, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<ExpectedIncome> {
    const incomeRef = firestore.collection('expected_incomes').doc(incomeId);
    const now = firebase.firestore.Timestamp.now();

    await incomeRef.update({
      ...income,
      updatedAt: now,
    });

    const doc = await incomeRef.get();
    return { id: doc.id, ...doc.data() } as ExpectedIncome;
  },

  async deleteExpectedIncome(incomeId: string): Promise<void> {
    await firestore.collection('expected_incomes').doc(incomeId).delete();
  },

  // ========== Balance Sources (Líquido) ==========
  async getBalanceSources(userId: string): Promise<BalanceSource[]> {
    const sourcesRef = firestore.collection('balance_sources');
    const querySnapshot = await sourcesRef.where('userId', '==', userId).get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BalanceSource[];
  },

  async createBalanceSource(
    userId: string,
    source: Omit<BalanceSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<BalanceSource> {
    const sourcesRef = firestore.collection('balance_sources');
    const now = firebase.firestore.Timestamp.now();

    const sourceData: BalanceSource = {
      userId,
      ...source,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await sourcesRef.add(sourceData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as BalanceSource;
  },

  async updateBalanceSource(
    sourceId: string,
    source: Partial<
      Omit<BalanceSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<BalanceSource> {
    const sourceRef = firestore.collection('balance_sources').doc(sourceId);
    const now = firebase.firestore.Timestamp.now();

    await sourceRef.update({
      ...source,
      updatedAt: now,
    });

    const doc = await sourceRef.get();
    return { id: doc.id, ...doc.data() } as BalanceSource;
  },

  async deleteBalanceSource(sourceId: string): Promise<void> {
    await firestore.collection('balance_sources').doc(sourceId).delete();
  },

  // ========== Savings Sources (Ahorro) ==========
  async getSavingsSources(userId: string): Promise<SavingsSource[]> {
    const sourcesRef = firestore.collection('savings_sources');
    const querySnapshot = await sourcesRef.where('userId', '==', userId).get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SavingsSource[];
  },

  async createSavingsSource(
    userId: string,
    source: Omit<SavingsSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<SavingsSource> {
    const sourcesRef = firestore.collection('savings_sources');
    const now = firebase.firestore.Timestamp.now();

    const sourceData: SavingsSource = {
      userId,
      ...source,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await sourcesRef.add(sourceData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as SavingsSource;
  },

  async updateSavingsSource(
    sourceId: string,
    source: Partial<
      Omit<SavingsSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<SavingsSource> {
    const sourceRef = firestore.collection('savings_sources').doc(sourceId);
    const now = firebase.firestore.Timestamp.now();

    await sourceRef.update({
      ...source,
      updatedAt: now,
    });

    const doc = await sourceRef.get();
    return { id: doc.id, ...doc.data() } as SavingsSource;
  },

  async deleteSavingsSource(sourceId: string): Promise<void> {
    await firestore.collection('savings_sources').doc(sourceId).delete();
  },
};
