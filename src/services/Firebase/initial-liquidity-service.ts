import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';
import { myMonthService, getPreviousMonthPeriod } from './my-month-service';

// Modelo de liquidez inicial por mes
export interface InitialLiquidity {
  id?: string;
  userId: string;
  monthPeriod: string; // Formato: "YYYY-MM"
  amount: number; // Valor de la liquidez inicial del mes
  isManual: boolean; // true si fue ingresado manualmente, false si fue calculado
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

// Resultado del cálculo de liquidez inicial
export interface InitialLiquidityResult {
  liquidity: InitialLiquidity | null;
  calculatedAmount: number;
  wasCalculated: boolean; // true si se calculó porque no existía registro
}

export const initialLiquidityService = {
  // ========== Obtener liquidez inicial ==========
  async getInitialLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<InitialLiquidity | null> {
    const liquidityRef = firestore.collection('initialLiquidity');
    const querySnapshot = await liquidityRef
      .where('userId', '==', userId)
      .where('monthPeriod', '==', monthPeriod)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as InitialLiquidity;
  },

  // ========== Calcular liquidez del mes anterior ==========
  // Fórmula: liquidez real del mes anterior + ingresos - gastos - ahorros
  async calculatePreviousMonthLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<number> {
    const previousPeriod = getPreviousMonthPeriod(monthPeriod);

    // Primero verificar si hay una liquidez inicial registrada para el mes anterior
    const previousInitialLiquidity = await this.getInitialLiquidity(
      userId,
      previousPeriod
    );

    // Obtener la liquidez del mes anterior (de MonthlyLiquidityState)
    const previousMonthlyLiquidity = await myMonthService.getMonthlyLiquidity(
      userId,
      previousPeriod
    );

    // Calcular la liquidez inicial del mes anterior
    let initialAmount = 0;
    if (previousInitialLiquidity) {
      initialAmount = previousInitialLiquidity.amount;
    } else if (previousMonthlyLiquidity) {
      // Usar realAmount si existe, sino expectedAmount
      initialAmount =
        previousMonthlyLiquidity.realAmount ??
        previousMonthlyLiquidity.expectedAmount ??
        0;
    }

    // Obtener todas las transacciones del mes anterior
    const transactions = await myMonthService.getTransactions(
      userId,
      previousPeriod
    );

    // Calcular ingresos (expected_income + unexpected_income)
    const totalIncomes = transactions
      .filter(
        (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
      )
      .reduce((sum, t) => sum + t.value, 0);

    // Calcular gastos (fixed_expense + regular_expense)
    const totalExpenses = transactions
      .filter((t) => t.type === 'fixed_expense' || t.type === 'regular_expense')
      .reduce((sum, t) => sum + t.value, 0);

    // Calcular ahorros
    const totalSavings = transactions
      .filter((t) => t.type === 'savings')
      .reduce((sum, t) => sum + t.value, 0);

    // Fórmula: liquidez inicial + ingresos - gastos - ahorros
    return initialAmount + totalIncomes - totalExpenses - totalSavings;
  },

  // ========== Obtener o calcular liquidez inicial ==========
  async getOrCalculateInitialLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<InitialLiquidityResult> {
    // Primero intentar obtener el registro existente
    const existingLiquidity = await this.getInitialLiquidity(
      userId,
      monthPeriod
    );

    if (existingLiquidity) {
      return {
        liquidity: existingLiquidity,
        calculatedAmount: existingLiquidity.amount,
        wasCalculated: false,
      };
    }

    // Si no existe, calcular basado en el mes anterior
    const calculatedAmount = await this.calculatePreviousMonthLiquidity(
      userId,
      monthPeriod
    );

    return {
      liquidity: null,
      calculatedAmount,
      wasCalculated: true,
    };
  },

  // ========== Crear o actualizar liquidez inicial ==========
  async createOrUpdateInitialLiquidity(
    userId: string,
    monthPeriod: string,
    amount: number,
    isManual: boolean = true
  ): Promise<InitialLiquidity> {
    const liquidityRef = firestore.collection('initialLiquidity');
    const now = firebase.firestore.Timestamp.now();

    // Buscar si ya existe
    const querySnapshot = await liquidityRef
      .where('userId', '==', userId)
      .where('monthPeriod', '==', monthPeriod)
      .limit(1)
      .get();

    const data: Partial<InitialLiquidity> = {
      userId,
      monthPeriod,
      amount,
      isManual,
      updatedAt: now,
    };

    if (querySnapshot.empty) {
      // Crear nuevo
      const docRef = await liquidityRef.add({
        ...data,
        createdAt: now,
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as InitialLiquidity;
    } else {
      // Actualizar existente
      const docRef = querySnapshot.docs[0].ref;
      await docRef.update(data);
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as InitialLiquidity;
    }
  },

  // ========== Actualizar liquidez inicial ==========
  async updateInitialLiquidity(
    userId: string,
    monthPeriod: string,
    amount: number
  ): Promise<InitialLiquidity> {
    return this.createOrUpdateInitialLiquidity(userId, monthPeriod, amount, true);
  },

  // ========== Eliminar liquidez inicial ==========
  async deleteInitialLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<void> {
    const liquidityRef = firestore.collection('initialLiquidity');

    const querySnapshot = await liquidityRef
      .where('userId', '==', userId)
      .where('monthPeriod', '==', monthPeriod)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      await querySnapshot.docs[0].ref.delete();
    }
  },

  // ========== Obtener historial de liquidez inicial ==========
  async getInitialLiquidityHistory(
    userId: string,
    limit: number = 12
  ): Promise<InitialLiquidity[]> {
    const liquidityRef = firestore.collection('initialLiquidity');
    const querySnapshot = await liquidityRef
      .where('userId', '==', userId)
      .orderBy('monthPeriod', 'desc')
      .limit(limit)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InitialLiquidity[];
  },

  // ========== Recalcular y guardar liquidez inicial ==========
  // Útil para recalcular cuando hay cambios en el mes anterior
  async recalculateAndSaveInitialLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<InitialLiquidity> {
    const calculatedAmount = await this.calculatePreviousMonthLiquidity(
      userId,
      monthPeriod
    );

    return this.createOrUpdateInitialLiquidity(
      userId,
      monthPeriod,
      calculatedAmount,
      false // No es manual, fue calculado
    );
  },
};
