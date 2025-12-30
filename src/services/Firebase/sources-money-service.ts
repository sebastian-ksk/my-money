import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';
import type { MoneySource } from '@/Redux/features/my-month/my-month-models';

export const sourcesMoneyService = {
  // Obtener todas las fuentes de un periodo
  async getSourcesByPeriod(
    userId: string,
    periodId: string
  ): Promise<MoneySource[]> {
    const sourcesRef = firestore.collection('sources-money');
    const querySnapshot = await sourcesRef
      .where('userId', '==', userId)
      .where('periodId', '==', periodId)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoneySource[];
  },

  // Obtener todas las fuentes de un usuario
  async getAllSources(userId: string): Promise<MoneySource[]> {
    const sourcesRef = firestore.collection('sources-money');
    const querySnapshot = await sourcesRef
      .where('userId', '==', userId)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoneySource[];
  },

  // Crear una nueva fuente
  async createSource(
    source: Omit<MoneySource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MoneySource> {
    const sourcesRef = firestore.collection('sources-money');
    const now = firebase.firestore.Timestamp.now();

    const sourceData: MoneySource = {
      ...source,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await sourcesRef.add(sourceData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as MoneySource;
  },

  // Actualizar una fuente
  async updateSource(
    sourceId: string,
    source: Partial<Omit<MoneySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<MoneySource> {
    const sourceRef = firestore.collection('sources-money').doc(sourceId);
    const now = firebase.firestore.Timestamp.now();

    await sourceRef.update({
      ...source,
      updatedAt: now,
    });

    const doc = await sourceRef.get();
    return { id: doc.id, ...doc.data() } as MoneySource;
  },

  // Eliminar una fuente
  async deleteSource(sourceId: string): Promise<void> {
    await firestore.collection('sources-money').doc(sourceId).delete();
  },

  // Obtener fuentes del mes anterior
  async getPreviousMonthSources(
    userId: string,
    currentPeriodId: string
  ): Promise<MoneySource[]> {
    // Primero obtener el periodo actual para saber cuál es el anterior
    const liquidityRef = firestore.collection('monthlyLiquidity');
    const currentPeriod = await liquidityRef.doc(currentPeriodId).get();
    
    if (!currentPeriod.exists) {
      return [];
    }

    const currentData = currentPeriod.data();
    if (!currentData) {
      return [];
    }

    const currentStart = (currentData.startDate as firebase.firestore.Timestamp)?.toDate();
    
    if (!currentStart) {
      return [];
    }

    // Calcular el periodo anterior (restar un mes)
    const previousStart = new Date(currentStart);
    previousStart.setMonth(previousStart.getMonth() - 1);
    
    // Buscar el periodo anterior por startDate
    const previousStartTimestamp = firebase.firestore.Timestamp.fromDate(previousStart);
    const previousPeriodQuery = await liquidityRef
      .where('userId', '==', userId)
      .where('startDate', '==', previousStartTimestamp)
      .limit(1)
      .get();

    if (previousPeriodQuery.empty) {
      return [];
    }

    const previousPeriodId = previousPeriodQuery.docs[0].id;
    return this.getSourcesByPeriod(userId, previousPeriodId);
  },
};

