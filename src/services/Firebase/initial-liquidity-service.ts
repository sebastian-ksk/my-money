import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';
import { myMonthService, getPreviousMonthPeriod } from './my-month-service';

// Modelo de liquidez inicial por mes
// Solo puede existir UN documento por usuario por mes (clave: userId_monthPeriod)
export interface InitialLiquidity {
  id?: string; // Formato: userId_monthPeriod (ej: "abc123_2026-01")
  userId: string;
  monthPeriod: string; // Formato: "YYYY-MM"
  realAmount: number | null; // Valor ingresado manualmente por el usuario
  calculatedAmount: number; // Valor calculado automáticamente
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

// Resultado del cálculo de liquidez inicial
export interface InitialLiquidityResult {
  liquidity: InitialLiquidity | null;
  effectiveAmount: number; // realAmount si existe, sino calculatedAmount
  wasCalculated: boolean; // true si se usa el calculatedAmount (no hay realAmount)
}

// Helper para generar el ID único del documento
const generateDocId = (userId: string, monthPeriod: string): string => {
  return `${userId}_${monthPeriod}`;
};

export const initialLiquidityService = {
  // ========== Obtener liquidez inicial ==========
  // Usa el ID compuesto para búsqueda directa (más eficiente)
  async getInitialLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<InitialLiquidity | null> {
    const docId = generateDocId(userId, monthPeriod);
    const docRef = firestore.collection('initialLiquidity').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as InitialLiquidity;
  },

  // ========== Helper para asegurar número válido (evitar NaN) ==========
  safeNumber(value: number | null | undefined): number {
    if (value === null || value === undefined || isNaN(value)) {
      return 0;
    }
    return value;
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
      // Usar realAmount si existe, sino calculatedAmount
      initialAmount = this.safeNumber(
        previousInitialLiquidity.realAmount ?? previousInitialLiquidity.calculatedAmount
      );
    } else if (previousMonthlyLiquidity) {
      // Usar realAmount si existe, sino expectedAmount
      initialAmount = this.safeNumber(
        previousMonthlyLiquidity.realAmount ?? previousMonthlyLiquidity.expectedAmount
      );
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
      .reduce((sum, t) => sum + this.safeNumber(t.value), 0);

    // Calcular gastos (fixed_expense + regular_expense)
    const totalExpenses = transactions
      .filter((t) => t.type === 'fixed_expense' || t.type === 'regular_expense')
      .reduce((sum, t) => sum + this.safeNumber(t.value), 0);

    // Calcular ahorros
    const totalSavings = transactions
      .filter((t) => t.type === 'savings')
      .reduce((sum, t) => sum + this.safeNumber(t.value), 0);

    // Fórmula: liquidez inicial + ingresos - gastos - ahorros
    const result = initialAmount + totalIncomes - totalExpenses - totalSavings;
    
    // Asegurar que el resultado no sea NaN
    return this.safeNumber(result);
  },

  // ========== Obtener o calcular liquidez inicial ==========
  async getOrCalculateInitialLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<InitialLiquidityResult> {
    // Calcular siempre el valor automático
    const calculatedAmount = await this.calculatePreviousMonthLiquidity(
      userId,
      monthPeriod
    );
    
    // Asegurar que no sea NaN
    const safeCalculatedAmount = this.safeNumber(calculatedAmount);

    // Crear o actualizar el documento (maneja duplicados automáticamente)
    const liquidity = await this.createOrUpdateInitialLiquidity(
      userId,
      monthPeriod,
      safeCalculatedAmount
    );

    // Verificar si tiene realAmount
    const hasRealAmount = liquidity.realAmount !== null && !isNaN(liquidity.realAmount);
    const effectiveAmount = hasRealAmount 
      ? this.safeNumber(liquidity.realAmount!) 
      : safeCalculatedAmount;

    return {
      liquidity,
      effectiveAmount,
      wasCalculated: !hasRealAmount,
    };
  },

  // ========== Crear o actualizar liquidez inicial ==========
  // Verifica si existe antes de crear, si existe solo actualiza calculatedAmount
  async createOrUpdateInitialLiquidity(
    userId: string,
    monthPeriod: string,
    calculatedAmount: number
  ): Promise<InitialLiquidity> {
    const docId = generateDocId(userId, monthPeriod);
    const docRef = firestore.collection('initialLiquidity').doc(docId);
    const now = firebase.firestore.Timestamp.now();
    
    // Asegurar que calculatedAmount no sea NaN
    const safeCalculatedAmount = this.safeNumber(calculatedAmount);

    // Verificar si ya existe
    const existingDoc = await docRef.get();
    
    if (existingDoc.exists) {
      // Si existe, solo actualizar calculatedAmount
      await docRef.update({
        calculatedAmount: safeCalculatedAmount,
        updatedAt: now,
      });
      
      const updatedDoc = await docRef.get();
      return { id: docId, ...updatedDoc.data() } as InitialLiquidity;
    }

    // Si no existe, crear nuevo
    const data: Omit<InitialLiquidity, 'id'> = {
      userId,
      monthPeriod,
      realAmount: null, // Inicialmente sin valor manual
      calculatedAmount: safeCalculatedAmount,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(data);
    
    return { id: docId, ...data };
  },

  // ========== Actualizar solo el calculatedAmount ==========
  async updateCalculatedAmount(
    userId: string,
    monthPeriod: string,
    calculatedAmount: number
  ): Promise<void> {
    const docId = generateDocId(userId, monthPeriod);
    const docRef = firestore.collection('initialLiquidity').doc(docId);
    const now = firebase.firestore.Timestamp.now();
    
    // Asegurar que no sea NaN
    const safeCalculatedAmount = this.safeNumber(calculatedAmount);

    // Verificar si existe antes de actualizar
    const doc = await docRef.get();
    if (!doc.exists) {
      // Si no existe, crear
      await this.createOrUpdateInitialLiquidity(userId, monthPeriod, safeCalculatedAmount);
      return;
    }

    await docRef.update({
      calculatedAmount: safeCalculatedAmount,
      updatedAt: now,
    });
  },

  // ========== Actualizar el realAmount (valor manual del usuario) ==========
  async updateRealAmount(
    userId: string,
    monthPeriod: string,
    realAmount: number
  ): Promise<InitialLiquidity> {
    const docId = generateDocId(userId, monthPeriod);
    const docRef = firestore.collection('initialLiquidity').doc(docId);
    const now = firebase.firestore.Timestamp.now();
    
    // Asegurar que realAmount no sea NaN
    const safeRealAmount = this.safeNumber(realAmount);

    // Verificar si existe, si no, crear primero
    const doc = await docRef.get();
    if (!doc.exists) {
      // Calcular el valor automático primero
      const calculatedAmount = await this.calculatePreviousMonthLiquidity(
        userId,
        monthPeriod
      );
      const safeCalculatedAmount = this.safeNumber(calculatedAmount);
      
      const data: Omit<InitialLiquidity, 'id'> = {
        userId,
        monthPeriod,
        realAmount: safeRealAmount,
        calculatedAmount: safeCalculatedAmount,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(data);
      return { id: docId, ...data };
    }

    // Actualizar el realAmount
    await docRef.update({
      realAmount: safeRealAmount,
      updatedAt: now,
    });

    const updatedDoc = await docRef.get();
    return { id: docId, ...updatedDoc.data() } as InitialLiquidity;
  },

  // ========== Eliminar el realAmount (volver a usar calculado) ==========
  async clearRealAmount(
    userId: string,
    monthPeriod: string
  ): Promise<InitialLiquidity> {
    const docId = generateDocId(userId, monthPeriod);
    const docRef = firestore.collection('initialLiquidity').doc(docId);
    const now = firebase.firestore.Timestamp.now();

    // Recalcular el valor automático
    const calculatedAmount = await this.calculatePreviousMonthLiquidity(
      userId,
      monthPeriod
    );
    const safeCalculatedAmount = this.safeNumber(calculatedAmount);

    const doc = await docRef.get();
    if (!doc.exists) {
      // Si no existe, crear con realAmount null
      const data: Omit<InitialLiquidity, 'id'> = {
        userId,
        monthPeriod,
        realAmount: null,
        calculatedAmount: safeCalculatedAmount,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(data);
      return { id: docId, ...data };
    }

    // Limpiar realAmount y actualizar calculatedAmount
    await docRef.update({
      realAmount: null,
      calculatedAmount: safeCalculatedAmount,
      updatedAt: now,
    });

    const updatedDoc = await docRef.get();
    return { id: docId, ...updatedDoc.data() } as InitialLiquidity;
  },

  // ========== Eliminar documento completo ==========
  async deleteInitialLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<void> {
    const docId = generateDocId(userId, monthPeriod);
    const docRef = firestore.collection('initialLiquidity').doc(docId);
    await docRef.delete();
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

  // ========== Recalcular el calculatedAmount ==========
  // Útil para recalcular cuando hay cambios en el mes anterior
  async recalculateInitialLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<InitialLiquidity> {
    const calculatedAmount = await this.calculatePreviousMonthLiquidity(
      userId,
      monthPeriod
    );
    const safeCalculatedAmount = this.safeNumber(calculatedAmount);

    // Usar createOrUpdate para manejar duplicados
    return this.createOrUpdateInitialLiquidity(
      userId,
      monthPeriod,
      safeCalculatedAmount
    );
  },
};
