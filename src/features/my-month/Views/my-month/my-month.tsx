'use client';

import React, { useEffect, useState } from 'react';
import firebaseApp from 'firebase/app';
import { Button } from '@/components/ui';
import LiquidityModal from '@/features/my-month/widgets/liquidity-modal/liquidity-modal';
import ExpenseModal from '@/features/my-month/widgets/expense-modal/expense-modal';
import IncomeModal from '@/features/my-month/widgets/income-modal/income-modal';
import SavingsModal from '@/features/my-month/widgets/savings-modal/savings-modal';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import { selectUser } from '@/Redux/features/auth';
import {
  selectUserConfig,
  selectFixedExpenses,
  selectExpectedIncomes,
  selectSavingsSources,
  loadUserConfig,
  loadFixedExpenses,
  loadExpectedIncomes,
  loadSavingsSources,
} from '@/Redux/features/config-my-money';
import {
  selectTransactions,
  selectMyMonthLoading,
  selectMonthlyLiquidity,
  selectSelectedMonth,
  selectSelectedYear,
  selectIsMonthInitialized,
  initializeSelectedMonth,
} from '@/Redux/features/my-month';
import {
  loadTransactions,
  deleteTransaction,
  loadMonthlyLiquidity,
  updateMonthBalances,
} from '@/Redux/features/my-month/my-month-thunks';
import {
  calculateMonthPeriod,
  getCurrentDisplayMonth,
} from '@/services/Firebase/my-month-service';
import { formatCurrency } from '@/utils/currency';
import type { Transaction } from '@/Redux/features/my-month/my-month-models';
import { useConfirm } from '@/components/ui';

