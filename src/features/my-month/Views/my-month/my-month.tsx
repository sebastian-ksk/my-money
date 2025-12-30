'use client';

import React, { useEffect, useState } from 'react';
import firebaseApp from 'firebase/app';
import { Button } from '@/components/ui';
import MonthTabs from '@/features/my-month/widgets/month-tabs/month-tabs';
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
  createSavingsSource,
} from '@/Redux/features/config-my-money';
import {
  selectTransactions,
  selectTotalFixedExpensePayments,
  selectTotalRealIncomes,
  selectTotalRegularExpenses,
  selectMyMonthLoading,
  selectMonthlyLiquidity,
} from '@/Redux/features/my-month';
import {
  loadTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  loadMonthlyLiquidity,
  createLiquiditySource,
  updateLiquiditySource,
  deleteLiquiditySource,
} from '@/Redux/features/my-month/my-month-thunks';
import {
  calculateMonthPeriod,
  getCurrentDisplayMonth,
} from '@/services/Firebase/my-month-service';
import { formatCurrency } from '@/utils/currency';
import type {
  Transaction,
  LiquiditySource,
  MonthlyLiquidityState,
} from '@/Redux/features/my-month/my-month-models';
import { useConfirm } from '@/components/ui';

type ModalType =
  | 'fixedExpense'
  | 'income'
  | 'regularExpense'
  | 'savings'
  | null;

