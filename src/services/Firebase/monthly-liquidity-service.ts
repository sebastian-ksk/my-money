import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';
import type {
  MonthlyLiquidityState,
  LiquiditySource,
} from '@/Redux/features/my-month/my-month-models';
import { calculatePeriodDateRange } from './my-month-service';

// Helper para generar el ID único del documento
const generateDocId = (userId: string, monthPeriod: string): string => {
  return `${userId}_${monthPeriod}`;
};

// Helper para asegurar número válido (evitar NaN)
const safeNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return value;
};

export const monthlyLiquidityService = {
  // ========== Obtener liquidez mensual ==========
  async getMonthlyLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<MonthlyLiquidityState | null> {
    const docId = generateDocId(userId, monthPeriod);
    const docRef = firestore.collection('monthlyLiquidity').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as MonthlyLiquidityState;
  },

  // ========== Crear o actualizar liquidez mensual ==========
  async createOrUpdateMonthlyLiquidity(
    userId: string,
    monthPeriod: string,
    data: {
      expectedAmount?: number;
      realAmount?: number | null;
      liquiditySources?: LiquiditySource[];
      totalExpenses?: number;
      totalIncomes?: number;
      finalBalance?: number;
      dayOfMonth?: number;
    }
  ): Promise<MonthlyLiquidityState> {
    const docId = generateDocId(userId, monthPeriod);
    const docRef = firestore.collection('monthlyLiquidity').doc(docId);
    const now = firebase.firestore.Timestamp.now();

    // Calcular fechas del periodo
    const [year, month] = monthPeriod.split('-').map(Number);
    const dayOfMonth = data.dayOfMonth || 1;
    const range = calculatePeriodDateRange(year, month, dayOfMonth);

    // Verificar si ya existe
    const existingDoc = await docRef.get();

    if (existingDoc.exists) {
      // Actualizar existente
      const updateData: Record<string, unknown> = {
        updatedAt: now,
      };

      if (data.expectedAmount !== undefined) {
        updateData.expectedAmount = safeNumber(data.expectedAmount);
      }
      if (data.realAmount !== undefined) {
        updateData.realAmount = data.realAmount === null ? null : safeNumber(data.realAmount);
      }
      if (data.liquiditySources !== undefined) {
        updateData.liquiditySources = data.liquiditySources;
      }
      if (data.totalExpenses !== undefined) {
        updateData.totalExpenses = safeNumber(data.totalExpenses);
      }
      if (data.totalIncomes !== undefined) {
        updateData.totalIncomes = safeNumber(data.totalIncomes);
      }
      if (data.finalBalance !== undefined) {
        updateData.finalBalance = safeNumber(data.finalBalance);
      }

      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      return { id: docId, ...updatedDoc.data() } as MonthlyLiquidityState;
    }

    // Crear nuevo
    const newData: Omit<MonthlyLiquidityState, 'id'> = {
      userId,
      monthPeriod,
      startDate: firebase.firestore.Timestamp.fromDate(range.start),
      endDate: firebase.firestore.Timestamp.fromDate(range.end),
      expectedAmount: safeNumber(data.expectedAmount),
      realAmount: data.realAmount === null ? null : safeNumber(data.realAmount ?? 0),
      liquiditySources: data.liquiditySources || [],
      totalExpenses: safeNumber(data.totalExpenses),
      totalIncomes: safeNumber(data.totalIncomes),
      finalBalance: safeNumber(data.finalBalance),
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(newData);
    return { id: docId, ...newData };
  },

  // ========== Actualizar balances del mes ==========
  async updateBalances(
    userId: string,
    monthPeriod: string,
    initialLiquidity: number,
    transactions: { type: string; value: number }[]
  ): Promise<MonthlyLiquidityState> {
    // Calcular totales
    const totalIncomes = transactions
      .filter((t) => t.type === 'expected_income' || t.type === 'unexpected_income')
      .reduce((sum, t) => sum + safeNumber(t.value), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'fixed_expense' || t.type === 'regular_expense')
      .reduce((sum, t) => sum + safeNumber(t.value), 0);

    const totalSavings = transactions
      .filter((t) => t.type === 'savings')
      .reduce((sum, t) => sum + safeNumber(t.value), 0);

    // Balance final: liquidez inicial + ingresos - gastos - ahorros
    const finalBalance = safeNumber(initialLiquidity) + totalIncomes - totalExpenses - totalSavings;

    return this.createOrUpdateMonthlyLiquidity(userId, monthPeriod, {
      totalExpenses,
      totalIncomes,
      finalBalance,
    });
  },

  // ========== Actualizar expectedAmount ==========
  async updateExpectedAmount(
    userId: string,
    monthPeriod: string,
    expectedAmount: number
  ): Promise<MonthlyLiquidityState> {
    return this.createOrUpdateMonthlyLiquidity(userId, monthPeriod, {
      expectedAmount: safeNumber(expectedAmount),
    });
  },

  // ========== Actualizar realAmount ==========
  async updateRealAmount(
    userId: string,
    monthPeriod: string,
    realAmount: number | null
  ): Promise<MonthlyLiquidityState> {
    return this.createOrUpdateMonthlyLiquidity(userId, monthPeriod, {
      realAmount: realAmount === null ? null : safeNumber(realAmount),
    });
  },

  // ========== Agregar fuente de liquidez ==========
  async addLiquiditySource(
    userId: string,
    monthPeriod: string,
    source: Omit<LiquiditySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<MonthlyLiquidityState> {
    const existing = await this.getMonthlyLiquidity(userId, monthPeriod);
    const sources = existing?.liquiditySources || [];
    
    const now = firebase.firestore.Timestamp.now();
    const newSource: LiquiditySource = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...source,
      createdAt: now,
      updatedAt: now,
    };

    const updatedSources = [...sources, newSource];
    const totalReal = updatedSources.reduce((sum, s) => sum + safeNumber(s.realAmount), 0);

    return this.createOrUpdateMonthlyLiquidity(userId, monthPeriod, {
      liquiditySources: updatedSources,
      realAmount: totalReal > 0 ? totalReal : null,
    });
  },

  // ========== Actualizar fuente de liquidez ==========
  async updateLiquiditySource(
    userId: string,
    monthPeriod: string,
    sourceId: string,
    updates: Partial<Omit<LiquiditySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<MonthlyLiquidityState> {
    const existing = await this.getMonthlyLiquidity(userId, monthPeriod);
    if (!existing) {
      throw new Error('Monthly liquidity not found');
    }

    const sources = existing.liquiditySources || [];
    const sourceIndex = sources.findIndex((s) => s.id === sourceId);
    
    if (sourceIndex === -1) {
      throw new Error('Liquidity source not found');
    }

    const now = firebase.firestore.Timestamp.now();
    sources[sourceIndex] = {
      ...sources[sourceIndex],
      ...updates,
      updatedAt: now,
    };

    const totalReal = sources.reduce((sum, s) => sum + safeNumber(s.realAmount), 0);

    return this.createOrUpdateMonthlyLiquidity(userId, monthPeriod, {
      liquiditySources: sources,
      realAmount: totalReal > 0 ? totalReal : null,
    });
  },

  // ========== Eliminar fuente de liquidez ==========
  async deleteLiquiditySource(
    userId: string,
    monthPeriod: string,
    sourceId: string
  ): Promise<MonthlyLiquidityState> {
    const existing = await this.getMonthlyLiquidity(userId, monthPeriod);
    if (!existing) {
      throw new Error('Monthly liquidity not found');
    }

    const sources = existing.liquiditySources || [];
    const updatedSources = sources.filter((s) => s.id !== sourceId);
    const totalReal = updatedSources.reduce((sum, s) => sum + safeNumber(s.realAmount), 0);

    return this.createOrUpdateMonthlyLiquidity(userId, monthPeriod, {
      liquiditySources: updatedSources,
      realAmount: totalReal > 0 ? totalReal : null,
    });
  },

  // ========== Obtener historial ==========
  async getHistory(userId: string, limit: number = 12): Promise<MonthlyLiquidityState[]> {
    const querySnapshot = await firestore
      .collection('monthlyLiquidity')
      .where('userId', '==', userId)
      .orderBy('monthPeriod', 'desc')
      .limit(limit)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MonthlyLiquidityState[];
  },

  // ========== Eliminar liquidez mensual ==========
  async deleteMonthlyLiquidity(userId: string, monthPeriod: string): Promise<void> {
    const docId = generateDocId(userId, monthPeriod);
    await firestore.collection('monthlyLiquidity').doc(docId).delete();
  },
};
