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
  loadMonthlyLiquidity,
  updateMonthlyLiquidity,
} from '@/Redux/features/my-month/my-month-thunks';
import { calculateMonthPeriod } from '@/services/Firebase/my-month-service';
import { formatCurrency } from '@/utils/currency';

type ModalType =
  | 'fixedExpense'
  | 'income'
  | 'regularExpense'
  | 'liquidity'
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

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showModal, setShowModal] = useState<ModalType>(null);
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
  const [liquidityFormData, setLiquidityFormData] = useState({
    realAmount: '',
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

  // Calcular balance: líquido inicial + ingresos reales - gastos (fijos + eventuales)
  const totalLiquid =
    monthlyLiquidity?.realAmount ?? monthlyLiquidity?.expectedAmount ?? 0;
  const totalExpenses = totalFixedPayments + totalRegularExpenses;
  const balance = totalLiquid + totalIncomes - totalExpenses;

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
  };

  const handleOpenLiquidityModal = () => {
    setShowModal('liquidity');
    setLiquidityFormData({
      realAmount:
        monthlyLiquidity?.realAmount?.toString() ||
        monthlyLiquidity?.expectedAmount?.toString() ||
        '',
    });
  };

  const handleSubmitLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !liquidityFormData.realAmount) return;

    try {
      await dispatch(
        updateMonthlyLiquidity({
          userId: user.uid,
          monthPeriod: currentPeriod,
          realAmount: parseFloat(liquidityFormData.realAmount),
        })
      ).unwrap();

      setShowModal(null);
      setLiquidityFormData({ realAmount: '' });
    } catch (error) {
      console.error('Error al actualizar liquidez:', error);
    }
  };

  const handleUseExpectedAmount = () => {
    if (monthlyLiquidity?.expectedAmount) {
      setLiquidityFormData({
        realAmount: monthlyLiquidity.expectedAmount.toString(),
      });
    }
  };

  const handleOpenFixedExpenseModal = () => {
    // Asegurar que los gastos fijos estén cargados
    if (user?.uid && fixedExpenses.length === 0) {
      dispatch(loadFixedExpenses(user.uid));
    }
    setShowModal('fixedExpense');
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
  };

  const handleOpenIncomeModal = () => {
    // Asegurar que los ingresos esperados estén cargados
    if (user?.uid && expectedIncomes.length === 0) {
      dispatch(loadExpectedIncomes(user.uid));
    }
    setShowModal('income');
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
  };

  const handleOpenRegularExpenseModal = () => {
    setShowModal('regularExpense');
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
  };

  const handleOpenSavingsModal = () => {
    if (user?.uid && savingsSources.length === 0) {
      dispatch(loadSavingsSources(user.uid));
    }
    setShowModal('savings');
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
    console.log('handleSubmitFixedExpense ejecutado');
    if (!user?.uid || !formData.fixedExpenseId) {
      console.log('Validación fallida:', {
        uid: user?.uid,
        fixedExpenseId: formData.fixedExpenseId,
      });
      return;
    }

    const fixedExpense = fixedExpenses.find(
      (fe) => fe.id === formData.fixedExpenseId
    );
    if (!fixedExpense) {
      console.log('Gasto fijo no encontrado');
      return;
    }

    try {
      console.log('Dispatching createTransaction...');
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

      // Recargar transacciones después de crear
      await dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).unwrap();

      setShowModal(null);
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
    console.log('handleSubmitIncome ejecutado');
    if (!user?.uid) {
      console.log('Usuario no disponible');
      return;
    }

    // Si hay expectedIncomeId, es un ingreso esperado
    if (formData.expectedIncomeId) {
      const expectedIncome = expectedIncomes.find(
        (ei) => ei.id === formData.expectedIncomeId
      );
      if (!expectedIncome) return;

      try {
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

        // Recargar transacciones después de crear
        await dispatch(
          loadTransactions({
            userId: user.uid,
            monthPeriod: currentPeriod,
          })
        ).unwrap();

        setShowModal(null);
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
        console.error('Error al guardar ingreso esperado:', error);
      }
    } else {
      // Es un ingreso inesperado
      if (!formData.concept) return;

      try {
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

        // Recargar transacciones después de crear
        await dispatch(
          loadTransactions({
            userId: user.uid,
            monthPeriod: currentPeriod,
          })
        ).unwrap();

        setShowModal(null);
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
    console.log('handleSubmitRegularExpense ejecutado');
    if (!user?.uid || !formData.concept) {
      console.log('Validación fallida:', {
        uid: user?.uid,
        concept: formData.concept,
      });
      return;
    }

    try {
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

      // Recargar transacciones después de crear
      await dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).unwrap();

      setShowModal(null);
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
              amount: 0, // Se actualizará con las transacciones
            },
          })
        ).unwrap();

        if (!newSource.id) {
          alert('Error al crear fuente de ahorro: no se obtuvo ID');
          return;
        }
        savingsSourceId = newSource.id;
        // Recargar savings sources
        await dispatch(loadSavingsSources(user.uid));
      } catch (error) {
        console.error('Error al crear fuente de ahorro:', error);
        return;
      }
    }

    if (!savingsSourceId) {
      alert('Debe seleccionar o crear una fuente de ahorro');
      return;
    }

    const savingsSource = savingsSources.find(
      (ss) => ss.id === savingsSourceId
    );
    if (!savingsSource) {
      alert('Fuente de ahorro no encontrada');
      return;
    }

    try {
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

      // Recargar transacciones después de crear
      await dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).unwrap();

      setShowModal(null);
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
            <div className='flex items-center gap-3 text-sm'>
              <div className='text-zinc-600'>
                <span className='font-medium'>Líquido Inicial Esperado:</span>{' '}
                {formatCurrency(
                  monthlyLiquidity?.expectedAmount ?? 0,
                  currency
                )}
              </div>
              <div className='text-zinc-600'>
                <span className='font-medium'>Líquido Inicial Real:</span>{' '}
                {monthlyLiquidity?.realAmount !== null &&
                monthlyLiquidity?.realAmount !== undefined
                  ? formatCurrency(monthlyLiquidity.realAmount, currency)
                  : 'No establecido'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-3 mb-6'>
            <Button
              onClick={handleOpenFixedExpenseModal}
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
              onClick={handleOpenIncomeModal}
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
              onClick={handleOpenRegularExpenseModal}
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
              onClick={handleOpenLiquidityModal}
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
              {monthlyLiquidity?.realAmount !== null
                ? 'Editar Liquidez'
                : 'Establecer Liquidez'}
            </Button>
          </div>

          {/* Transactions Table */}
          <div className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-primary-dark'>
                Transacciones del Mes
              </h3>
              <Button
                onClick={handleOpenSavingsModal}
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
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className='py-12 text-center text-zinc-600'
                        >
                          No hay transacciones registradas en{' '}
                          {months[selectedMonth]} {selectedYear}
                        </td>
                      </tr>
                    ) : (
                      allTransactions.map((transaction) => (
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
                        </tr>
                      ))
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
              Agregar Pago Fijo
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
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
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

      {/* Modal para Estado de Liquidez */}
      {showModal === 'liquidity' && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-2xl font-bold mb-4 text-primary-dark'>
              Estado Inicial de Liquidez
            </h3>
            <form onSubmit={handleSubmitLiquidity}>
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Valor Esperado (del mes anterior)
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={monthlyLiquidity?.expectedAmount ?? 0}
                  readOnly
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-100 text-zinc-600'
                />
                <p className='text-xs text-zinc-500 mt-1'>
                  Este es el balance final del mes anterior
                </p>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Valor Real *
                </label>
                <input
                  type='number'
                  step='0.01'
                  required
                  value={liquidityFormData.realAmount}
                  onChange={(e) =>
                    setLiquidityFormData({
                      ...liquidityFormData,
                      realAmount: e.target.value,
                    })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='0.00'
                />
                <p className='text-xs text-zinc-500 mt-1'>
                  Establece el valor real de tu liquidez inicial
                </p>
              </div>

              <div className='mb-6'>
                <Button
                  type='button'
                  onClick={handleUseExpectedAmount}
                  variant='outline'
                  size='sm'
                  className='w-full'
                >
                  Usar Valor Esperado
                </Button>
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
                  disabled={!liquidityFormData.realAmount}
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
    </div>
  );
};

export default MyMonth;