const MyMonth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userConfig = useAppSelector(selectUserConfig);
  const fixedExpenses = useAppSelector(selectFixedExpenses);
  const expectedIncomes = useAppSelector(selectExpectedIncomes);
  const savingsSources = useAppSelector(selectSavingsSources);
  const transactions = useAppSelector(selectTransactions);
  const totalFixedPayments = useAppSelector(selectTotalFixedExpensePayments);
  const totalIncomes = useAppSelector(selectTotalRealIncomes);
  const totalRegularExpenses = useAppSelector(selectTotalRegularExpenses);
  const loading = useAppSelector(selectMyMonthLoading);
  const monthlyLiquidity = useAppSelector(selectMonthlyLiquidity);
  const confirm = useConfirm();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showModal, setShowModal] = useState<ModalType>(null);
  const [showLiquidityModal, setShowLiquidityModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    fixedExpenseId: '',
    expectedAmount: '',
    realAmount: '',
    expectedIncomeId: '',
    value: '',
    concept: '',
    paymentMethod: 'efectivo',
    savingsSourceId: '',
    newSavingsSourceName: '',
  });

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

  // Calcular balance: líquido inicial esperado + ingresos reales - gastos (fijos + eventuales)
  const totalLiquid = monthlyLiquidity?.expectedAmount ?? 0;
  const totalExpenses = totalFixedPayments + totalRegularExpenses;

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
      ).catch((error: unknown) => {
        console.error('Error al cargar transacciones:', error);
      });

      dispatch(
        loadMonthlyLiquidity({
          userId: user.uid,
          monthPeriod: currentPeriod,
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

  const handleOpenFixedExpenseModal = (transaction?: Transaction | null) => {
    if (transaction && !transaction.id) return;
    // Asegurar que los gastos fijos estén cargados
    if (user?.uid && fixedExpenses.length === 0) {
      dispatch(loadFixedExpenses(user.uid));
    }
    setEditingTransaction(transaction || null);
    setShowModal('fixedExpense');
    if (transaction) {
      setFormData({
        fixedExpenseId: transaction.fixedExpenseId || '',
        expectedAmount: transaction.expectedAmount?.toString() || '',
        realAmount: transaction.value?.toString() || '',
        expectedIncomeId: '',
        value: '',
        concept: '',
        paymentMethod: transaction.paymentMethod || 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    } else {
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: '',
        concept: '',
        paymentMethod: 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    }
  };

  const handleOpenIncomeModal = (transaction?: Transaction | null) => {
    // Asegurar que los ingresos esperados estén cargados
    if (user?.uid && expectedIncomes.length === 0) {
      dispatch(loadExpectedIncomes(user.uid));
    }
    setEditingTransaction(transaction || null);
    setShowModal('income');
    if (transaction) {
      setFormData({
        fixedExpenseId: '',
        expectedAmount: transaction.expectedAmount?.toString() || '',
        realAmount: transaction.value?.toString() || '',
        expectedIncomeId: transaction.expectedIncomeId || '',
        value: transaction.value?.toString() || '',
        concept: transaction.concept || '',
        paymentMethod: transaction.paymentMethod || 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    } else {
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: '',
        concept: '',
        paymentMethod: 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    }
  };

  const handleOpenRegularExpenseModal = (transaction?: Transaction | null) => {
    setEditingTransaction(transaction || null);
    setShowModal('regularExpense');
    if (transaction) {
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: transaction.value?.toString() || '',
        concept: transaction.concept || '',
        paymentMethod: transaction.paymentMethod || 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    } else {
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: '',
        concept: '',
        paymentMethod: 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    }
  };

  const handleOpenSavingsModal = (transaction?: Transaction | null) => {
    if (user?.uid && savingsSources.length === 0) {
      dispatch(loadSavingsSources(user.uid));
    }
    setEditingTransaction(transaction || null);
    setShowModal('savings');
    if (transaction) {
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: transaction.value?.toString() || '',
        concept: '',
        paymentMethod: transaction.paymentMethod || 'efectivo',
        savingsSourceId: transaction.savingsSourceId || '',
        newSavingsSourceName: '',
      });
    } else {
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: '',
        concept: '',
        paymentMethod: 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    }
  };

  const handleFixedExpenseChange = (fixedExpenseId: string) => {
    const fixedExpense = fixedExpenses.find((fe) => fe.id === fixedExpenseId);
    if (fixedExpense) {
      setFormData({
        ...formData,
        fixedExpenseId,
        expectedAmount: fixedExpense.amount.toString(),
        realAmount: fixedExpense.amount.toString(), // Por defecto el mismo valor
      });
    }
  };

  const handleExpectedIncomeChange = (expectedIncomeId: string) => {
    const expectedIncome = expectedIncomes.find(
      (ei) => ei.id === expectedIncomeId
    );
    if (expectedIncome) {
      setFormData({
        ...formData,
        expectedIncomeId,
        expectedAmount: expectedIncome.amount.toString(),
        realAmount: expectedIncome.amount.toString(), // Por defecto el mismo valor
      });
    }
  };

  const handleSubmitFixedExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !formData.fixedExpenseId) {
      return;
    }

    const fixedExpense = fixedExpenses.find(
      (fe) => fe.id === formData.fixedExpenseId
    );
    if (!fixedExpense) {
      return;
    }

    try {
      if (editingTransaction && editingTransaction.id) {
        // Actualizar transacción existente
        await dispatch(
          updateTransaction({
            transactionId: editingTransaction.id,
            transaction: {
              value: parseFloat(formData.realAmount),
              paymentMethod: formData.paymentMethod,
            },
          })
        ).unwrap();
      } else {
        // Crear nueva transacción
        await dispatch(
          createTransaction({
            userId: user.uid,
            transaction: {
              type: 'fixed_expense',
              fixedExpenseId: formData.fixedExpenseId,
              expectedAmount: parseFloat(formData.expectedAmount),
              value: parseFloat(formData.realAmount),
              concept: fixedExpense.name,
              paymentMethod: formData.paymentMethod,
              date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
              monthPeriod: currentPeriod,
            },
          })
        ).unwrap();
      }

      // Recargar transacciones
      await dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).unwrap();

      setShowModal(null);
      setEditingTransaction(null);
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: '',
        concept: '',
        paymentMethod: 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    } catch (error) {
      console.error('Error al guardar pago fijo:', error);
    }
  };

  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    // Si hay expectedIncomeId, es un ingreso esperado
    if (formData.expectedIncomeId) {
      const expectedIncome = expectedIncomes.find(
        (ei) => ei.id === formData.expectedIncomeId
      );
      if (!expectedIncome) return;

      try {
        if (editingTransaction && editingTransaction.id) {
          await dispatch(
            updateTransaction({
              transactionId: editingTransaction.id,
              transaction: {
                value: parseFloat(formData.realAmount),
                paymentMethod: formData.paymentMethod,
              },
            })
          ).unwrap();
        } else {
          await dispatch(
            createTransaction({
              userId: user.uid,
              transaction: {
                type: 'expected_income',
                expectedIncomeId: formData.expectedIncomeId,
                expectedAmount: parseFloat(formData.expectedAmount),
                value: parseFloat(formData.realAmount),
                concept: expectedIncome.name,
                paymentMethod: formData.paymentMethod,
                date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
                monthPeriod: currentPeriod,
              },
            })
          ).unwrap();
        }

        await dispatch(
          loadTransactions({
            userId: user.uid,
            monthPeriod: currentPeriod,
          })
        ).unwrap();

        setShowModal(null);
        setEditingTransaction(null);
        setFormData({
          fixedExpenseId: '',
          expectedAmount: '',
          realAmount: '',
          expectedIncomeId: '',
          value: '',
          concept: '',
          paymentMethod: 'efectivo',
          savingsSourceId: '',
          newSavingsSourceName: '',
        });
      } catch (error) {
        console.error('Error al guardar ingreso:', error);
      }
    } else {
      // Es un ingreso inesperado
      if (!formData.concept) return;

      try {
        if (editingTransaction && editingTransaction.id) {
          await dispatch(
            updateTransaction({
              transactionId: editingTransaction.id,
              transaction: {
                value: parseFloat(formData.value),
                concept: formData.concept,
                paymentMethod: formData.paymentMethod,
              },
            })
          ).unwrap();
        } else {
          await dispatch(
            createTransaction({
              userId: user.uid,
              transaction: {
                type: 'unexpected_income',
                value: parseFloat(formData.value),
                concept: formData.concept,
                paymentMethod: formData.paymentMethod,
                date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
                monthPeriod: currentPeriod,
              },
            })
          ).unwrap();
        }

        await dispatch(
          loadTransactions({
            userId: user.uid,
            monthPeriod: currentPeriod,
          })
        ).unwrap();

        setShowModal(null);
        setEditingTransaction(null);
        setFormData({
          fixedExpenseId: '',
          expectedAmount: '',
          realAmount: '',
          expectedIncomeId: '',
          value: '',
          concept: '',
          paymentMethod: 'efectivo',
          savingsSourceId: '',
          newSavingsSourceName: '',
        });
      } catch (error) {
        console.error('Error al guardar ingreso inesperado:', error);
      }
    }
  };

  const handleSubmitRegularExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !formData.concept) return;

    try {
      if (editingTransaction?.id) {
        await dispatch(
          updateTransaction({
            transactionId: editingTransaction.id,
            transaction: {
              value: parseFloat(formData.value),
              concept: formData.concept,
              paymentMethod: formData.paymentMethod,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createTransaction({
            userId: user.uid,
            transaction: {
              type: 'regular_expense',
              value: parseFloat(formData.value),
              concept: formData.concept,
              paymentMethod: formData.paymentMethod,
              date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
              monthPeriod: currentPeriod,
            },
          })
        ).unwrap();
      }

      await dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).unwrap();

      setShowModal(null);
      setEditingTransaction(null);
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: '',
        concept: '',
        paymentMethod: 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    } catch (error) {
      console.error('Error al guardar gasto:', error);
    }
  };

  const handleSubmitSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !formData.value) return;

    let savingsSourceId = formData.savingsSourceId;

    // Si el usuario quiere crear un nuevo savings source
    if (formData.savingsSourceId === 'new' && formData.newSavingsSourceName) {
      try {
        const newSource = await dispatch(
          createSavingsSource({
            userId: user.uid,
            source: {
              name: formData.newSavingsSourceName,
              amount: 0,
            },
          })
        ).unwrap();

        if (!newSource.id) {
          console.error('Error al crear fuente de ahorro: no se obtuvo ID');
          return;
        }
        savingsSourceId = newSource.id;
        await dispatch(loadSavingsSources(user.uid));
      } catch (error) {
        console.error('Error al crear fuente de ahorro:', error);
        return;
      }
    }

    if (!savingsSourceId) {
      console.error('Debe seleccionar o crear una fuente de ahorro');
      return;
    }

    const savingsSource = savingsSources.find(
      (ss) => ss.id === savingsSourceId
    );
    if (!savingsSource) {
      console.error('Fuente de ahorro no encontrada');
      return;
    }

    try {
      if (editingTransaction && editingTransaction.id) {
        if (!editingTransaction.id) return;
        await dispatch(
          updateTransaction({
            transactionId: editingTransaction.id,
            transaction: {
              value: parseFloat(formData.value),
              paymentMethod: formData.paymentMethod,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createTransaction({
            userId: user.uid,
            transaction: {
              type: 'savings',
              value: parseFloat(formData.value),
              concept: savingsSource.name,
              paymentMethod: formData.paymentMethod,
              date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
              monthPeriod: currentPeriod,
              savingsSourceId,
            },
          })
        ).unwrap();
      }

      await dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).unwrap();

      setShowModal(null);
      setEditingTransaction(null);
      setFormData({
        fixedExpenseId: '',
        expectedAmount: '',
        realAmount: '',
        expectedIncomeId: '',
        value: '',
        concept: '',
        paymentMethod: 'efectivo',
        savingsSourceId: '',
        newSavingsSourceName: '',
      });
    } catch (error) {
      console.error('Error al guardar ahorro:', error);
    }
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
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
    }
  };

  const handleEditTransaction = (transaction: any) => {
    if (!transaction?.id) return;
    if (transaction.type === 'fixed_expense') {
      handleOpenFixedExpenseModal(transaction);
    } else if (
      transaction.type === 'expected_income' ||
      transaction.type === 'unexpected_income'
    ) {
      handleOpenIncomeModal(transaction);
    } else if (transaction.type === 'regular_expense') {
      handleOpenRegularExpenseModal(transaction);
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
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3 text-sm'>
                <div className='text-zinc-600'>
                  <span className='font-medium'>Líquido Inicial Esperado:</span>{' '}
                  {formatCurrency(
                    monthlyLiquidity?.expectedAmount ?? 0,
                    currency
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowLiquidityModal(true)}
                variant='secondary'
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
              >
                ¿Cuánto te quedó del mes pasado?
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-3 mb-6'>
            <Button
              onClick={() => handleOpenFixedExpenseModal()}
              variant='secondary'
              size='md'
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
              Agregar Pago Fijo
            </Button>
            <Button
              onClick={() => handleOpenIncomeModal()}
              variant='secondary'
              size='md'
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
              onClick={() => handleOpenRegularExpenseModal()}
              variant='secondary'
              size='md'
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
              onClick={() => handleOpenSavingsModal()}
              variant='secondary'
              size='md'
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
                                    onClick={() =>
                                      handleEditTransaction(transaction)
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

      {/* Modal para Pago Fijo */}
      {showModal === 'fixedExpense' && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-2xl font-bold mb-4 text-primary-dark'>
              {editingTransaction ? 'Editar Pago Fijo' : 'Agregar Pago Fijo'}
            </h3>
            <form onSubmit={handleSubmitFixedExpense}>
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Gasto Fijo *
                </label>
                <select
                  required
                  value={formData.fixedExpenseId}
                  onChange={(e) => handleFixedExpenseChange(e.target.value)}
                  disabled={!!editingTransaction}
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white disabled:bg-zinc-100 disabled:text-zinc-600'
                  aria-label='Gasto Fijo'
                >
                  <option value=''>Seleccione un gasto fijo</option>
                  {fixedExpenses.length === 0 ? (
                    <option value='' disabled>
                      No hay gastos fijos configurados. Configúralos primero.
                    </option>
                  ) : (
                    fixedExpenses.map((fe) => (
                      <option key={fe.id} value={fe.id}>
                        {fe.name} - {formatCurrency(fe.amount, currency)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {formData.fixedExpenseId && (
                <>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2 text-primary-medium'>
                      Valor Esperado
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      value={formData.expectedAmount}
                      readOnly
                      className='w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-100 text-zinc-600'
                    />
                  </div>

                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2 text-primary-medium'>
                      Valor Real *
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      value={formData.realAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, realAmount: e.target.value })
                      }
                      className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                      placeholder='0.00'
                    />
                  </div>
                </>
              )}

              <div className='mb-6'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Medio de Pago *
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
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
                <Button
                  type='button'
                  onClick={() => setShowModal(null)}
                  variant='outline'
                  size='md'
                  className='flex-1'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  variant='secondary'
                  size='md'
                  className='flex-1'
                  disabled={!formData.fixedExpenseId}
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Ingreso */}
      {showModal === 'income' && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-2xl font-bold mb-4 text-primary-dark'>
              {formData.expectedIncomeId
                ? 'Agregar Ingreso Esperado'
                : 'Agregar Ingreso Inesperado'}
            </h3>
            <form onSubmit={handleSubmitIncome}>
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Tipo de Ingreso
                </label>
                <select
                  value={formData.expectedIncomeId || 'unexpected'}
                  onChange={(e) => {
                    if (e.target.value === 'unexpected') {
                      setFormData({
                        ...formData,
                        expectedIncomeId: '',
                        expectedAmount: '',
                        realAmount: '',
                      });
                    } else {
                      handleExpectedIncomeChange(e.target.value);
                    }
                  }}
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  aria-label='Tipo de ingreso'
                >
                  <option value='unexpected'>Ingreso Inesperado</option>
                  {expectedIncomes.length > 0 && (
                    <optgroup label='Ingresos Esperados'>
                      {expectedIncomes.map((ei) => (
                        <option key={ei.id} value={ei.id}>
                          {ei.name} - {formatCurrency(ei.amount, currency)}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {formData.expectedIncomeId ? (
                <>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2 text-primary-medium'>
                      Valor Esperado
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      value={formData.expectedAmount}
                      readOnly
                      className='w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-100 text-zinc-600'
                    />
                  </div>

                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2 text-primary-medium'>
                      Valor Real *
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      value={formData.realAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, realAmount: e.target.value })
                      }
                      className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                      placeholder='0.00'
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2 text-primary-medium'>
                      Concepto *
                    </label>
                    <input
                      type='text'
                      required
                      value={formData.concept}
                      onChange={(e) =>
                        setFormData({ ...formData, concept: e.target.value })
                      }
                      className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                      placeholder='Descripción del ingreso'
                    />
                  </div>

                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2 text-primary-medium'>
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
                      className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                      placeholder='0.00'
                    />
                  </div>
                </>
              )}

              <div className='mb-6'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Medio de Pago *
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
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
                <Button
                  type='button'
                  onClick={() => setShowModal(null)}
                  variant='outline'
                  size='md'
                  className='flex-1'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  variant='secondary'
                  size='md'
                  className='flex-1'
                  disabled={
                    formData.expectedIncomeId
                      ? !formData.realAmount
                      : !formData.value || !formData.concept
                  }
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Ahorro */}
      {showModal === 'savings' && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-2xl font-bold mb-4 text-primary-dark'>
              Agregar Ahorro
            </h3>
            <form onSubmit={handleSubmitSavings}>
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Fuente de Ahorro *
                </label>
                <select
                  required
                  value={formData.savingsSourceId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      savingsSourceId: e.target.value,
                      newSavingsSourceName: '',
                    })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  aria-label='Fuente de ahorro'
                >
                  <option value=''>Seleccione una fuente de ahorro</option>
                  {savingsSources.map((ss) => (
                    <option key={ss.id} value={ss.id}>
                      {ss.name}
                    </option>
                  ))}
                  <option value='new'>+ Crear nueva fuente de ahorro</option>
                </select>
              </div>

              {formData.savingsSourceId === 'new' && (
                <div className='mb-4'>
                  <label className='block text-sm font-medium mb-2 text-primary-medium'>
                    Nombre de la Nueva Fuente de Ahorro *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.newSavingsSourceName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newSavingsSourceName: e.target.value,
                      })
                    }
                    className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                    placeholder='Ej: Cuenta de ahorros, Caja fuerte, etc.'
                  />
                </div>
              )}

              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
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
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='0.00'
                />
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Medio de Pago *
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
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
                <Button
                  type='button'
                  onClick={() => setShowModal(null)}
                  variant='outline'
                  size='md'
                  className='flex-1'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  variant='secondary'
                  size='md'
                  className='flex-1'
                  disabled={
                    !formData.savingsSourceId ||
                    !formData.value ||
                    (formData.savingsSourceId === 'new' &&
                      !formData.newSavingsSourceName)
                  }
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Gasto Regular */}
      {showModal === 'regularExpense' && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-2xl font-bold mb-4 text-primary-dark'>
              Crear Nuevo Gasto
            </h3>
            <form onSubmit={handleSubmitRegularExpense}>
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
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
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='0.00'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Concepto *
                </label>
                <input
                  type='text'
                  required
                  value={formData.concept}
                  onChange={(e) =>
                    setFormData({ ...formData, concept: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='Descripción del gasto'
                />
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Medio de Pago *
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
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
                <Button
                  type='button'
                  onClick={() => setShowModal(null)}
                  variant='outline'
                  size='md'
                  className='flex-1'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  variant='secondary'
                  size='md'
                  className='flex-1'
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
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
              })
            ).unwrap();
            setShowLiquidityModal(false);
          }}
        />
      )}
    </div>
  );
};

// Componente Modal de Liquidez
const LiquidityModal = ({
  userId,
  monthPeriod,
  monthlyLiquidity,
  currency,
  onClose,
  onSave,
}: {
  userId: string;
  monthPeriod: string;
  monthlyLiquidity: MonthlyLiquidityState | null;
  currency: string;
  onClose: () => void;
  onSave: () => void;
}) => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const sources = monthlyLiquidity?.liquiditySources || [];
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<LiquiditySource | null>(
    null
  );
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceExpected, setNewSourceExpected] = useState('');
  const [newSourceReal, setNewSourceReal] = useState('');

  const handleAddSource = async () => {
    if (!newSourceName || !newSourceExpected) return;

    try {
      await dispatch(
        createLiquiditySource({
          userId,
          monthPeriod,
          source: {
            name: newSourceName,
            expectedAmount: parseFloat(newSourceExpected),
            realAmount: newSourceReal ? parseFloat(newSourceReal) : null,
          },
        })
      ).unwrap();
      setNewSourceName('');
      setNewSourceExpected('');
      setNewSourceReal('');
      await onSave();
    } catch (error) {
      console.error('Error al agregar fuente:', error);
    }
  };

  const handleUpdateSource = async (
    sourceId: string,
    updates: {
      name?: string;
      expectedAmount?: number;
      realAmount?: number | null;
    }
  ) => {
    try {
      await dispatch(
        updateLiquiditySource({
          userId,
          monthPeriod,
          sourceId,
          source: updates,
        })
      ).unwrap();
      setEditingSourceId(null);
      await onSave();
    } catch (error) {
      console.error('Error al actualizar fuente:', error);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    const confirmed = await confirm.showConfirm({
      title: 'Eliminar Fuente',
      message: '¿Está seguro de eliminar esta fuente de liquidez?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await dispatch(
        deleteLiquiditySource({
          userId,
          monthPeriod,
          sourceId,
        })
      ).unwrap();
      await onSave();
    } catch (error) {
      console.error('Error al eliminar fuente:', error);
    }
  };

  const totalExpected = sources.reduce(
    (sum: number, s: LiquiditySource) => sum + s.expectedAmount,
    0
  );
  const totalReal = sources.reduce(
    (sum: number, s: LiquiditySource) => sum + (s.realAmount ?? 0),
    0
  );

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <h3 className='text-2xl font-bold mb-4 text-primary-dark'>
          Líquido del Mes Anterior
        </h3>

        {/* Resumen */}
        <div className='mb-6 p-4 bg-zinc-50 rounded-lg'>
          <div className='flex justify-between items-center mb-2'>
            <span className='font-medium text-zinc-700'>Total Esperado:</span>
            <span className='text-lg font-semibold text-zinc-800'>
              {formatCurrency(totalExpected, currency)}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='font-medium text-zinc-700'>Total Real:</span>
            <span className='text-lg font-semibold text-green-600'>
              {formatCurrency(totalReal, currency)}
            </span>
          </div>
        </div>

        {/* Lista de Fuentes */}
        <div className='mb-6'>
          <h4 className='text-lg font-semibold mb-3 text-primary-dark'>
            Fuentes de Liquidez
          </h4>
          <div className='space-y-3'>
            {sources.map((source: LiquiditySource, index: number) => (
              <div
                key={source.id || `source-${index}`}
                className='p-4 border border-zinc-200 rounded-lg'
              >
                {editingSourceId === source.id && editingSource ? (
                  <div className='space-y-3'>
                    <input
                      type='text'
                      value={editingSource.name}
                      onChange={(e) =>
                        setEditingSource({
                          ...editingSource,
                          name: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-zinc-200 rounded-lg'
                      placeholder='Nombre de la fuente'
                      aria-label='Nombre de la fuente'
                    />
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Esperado
                        </label>
                        <input
                          type='number'
                          step='0.01'
                          value={editingSource.expectedAmount}
                          onChange={(e) =>
                            setEditingSource({
                              ...editingSource,
                              expectedAmount: parseFloat(e.target.value) || 0,
                            })
                          }
                          className='w-full px-3 py-2 border border-zinc-200 rounded-lg'
                          aria-label='Valor esperado'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Real
                        </label>
                        <input
                          type='number'
                          step='0.01'
                          value={editingSource.realAmount ?? ''}
                          onChange={(e) =>
                            setEditingSource({
                              ...editingSource,
                              realAmount: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          className='w-full px-3 py-2 border border-zinc-200 rounded-lg'
                          placeholder='Opcional'
                          aria-label='Valor real'
                        />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        onClick={() => {
                          if (editingSource.id) {
                            handleUpdateSource(editingSource.id, {
                              name: editingSource.name,
                              expectedAmount: editingSource.expectedAmount,
                              realAmount: editingSource.realAmount,
                            });
                          }
                        }}
                        variant='secondary'
                        size='sm'
                      >
                        Guardar
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingSourceId(null);
                          setEditingSource(null);
                        }}
                        variant='outline'
                        size='sm'
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex justify-between items-center'>
                    <div className='flex-1'>
                      <div className='font-medium text-zinc-800'>
                        {source.name}
                      </div>
                      <div className='text-sm text-zinc-600 mt-1'>
                        Esperado:{' '}
                        {formatCurrency(source.expectedAmount, currency)}
                        {source.realAmount !== null && (
                          <>
                            {' '}
                            | Real:{' '}
                            {formatCurrency(source.realAmount, currency)}
                          </>
                        )}
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        onClick={() => {
                          if (source.id) {
                            setEditingSourceId(source.id);
                            setEditingSource({ ...source });
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
                      {sources.length > 1 && source.id && (
                        <Button
                          onClick={() => {
                            if (source.id) {
                              handleDeleteSource(source.id);
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
                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              />
                            </svg>
                          }
                          iconOnly
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Agregar Nueva Fuente */}
        <div className='mb-6 p-4 border border-zinc-200 rounded-lg bg-zinc-50'>
          <h4 className='text-md font-semibold mb-3 text-primary-dark'>
            Agregar Nueva Fuente
          </h4>
          <div className='space-y-3'>
            <input
              type='text'
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              className='w-full px-3 py-2 border border-zinc-200 rounded-lg'
              placeholder='Nombre de la fuente (ej: Efectivo, Banco, etc.)'
              aria-label='Nombre de la nueva fuente'
            />
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Valor Esperado *
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={newSourceExpected}
                  onChange={(e) => setNewSourceExpected(e.target.value)}
                  className='w-full px-3 py-2 border border-zinc-200 rounded-lg'
                  placeholder='0.00'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Valor Real
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={newSourceReal}
                  onChange={(e) => setNewSourceReal(e.target.value)}
                  className='w-full px-3 py-2 border border-zinc-200 rounded-lg'
                  placeholder='Opcional'
                />
              </div>
            </div>
            <Button
              onClick={handleAddSource}
              variant='secondary'
              size='md'
              disabled={!newSourceName || !newSourceExpected}
            >
              Agregar Fuente
            </Button>
          </div>
        </div>

        <div className='flex gap-3'>
          <Button
            type='button'
            onClick={onClose}
            variant='outline'
            size='md'
            className='flex-1'
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyMonth;
