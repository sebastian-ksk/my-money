'use client';

import React, { useEffect, useState } from 'react';
import { firestore, firebase, auth } from '@/config/firebase-config';
import firebaseApp from 'firebase/app';

interface Transaction {
  id: string;
  value: number;
  concept: string;
  paymentMethod: string;
  type: 'out' | 'in' | 'saving';
  date: {
    toDate: () => Date;
  };
  userId: string;
}

const MyMonth = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    value: '',
    concept: '',
    paymentMethod: 'efectivo',
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const startTimestamp =
        firebaseApp.firestore.Timestamp.fromDate(startOfMonth);
      const endTimestamp = firebaseApp.firestore.Timestamp.fromDate(endOfMonth);

      const transactionsRef = firestore.collection('transactions');
      const querySnapshot = await transactionsRef
        .where('userId', '==', user.uid)
        .where('type', '==', 'out')
        .where('date', '>=', startTimestamp)
        .where('date', '<=', endTimestamp)
        .orderBy('date', 'desc')
        .get();

      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push({
          id: doc.id,
          ...doc.data(),
        } as Transaction);
      });

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const transactionData = {
        value: parseFloat(formData.value),
        concept: formData.concept,
        paymentMethod: formData.paymentMethod,
        type: 'out' as const,
        date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
        userId: user.uid,
      };

      await firestore.collection('transactions').add(transactionData);

      setFormData({
        value: '',
        concept: '',
        paymentMethod: 'efectivo',
      });
      setShowModal(false);
      loadTransactions();
    } catch (error) {
      console.error('Error al guardar transacción:', error);
    }
  };

  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(value);
  };

  const totalExpenses = transactions.reduce((sum, t) => sum + t.value, 0);

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='bg-white rounded-lg shadow-lg p-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-3xl font-bold' style={{ color: '#233ED9' }}>
            Mis Gastos del Mes
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className='px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-medium transition-colors font-medium'
            style={{ backgroundColor: '#5F72D9' }}
          >
            + Crear Gasto
          </button>
        </div>

        {loading ? (
          <div className='text-center py-12'>
            <p style={{ color: '#666' }}>Cargando gastos...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className='text-center py-12'>
            <p style={{ color: '#666' }}>No hay gastos registrados este mes</p>
          </div>
        ) : (
          <>
            <div
              className='mb-6 p-4 rounded-lg'
              style={{ backgroundColor: '#F2F2F2' }}
            >
              <p className='text-sm' style={{ color: '#263DBF' }}>
                Total de gastos del mes:
              </p>
              <p className='text-2xl font-bold' style={{ color: '#BF815E' }}>
                {formatCurrency(totalExpenses)}
              </p>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b' style={{ borderColor: '#E5E5E5' }}>
                    <th
                      className='text-left py-3 px-4 font-semibold'
                      style={{ color: '#263DBF' }}
                    >
                      Fecha
                    </th>
                    <th
                      className='text-left py-3 px-4 font-semibold'
                      style={{ color: '#263DBF' }}
                    >
                      Concepto
                    </th>
                    <th
                      className='text-left py-3 px-4 font-semibold'
                      style={{ color: '#263DBF' }}
                    >
                      Medio de Pago
                    </th>
                    <th
                      className='text-right py-3 px-4 font-semibold'
                      style={{ color: '#263DBF' }}
                    >
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className='border-b hover:bg-neutral-light transition-colors'
                      style={{ borderColor: '#E5E5E5' }}
                    >
                      <td className='py-3 px-4' style={{ color: '#666' }}>
                        {formatDate(transaction.date)}
                      </td>
                      <td className='py-3 px-4' style={{ color: '#333' }}>
                        {transaction.concept}
                      </td>
                      <td className='py-3 px-4' style={{ color: '#666' }}>
                        {transaction.paymentMethod}
                      </td>
                      <td
                        className='py-3 px-4 text-right font-semibold'
                        style={{ color: '#BF815E' }}
                      >
                        {formatCurrency(transaction.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal para crear gasto */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h3
              className='text-2xl font-bold mb-4'
              style={{ color: '#233ED9' }}
            >
              Crear Nuevo Gasto
            </h3>
            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label
                  className='block text-sm font-medium mb-2'
                  style={{ color: '#263DBF' }}
                >
                  Valor *
                </label>
                <input
                  type='number'
                  step='0.01'
                  required
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black'
                  style={{ borderColor: '#E5E5E5', color: '#000' }}
                  placeholder='0.00'
                />
              </div>

              <div className='mb-4'>
                <label
                  className='block text-sm font-medium mb-2'
                  style={{ color: '#263DBF' }}
                >
                  Concepto *
                </label>
                <input
                  type='text'
                  required
                  value={formData.concept}
                  onChange={(e) =>
                    setFormData({ ...formData, concept: e.target.value })
                  }
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black'
                  style={{ borderColor: '#E5E5E5', color: '#000' }}
                  placeholder='Descripción del gasto'
                />
              </div>

              <div className='mb-6'>
                <label
                  className='block text-sm font-medium mb-2'
                  style={{ color: '#263DBF' }}
                >
                  Medio de Pago *
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black'
                  style={{ borderColor: '#E5E5E5', color: '#000' }}
                  aria-label='Medio de pago'
                >
                  <option value='efectivo'>Efectivo</option>
                  <option value='tarjeta_debito'>Tarjeta Débito</option>
                  <option value='tarjeta_credito'>Tarjeta Crédito</option>
                  <option value='transferencia'>Transferencia</option>
                  <option value='nequi'>Nequi</option>
                  <option value='daviplata'>Daviplata</option>
                  <option value='otro'>Otro</option>
                </select>
              </div>

              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      value: '',
                      concept: '',
                      paymentMethod: 'efectivo',
                    });
                  }}
                  className='flex-1 px-4 py-2 border rounded-lg font-medium transition-colors'
                  style={{
                    borderColor: '#E5E5E5',
                    color: '#666',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors'
                  style={{ backgroundColor: '#5F72D9' }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMonth;
