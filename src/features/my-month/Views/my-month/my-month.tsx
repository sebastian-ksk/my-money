'use client';

import React, { useEffect, useState } from 'react';
import firebaseApp from 'firebase/app';
import { Button } from '@/components/ui';
import MonthTabs from '@/features/my-month/widgets/month-tabs/month-tabs';
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
  const confirm = useConfirm();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showLiquidityModal, setShowLiquidityModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Log para debugging
  useEffect(() => {
    console.log('Estado del usuario en MyMonth:', { user, uid: user?.uid });
  }, [user]);

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

  // Actualizar mes y año cuando se carga la configuración del usuario
  // Solo actualizar si aún no se ha cambiado manualmente (primera carga)
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (userConfig?.monthResetDay !== undefined && !isInitialized) {
      const currentDisplay = getCurrentDisplayMonth(userConfig.monthResetDay);
      setSelectedMonth(currentDisplay.month);
      setSelectedYear(currentDisplay.year);
      setIsInitialized(true);
    }
  }, [userConfig?.monthResetDay, isInitialized]);

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

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsInitialized(true); // Marcar como inicializado cuando el usuario cambia manualmente
  };

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

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
      <div className='bg-white rounded-lg shadow-lg p-8'>
        <MonthTabs
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        >
          {/* Balance Section */}
          <div className='mb-6'>
            <div className='flex flex-wrap items-center gap-4 text-sm'>
              <div className='text-zinc-600'>
                <span className='font-medium'>El mes pasado te quedó:</span>{' '}
                <span className='font-semibold text-zinc-800'>
                  {formatCurrency(displayLiquidity ?? 0, currency)}
                </span>
              </div>
              <div className='text-zinc-600'>
                <span className='font-medium'>Este mes has gastado:</span>{' '}
                <span className='font-semibold text-red-600'>
                  {formatCurrency(
                    monthlyLiquidity?.totalExpenses ?? 0,
                    currency
                  )}
                </span>
              </div>
              <div className='text-zinc-600'>
                <span className='font-medium'>Te ha ingresado:</span>{' '}
                <span className='font-semibold text-green-600'>
                  {formatCurrency(
                    monthlyLiquidity?.totalIncomes ?? 0,
                    currency
                  )}
                </span>
              </div>
              <div className='text-zinc-600'>
                <span className='font-medium'>Te queda:</span>{' '}
                <span
                  className={`font-semibold ${
                    (monthlyLiquidity?.finalBalance ?? 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(
                    monthlyLiquidity?.finalBalance ?? 0,
                    currency
                  )}
                </span>
              </div>
              <Button
                onClick={() => setShowLiquidityModal(true)}
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-3 mb-6'>
            <Button
              onClick={() => {
                // Asegurar que los gastos fijos estén cargados
                if (user?.uid && fixedExpenses.length === 0) {
                  dispatch(loadFixedExpenses(user.uid));
                }
                setEditingTransaction(null);
                setShowExpenseModal(true);
              }}
              variant='secondary'
              size='md'
              className='flex-1 min-w-[150px]'
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
              Agregar Gasto
            </Button>
            <Button
              onClick={() => handleOpenIncomeModal()}
              variant='secondary'
              size='md'
              className='flex-1 min-w-[150px]'
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
              Agregar Ingreso
            </Button>
            <Button
              onClick={() => handleOpenSavingsModal()}
              variant='secondary'
              size='md'
              className='flex-1 min-w-[150px]'
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
              Agregar Ahorro
            </Button>
          </div>

          {/* Transactions Table */}
          <div className='mt-6'>
            <h3 className='text-lg font-semibold text-primary-dark mb-4'>
              Transacciones del Mes
            </h3>
            {loading ? (
              <div className='text-center py-12'>
                <p className='text-zinc-600'>Cargando transacciones...</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-zinc-200'>
                      <th className='text-left py-3 px-4 font-semibold text-primary-medium'>
                        Fecha
                      </th>
                      <th className='text-left py-3 px-4 font-semibold text-primary-medium'>
                        Concepto
                      </th>
                      <th className='text-left py-3 px-4 font-semibold text-primary-medium'>
                        Tipo
                      </th>
                      <th className='text-left py-3 px-4 font-semibold text-primary-medium'>
                        Medio de Pago
                      </th>
                      <th className='text-right py-3 px-4 font-semibold text-primary-medium'>
                        Valor Esperado
                      </th>
                      <th className='text-right py-3 px-4 font-semibold text-primary-medium'>
                        Valor Real
                      </th>
                      <th className='text-center py-3 px-4 font-semibold text-primary-medium w-24'>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className='py-12 text-center text-zinc-600'
                        >
                          No hay transacciones registradas en{' '}
                          {months[selectedMonth]} {selectedYear}
                        </td>
                      </tr>
                    ) : (
                      allTransactions.map((transaction) => {
                        // Solo mostrar acciones para transacciones reales (no pendientes)
                        const isPending =
                          transaction.id?.startsWith('pending-');
                        return (
                          <tr
                            key={transaction.id}
                            className='border-b border-zinc-200 hover:bg-neutral-light transition-colors'
                          >
                            <td className='py-3 px-4 text-zinc-600'>
                              {formatDate(transaction.date)}
                            </td>
                            <td className='py-3 px-4 text-zinc-800'>
                              {transaction.concept}
                            </td>
                            <td className='py-3 px-4 text-zinc-600'>
                              {transaction.type === 'fixed_expense'
                                ? 'Gasto Fijo'
                                : transaction.type === 'expected_income'
                                ? 'Ingreso Esperado'
                                : transaction.type === 'unexpected_income'
                                ? 'Ingreso Inesperado'
                                : transaction.type === 'savings'
                                ? 'Ahorro'
                                : 'Gasto'}
                            </td>
                            <td className='py-3 px-4 text-zinc-600'>
                              {transaction.paymentMethod}
                            </td>
                            <td className='py-3 px-4 text-right text-zinc-500'>
                              {transaction.expectedAmount !== null &&
                              transaction.expectedAmount !== undefined
                                ? formatCurrency(
                                    transaction.expectedAmount,
                                    currency
                                  )
                                : '-'}
                            </td>
                            <td
                              className={`py-3 px-4 text-right font-semibold ${
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
                            <td className='py-3 px-4 text-center w-24'>
                              {!isPending && transaction.id ? (
                                <div className='flex justify-center items-center gap-1 sm:gap-2'>
                                  <Button
                                    onClick={() => {
                                      // Solo editar si es una transacción real (no pendiente)
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
                                <span className='inline-block w-full'>
                                  &nbsp;
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </MonthTabs>
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