const MyMonth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userConfig = useAppSelector(selectUserConfig);
  const fixedExpenses = useAppSelector(selectFixedExpenses);
  const expectedIncomes = useAppSelector(selectExpectedIncomes);
  const savingsSources = useAppSelector(selectSavingsSources);
  const transactions = useAppSelector(selectTransactions);
  const loading = useAppSelector(selectMyMonthLoading);
  const monthlyLiquidity = useAppSelector(selectMonthlyLiquidity);
  const selectedMonth = useAppSelector(selectSelectedMonth);
  const selectedYear = useAppSelector(selectSelectedYear);
  const isInitialized = useAppSelector(selectIsMonthInitialized);
  const confirm = useConfirm();

  const [showLiquidityModal, setShowLiquidityModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Calcular el periodo del mes basado en la fecha de corte
  const monthResetDay = userConfig?.monthResetDay || 1;
  const currentPeriod = calculateMonthPeriod(
    new Date(selectedYear, selectedMonth, 15),
    monthResetDay
  );

  // Calcular valor neto: suma de valores reales de todas las fuentes
  const liquiditySources = monthlyLiquidity?.liquiditySources || [];
  const totalRealFromSources = liquiditySources.reduce(
    (sum, s) => sum + (s.realAmount ?? 0),
    0
  );
  // El valor neto es siempre la suma de las fuentes
  const displayLiquidity =
    totalRealFromSources > 0
      ? totalRealFromSources
      : monthlyLiquidity?.expectedAmount ?? 0;

  // Cargar datos de configuración si no están disponibles
  useEffect(() => {
    if (user?.uid) {
      if (!userConfig) {
        dispatch(loadUserConfig(user.uid));
      }
      // Cargar datos de configuración
      dispatch(loadFixedExpenses(user.uid));
      dispatch(loadExpectedIncomes(user.uid));
      dispatch(loadSavingsSources(user.uid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, dispatch]);

  // Inicializar mes y año cuando se carga la configuración del usuario
  // Solo actualizar si aún no se ha inicializado (primera carga)
  useEffect(() => {
    if (userConfig?.monthResetDay !== undefined && !isInitialized) {
      const currentDisplay = getCurrentDisplayMonth(userConfig.monthResetDay);
      dispatch(
        initializeSelectedMonth({
          month: currentDisplay.month,
          year: currentDisplay.year,
        })
      );
    }
  }, [userConfig?.monthResetDay, isInitialized, dispatch]);

  // Cargar datos del mes
  useEffect(() => {
    if (user?.uid && userConfig) {
      console.log('Cargando transacciones para periodo:', currentPeriod);
      dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      )
        .then(() => {
          // Actualizar balances después de cargar transacciones
          return dispatch(
            updateMonthBalances({
              userId: user.uid,
              monthPeriod: currentPeriod,
              dayOfMonth: userConfig.monthResetDay,
            })
          );
        })
        .catch((error: unknown) => {
          console.error('Error al cargar transacciones:', error);
        });

      dispatch(
        loadMonthlyLiquidity({
          userId: user.uid,
          monthPeriod: currentPeriod,
          dayOfMonth: userConfig.monthResetDay,
        })
      ).catch((error: unknown) => {
        console.error('Error al cargar estado de liquidez:', error);
      });
    }
  }, [user?.uid, currentPeriod, userConfig, dispatch]);

  const handleOpenIncomeModal = (transaction?: Transaction | null) => {
    // Asegurar que los ingresos esperados estén cargados
    if (user?.uid && expectedIncomes.length === 0) {
      dispatch(loadExpectedIncomes(user.uid));
    }
    setEditingTransaction(transaction || null);
    setShowIncomeModal(true);
  };

  const handleOpenSavingsModal = (transaction?: Transaction | null) => {
    if (user?.uid && savingsSources.length === 0) {
      dispatch(loadSavingsSources(user.uid));
    }
    setEditingTransaction(transaction || null);
    setShowSavingsModal(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user?.uid) return;
    const confirmed = await confirm.showConfirm({
      title: 'Eliminar Transacción',
      message: '¿Está seguro de eliminar esta transacción?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await dispatch(deleteTransaction(transactionId)).unwrap();
      await dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).unwrap();
      // Actualizar balances después de eliminar
      if (userConfig) {
        await dispatch(
          updateMonthBalances({
            userId: user.uid,
            monthPeriod: currentPeriod,
            dayOfMonth: userConfig.monthResetDay,
          })
        ).unwrap();
      }
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (!transaction?.id) return;
    if (
      transaction.type === 'fixed_expense' ||
      transaction.type === 'regular_expense'
    ) {
      setEditingTransaction(transaction);
      setShowExpenseModal(true);
    } else if (
      transaction.type === 'expected_income' ||
      transaction.type === 'unexpected_income'
    ) {
      handleOpenIncomeModal(transaction);
    } else if (transaction.type === 'savings') {
      handleOpenSavingsModal(transaction);
    }
  };

  const formatDate = (timestamp: firebaseApp.firestore.Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const currency = userConfig?.currency || 'COP';

  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Filtrar gastos fijos que aplican al mes actual
  const currentMonthNumber = selectedMonth + 1; // selectedMonth es 0-11, necesitamos 1-12
  const expectedFixedExpensesForMonth = fixedExpenses.filter((fe) => {
    // Si no tiene meses específicos, aplica a todos los meses
    if (!fe.months || fe.months.length === 0) {
      return true;
    }
    // Si tiene meses específicos, verificar si incluye el mes actual
    return fe.months.includes(currentMonthNumber);
  });

  // Filtrar ingresos esperados que aplican al mes actual
  const expectedIncomesForMonth = expectedIncomes.filter((ei) => {
    // Si no tiene meses específicos, aplica a todos los meses
    if (!ei.months || ei.months.length === 0) {
      return true;
    }
    // Si tiene meses específicos, verificar si incluye el mes actual
    return ei.months.includes(currentMonthNumber);
  });

  // Crear entradas para gastos fijos esperados que no han sido agregados
  const pendingFixedExpenses = expectedFixedExpensesForMonth
    .filter((fe) => {
      return !transactions.some(
        (t) => t.type === 'fixed_expense' && t.fixedExpenseId === fe.id
      );
    })
    .map((fe) => {
      const transactionDate = new Date(
        selectedYear,
        selectedMonth,
        fe.dayOfMonth
      );
      return {
        id: `pending-fe-${fe.id}`,
        concept: fe.name,
        type: 'fixed_expense' as const,
        paymentMethod: '-',
        expectedAmount: fe.amount,
        value: 0,
        date: firebaseApp.firestore.Timestamp.fromDate(transactionDate),
        fixedExpenseId: fe.id,
      };
    });

  // Crear entradas para ingresos esperados que no han sido agregados
  const pendingExpectedIncomes = expectedIncomesForMonth
    .filter((ei) => {
      return !transactions.some(
        (t) => t.type === 'expected_income' && t.expectedIncomeId === ei.id
      );
    })
    .map((ei) => {
      const transactionDate = new Date(
        selectedYear,
        selectedMonth,
        ei.dayOfMonth
      );
      return {
        id: `pending-ei-${ei.id}`,
        concept: ei.name,
        type: 'expected_income' as const,
        paymentMethod: '-',
        expectedAmount: ei.amount,
        value: 0,
        date: firebaseApp.firestore.Timestamp.fromDate(transactionDate),
        expectedIncomeId: ei.id,
      };
    });

  // Mapear transacciones para mostrar con información adicional
  const mappedTransactions = transactions.map((t) => {
    let concept = t.concept;

    // Obtener el nombre del gasto fijo, ingreso esperado o savings source si aplica
    if (t.type === 'fixed_expense' && t.fixedExpenseId) {
      const fe = fixedExpenses.find((fe) => fe.id === t.fixedExpenseId);
      if (fe) concept = fe.name;
    } else if (t.type === 'expected_income' && t.expectedIncomeId) {
      const ei = expectedIncomes.find((ei) => ei.id === t.expectedIncomeId);
      if (ei) concept = ei.name;
    } else if (t.type === 'savings' && t.savingsSourceId) {
      const ss = savingsSources.find((ss) => ss.id === t.savingsSourceId);
      if (ss) concept = ss.name;
    }

    return {
      ...t,
      concept,
      date: t.date as firebaseApp.firestore.Timestamp,
    };
  });

  // Combinar todas las transacciones: pendientes primero, luego las reales
  const allTransactions = [
    ...pendingFixedExpenses,
    ...pendingExpectedIncomes,
    ...mappedTransactions,
  ].sort((a, b) => {
    const dateA = a.date.toDate().getTime();
    const dateB = b.date.toDate().getTime();
    return dateB - dateA;
  });

  // Calcular gastos totales: suma de regular_expense y fixed_expense
  const totalExpenses = mappedTransactions
    .filter((t) => t.type === 'regular_expense' || t.type === 'fixed_expense')
    .reduce((sum, t) => sum + (t.value ?? 0), 0);

  // Calcular ingresos totales: suma de unexpected_income y expected_income
  const totalIncomes = mappedTransactions
    .filter(
      (t) => t.type === 'unexpected_income' || t.type === 'expected_income'
    )
    .reduce((sum, t) => sum + (t.value ?? 0), 0);

  // Calcular balance final: lo que tenía + ingresos - gastos
  const finalBalance = displayLiquidity + totalIncomes - totalExpenses;

  // Helper para obtener el tipo de transacción en español
  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      fixed_expense: 'Gasto Fijo',
      regular_expense: 'Gasto',
      expected_income: 'Ingreso Esperado',
      unexpected_income: 'Ingreso Inesperado',
      savings: 'Ahorro',
    };
    return types[type] || 'Gasto';
  };

  // Helper para obtener el color del badge según el tipo
  const getTransactionTypeColor = (type: string, isPending: boolean) => {
    if (isPending) return 'bg-amber-100 text-amber-800 border-amber-300';
    const colors: Record<string, string> = {
      fixed_expense: 'bg-red-100 text-red-800 border-red-300',
      regular_expense: 'bg-orange-100 text-orange-800 border-orange-300',
      expected_income: 'bg-blue-100 text-blue-800 border-blue-300',
      unexpected_income: 'bg-green-100 text-green-800 border-green-300',
      savings: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
      <div className='bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8'>
        {/* Balance Cards Section - Responsive Grid */}
        <div className='mb-6 sm:mb-8'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
            {/* Card: Saldo Inicial */}
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-5 border border-blue-200 shadow-sm'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-blue-200 rounded-lg'>
                    <svg
                      className='w-5 h-5 text-blue-700'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-sm font-medium text-blue-900'>
                    Saldo Inicial
                  </h3>
                </div>
                <Button
                  onClick={() => setShowLiquidityModal(true)}
                  variant='ghost'
                  size='sm'
                  className='!p-1'
                  icon={
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                      />
                    </svg>
                  }
                  iconOnly
                />
              </div>
              <p className='text-2xl sm:text-3xl font-bold text-blue-900'>
                {formatCurrency(displayLiquidity ?? 0, currency)}
              </p>
              <p className='text-xs text-blue-700 mt-1'>Del mes anterior</p>
            </div>

            {/* Card: Gastos */}
            <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 sm:p-5 border border-red-200 shadow-sm'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-2 bg-red-200 rounded-lg'>
                  <svg
                    className='w-5 h-5 text-red-700'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-sm font-medium text-red-900'>Gastos</h3>
              </div>
              <p className='text-2xl sm:text-3xl font-bold text-red-700'>
                {formatCurrency(totalExpenses, currency)}
              </p>
              <p className='text-xs text-red-700 mt-1'>Este mes</p>
            </div>

            {/* Card: Ingresos */}
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-5 border border-green-200 shadow-sm'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-2 bg-green-200 rounded-lg'>
                  <svg
                    className='w-5 h-5 text-green-700'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-sm font-medium text-green-900'>Ingresos</h3>
              </div>
              <p className='text-2xl sm:text-3xl font-bold text-green-700'>
                {formatCurrency(totalIncomes, currency)}
              </p>
              <p className='text-xs text-green-700 mt-1'>Este mes</p>
            </div>

            {/* Card: Balance Final */}
            <div
              className={`rounded-xl p-4 sm:p-5 border shadow-sm ${
                finalBalance >= 0
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
              }`}
            >
              <div className='flex items-center gap-2 mb-2'>
                <div
                  className={`p-2 rounded-lg ${
                    finalBalance >= 0 ? 'bg-green-200' : 'bg-red-200'
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      finalBalance >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                </div>
                <h3
                  className={`text-sm font-medium ${
                    finalBalance >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  Balance Final
                </h3>
              </div>
              <p
                className={`text-2xl sm:text-3xl font-bold ${
                  finalBalance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {formatCurrency(finalBalance, currency)}
              </p>
              <p
                className={`text-xs mt-1 ${
                  finalBalance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {finalBalance >= 0 ? 'Disponible' : 'En déficit'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className='flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8'>
          <Button
            onClick={() => {
              if (user?.uid && fixedExpenses.length === 0) {
                dispatch(loadFixedExpenses(user.uid));
              }
              setEditingTransaction(null);
              setShowExpenseModal(true);
            }}
            variant='secondary'
            size='md'
            className='flex-1 sm:flex-initial sm:min-w-[160px]'
            icon={
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
            }
          >
            <span className='hidden sm:inline'>Agregar Gasto</span>
            <span className='sm:hidden'>Gasto</span>
          </Button>
          <Button
            onClick={() => handleOpenIncomeModal()}
            variant='secondary'
            size='md'
            className='flex-1 sm:flex-initial sm:min-w-[160px]'
            icon={
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
            }
          >
            <span className='hidden sm:inline'>Agregar Ingreso</span>
            <span className='sm:hidden'>Ingreso</span>
          </Button>
          <Button
            onClick={() => handleOpenSavingsModal()}
            variant='secondary'
            size='md'
            className='flex-1 sm:flex-initial sm:min-w-[160px]'
            icon={
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            }
          >
            <span className='hidden sm:inline'>Agregar Ahorro</span>
            <span className='sm:hidden'>Ahorro</span>
          </Button>
        </div>

        {/* Transactions Section */}
        <div className='mt-6'>
          <div className='flex items-center justify-between mb-4 sm:mb-6'>
            <h3 className='text-lg sm:text-xl font-semibold text-primary-dark'>
              Transacciones del Mes
            </h3>
            <span className='text-sm text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full'>
              {allTransactions.length}{' '}
              {allTransactions.length === 1 ? 'transacción' : 'transacciones'}
            </span>
          </div>

          {loading ? (
            <div className='text-center py-12'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark mb-4'></div>
              <p className='text-zinc-600'>Cargando transacciones...</p>
            </div>
          ) : allTransactions.length === 0 ? (
            <div className='text-center py-12 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200'>
              <svg
                className='w-16 h-16 text-zinc-400 mx-auto mb-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              <p className='text-zinc-600 text-lg font-medium'>
                No hay transacciones registradas
              </p>
              <p className='text-zinc-500 text-sm mt-1'>
                en {months[selectedMonth]} {selectedYear}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className='hidden lg:block overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b-2 border-zinc-300 bg-zinc-50'>
                      <th className='text-left py-4 px-4 font-semibold text-primary-medium text-sm'>
                        Fecha
                      </th>
                      <th className='text-left py-4 px-4 font-semibold text-primary-medium text-sm'>
                        Concepto
                      </th>
                      <th className='text-left py-4 px-4 font-semibold text-primary-medium text-sm'>
                        Tipo
                      </th>
                      <th className='text-left py-4 px-4 font-semibold text-primary-medium text-sm'>
                        Medio de Pago
                      </th>
                      <th className='text-right py-4 px-4 font-semibold text-primary-medium text-sm'>
                        Esperado
                      </th>
                      <th className='text-right py-4 px-4 font-semibold text-primary-medium text-sm'>
                        Real
                      </th>
                      <th className='text-center py-4 px-4 font-semibold text-primary-medium text-sm w-24'>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map((transaction) => {
                      const isPending = Boolean(
                        transaction.id?.startsWith('pending-')
                      );
                      return (
                        <tr
                          key={transaction.id}
                          className={`border-b border-zinc-200 hover:bg-zinc-50 transition-colors ${
                            isPending ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <td className='py-4 px-4 text-zinc-700 text-sm'>
                            {formatDate(transaction.date)}
                          </td>
                          <td className='py-4 px-4'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium text-zinc-900'>
                                {transaction.concept}
                              </span>
                              {isPending && (
                                <span className='text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-300'>
                                  Pendiente
                                </span>
                              )}
                            </div>
                          </td>
                          <td className='py-4 px-4'>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTransactionTypeColor(
                                transaction.type,
                                isPending
                              )}`}
                            >
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </td>
                          <td className='py-4 px-4 text-zinc-600 text-sm'>
                            {transaction.paymentMethod}
                          </td>
                          <td className='py-4 px-4 text-right text-zinc-500 text-sm'>
                            {transaction.expectedAmount !== null &&
                            transaction.expectedAmount !== undefined
                              ? formatCurrency(
                                  transaction.expectedAmount,
                                  currency
                                )
                              : '-'}
                          </td>
                          <td
                            className={`py-4 px-4 text-right font-semibold text-sm ${
                              transaction.type === 'expected_income' ||
                              transaction.type === 'unexpected_income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'expected_income' ||
                            transaction.type === 'unexpected_income'
                              ? '+'
                              : '-'}
                            {formatCurrency(transaction.value, currency)}
                          </td>
                          <td className='py-4 px-4 text-center'>
                            {!isPending && transaction.id ? (
                              <div className='flex justify-center items-center gap-2'>
                                <Button
                                  onClick={() => {
                                    if (
                                      transaction.id &&
                                      !transaction.id.startsWith('pending-')
                                    ) {
                                      handleEditTransaction(
                                        transaction as Transaction
                                      );
                                    }
                                  }}
                                  variant='ghost'
                                  size='sm'
                                  icon={
                                    <svg
                                      className='w-4 h-4'
                                      fill='none'
                                      stroke='currentColor'
                                      viewBox='0 0 24 24'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                      />
                                    </svg>
                                  }
                                  iconOnly
                                />
                                <Button
                                  onClick={() =>
                                    transaction.id &&
                                    handleDeleteTransaction(transaction.id)
                                  }
                                  variant='ghost'
                                  size='sm'
                                  icon={
                                    <svg
                                      className='w-4 h-4'
                                      fill='none'
                                      stroke='currentColor'
                                      viewBox='0 0 24 24'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                      />
                                    </svg>
                                  }
                                  iconOnly
                                />
                              </div>
                            ) : (
                              <span className='text-zinc-400 text-xs'>
                                Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className='lg:hidden space-y-3'>
                {allTransactions.map((transaction) => {
                  const isPending = Boolean(
                    transaction.id?.startsWith('pending-')
                  );
                  return (
                    <div
                      key={transaction.id}
                      className={`bg-white border-2 rounded-xl p-4 shadow-sm transition-all ${
                        isPending
                          ? 'border-amber-300 bg-amber-50/30'
                          : 'border-zinc-200 hover:border-primary-light hover:shadow-md'
                      }`}
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h4 className='font-semibold text-zinc-900 text-base'>
                              {transaction.concept}
                            </h4>
                            {isPending && (
                              <span className='text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-300'>
                                Pendiente
                              </span>
                            )}
                          </div>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getTransactionTypeColor(
                                transaction.type,
                                isPending
                              )}`}
                            >
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                            <span className='text-xs text-zinc-500'>
                              {formatDate(transaction.date)}
                            </span>
                            {transaction.paymentMethod !== '-' && (
                              <span className='text-xs text-zinc-500'>
                                • {transaction.paymentMethod}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-zinc-200'>
                        <div>
                          <p className='text-xs text-zinc-500 mb-1'>
                            Valor Esperado
                          </p>
                          <p className='text-sm font-medium text-zinc-700'>
                            {transaction.expectedAmount !== null &&
                            transaction.expectedAmount !== undefined
                              ? formatCurrency(
                                  transaction.expectedAmount,
                                  currency
                                )
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-zinc-500 mb-1'>
                            Valor Real
                          </p>
                          <p
                            className={`text-sm font-bold ${
                              transaction.type === 'expected_income' ||
                              transaction.type === 'unexpected_income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'expected_income' ||
                            transaction.type === 'unexpected_income'
                              ? '+'
                              : '-'}
                            {formatCurrency(transaction.value, currency)}
                          </p>
                        </div>
                      </div>

                      {!isPending && transaction.id && (
                        <div className='flex justify-end gap-2 pt-3 border-t border-zinc-200'>
                          <Button
                            onClick={() => {
                              if (
                                transaction.id &&
                                !transaction.id.startsWith('pending-')
                              ) {
                                handleEditTransaction(
                                  transaction as Transaction
                                );
                              }
                            }}
                            variant='ghost'
                            size='sm'
                            className='!px-3'
                            icon={
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                />
                              </svg>
                            }
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() =>
                              transaction.id &&
                              handleDeleteTransaction(transaction.id)
                            }
                            variant='ghost'
                            size='sm'
                            className='!px-3 text-red-600 hover:text-red-700 hover:bg-red-50'
                            icon={
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
                            }
                          >
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para Ingreso */}
      {showIncomeModal && (
        <IncomeModal
          userId={user?.uid || ''}
          monthPeriod={currentPeriod}
          expectedIncomes={expectedIncomes}
          currency={currency}
          editingTransaction={editingTransaction}
          onClose={() => {
            setShowIncomeModal(false);
            setEditingTransaction(null);
          }}
          onSave={async () => {
            // Asegurar que los ingresos esperados estén cargados
            if (user?.uid && expectedIncomes.length === 0) {
              await dispatch(loadExpectedIncomes(user.uid));
            }
            await dispatch(
              loadTransactions({
                userId: user?.uid || '',
                monthPeriod: currentPeriod,
              })
            ).unwrap();
            // Actualizar balances después de guardar
            if (user?.uid && userConfig) {
              await dispatch(
                updateMonthBalances({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
                  dayOfMonth: userConfig.monthResetDay,
                })
              ).unwrap();
            }
            setShowIncomeModal(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Modal para Ahorro */}
      {showSavingsModal && (
        <SavingsModal
          userId={user?.uid || ''}
          monthPeriod={currentPeriod}
          savingsSources={savingsSources}
          currency={currency}
          editingTransaction={editingTransaction}
          onClose={() => {
            setShowSavingsModal(false);
            setEditingTransaction(null);
          }}
          onSave={async () => {
            // Asegurar que las fuentes de ahorro estén cargadas
            if (user?.uid && savingsSources.length === 0) {
              await dispatch(loadSavingsSources(user.uid));
            }
            await dispatch(
              loadTransactions({
                userId: user?.uid || '',
                monthPeriod: currentPeriod,
              })
            ).unwrap();
            // Actualizar balances después de guardar
            if (user?.uid && userConfig) {
              await dispatch(
                updateMonthBalances({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
                  dayOfMonth: userConfig.monthResetDay,
                })
              ).unwrap();
            }
            setShowSavingsModal(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Modal para Líquido Inicial */}
      {showLiquidityModal && (
        <LiquidityModal
          userId={user?.uid || ''}
          monthPeriod={currentPeriod}
          monthlyLiquidity={monthlyLiquidity}
          currency={currency}
          onClose={() => setShowLiquidityModal(false)}
          onSave={async () => {
            await dispatch(
              loadMonthlyLiquidity({
                userId: user?.uid || '',
                monthPeriod: currentPeriod,
                dayOfMonth: userConfig?.monthResetDay,
              })
            ).unwrap();
            // Actualizar balances después de guardar
            if (user?.uid && userConfig) {
              await dispatch(
                updateMonthBalances({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
                  dayOfMonth: userConfig.monthResetDay,
                })
              ).unwrap();
            }
            setShowLiquidityModal(false);
          }}
        />
      )}

      {/* Modal para Gasto (Fijo u Ocasional) */}
      {showExpenseModal && (
        <ExpenseModal
          userId={user?.uid || ''}
          monthPeriod={currentPeriod}
          fixedExpenses={fixedExpenses}
          currency={currency}
          editingTransaction={editingTransaction}
          onClose={() => {
            setShowExpenseModal(false);
            setEditingTransaction(null);
          }}
          onSave={async () => {
            // Asegurar que los gastos fijos estén cargados
            if (user?.uid && fixedExpenses.length === 0) {
              await dispatch(loadFixedExpenses(user.uid));
            }
            await dispatch(
              loadTransactions({
                userId: user?.uid || '',
                monthPeriod: currentPeriod,
              })
            ).unwrap();
            // Actualizar balances después de guardar
            if (user?.uid && userConfig) {
              await dispatch(
                updateMonthBalances({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
                  dayOfMonth: userConfig.monthResetDay,
                })
              ).unwrap();
            }
            setShowExpenseModal(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
};

export default MyMonth;
