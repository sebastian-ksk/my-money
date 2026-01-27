'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import firebaseApp from 'firebase/app';
import LiquidityModal from '@/features/my-month/widgets/liquidity-modal/liquidity-modal';
import ExpenseModal from '@/features/my-month/widgets/expense-modal/expense-modal';
import IncomeModal from '@/features/my-month/widgets/income-modal/income-modal';
import SavingsModal from '@/features/my-month/widgets/savings-modal/savings-modal';
import { type TransactionFilter } from '@/features/my-month/widgets/transaction-filters';
import { TransactionsTable } from '@/features/my-month/widgets/transactions-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calculator,
  Calendar,
  Filter,
  CreditCard,
  DollarSign,
  PiggyBank,
  Pencil,
} from 'lucide-react';
import { BalanceCard } from '@/components/my-month';
import { AppOnboarding, type OnboardingModalCallbacks } from '@/components/onboarding';
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
} from '@/Redux/features/my-month/my-month-thunks';
import { deleteSavingsTransaction } from '@/Redux/features/my-month/savings-thunks';
import {
  loadMonthlyLiquidityNew,
  updateMonthlyBalances,
} from '@/Redux/features/my-month/monthly-liquidity-thunks';
import { selectEffectiveInitialLiquidity } from '@/Redux/features/initial-liquidity';
import {
  loadInitialLiquidity,
  saveInitialLiquidity,
  clearInitialLiquidity,
} from '@/Redux/features/initial-liquidity/initial-liquidity-thunks';
import {
  calculateMonthPeriod,
  getCurrentDisplayMonth,
} from '@/services/Firebase/my-month-service';
import type { Transaction } from '@/Redux/features/my-month/my-month-models';
import { useConfirm } from '@/components/confirm-modal';

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
  const initialLiquidityData = useAppSelector(selectEffectiveInitialLiquidity);
  const confirm = useConfirm();

  const [showLiquidityModal, setShowLiquidityModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('all');

  // Calcular el periodo del mes basado en la fecha de corte
  const monthResetDay = userConfig?.monthResetDay || 1;
  const currentPeriod = calculateMonthPeriod(
    new Date(selectedYear, selectedMonth, 15),
    monthResetDay
  );

  // Usar la liquidez inicial del nuevo sistema Redux
  // Si hay registro guardado o calculado, usar ese valor
  const displayLiquidity = initialLiquidityData.amount;

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
            updateMonthlyBalances({
              userId: user.uid,
              monthPeriod: currentPeriod,
            })
          );
        })
        .catch((error: unknown) => {
          console.error('Error al cargar transacciones:', error);
        });

      dispatch(
        loadMonthlyLiquidityNew({
          userId: user.uid,
          monthPeriod: currentPeriod,
          dayOfMonth: userConfig.monthResetDay,
        })
      ).catch((error: unknown) => {
        console.error('Error al cargar estado de liquidez:', error);
      });

      // Cargar liquidez inicial del mes (nueva API)
      dispatch(
        loadInitialLiquidity({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).catch((error: unknown) => {
        console.error('Error al cargar liquidez inicial:', error);
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

  const handleDeleteTransaction = async (transactionId: string, transactionType?: string) => {
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
      // Si es una transacción de ahorro, usar el thunk específico
      // que también actualiza savings_sources
      if (transactionType === 'savings') {
        await dispatch(deleteSavingsTransaction(transactionId)).unwrap();
      } else {
        await dispatch(deleteTransaction(transactionId)).unwrap();
      }
      
      await dispatch(
        loadTransactions({
          userId: user.uid,
          monthPeriod: currentPeriod,
        })
      ).unwrap();
      // Actualizar balances después de eliminar
      if (userConfig) {
        await dispatch(
          updateMonthlyBalances({
            userId: user.uid,
            monthPeriod: currentPeriod,
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

  // Calcular ahorros totales: suma de savings
  const totalSavings = mappedTransactions
    .filter((t) => t.type === 'savings')
    .reduce((sum, t) => sum + (t.value ?? 0), 0);

  // Calcular balance final: lo que tenía + ingresos - gastos - ahorros
  const finalBalance = displayLiquidity + totalIncomes - totalExpenses - totalSavings;

  const currency = userConfig?.currency || 'COP';

  // Preparar transacciones para el widget (agregar campos faltantes)
  const allTransactionsForWidget = allTransactions.map((t) => ({
    ...t,
    userId: user?.uid || '',
    monthPeriod: currentPeriod,
  }));

  // Nombre del mes para mostrar
  const monthNames = [
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
  const displayMonthName = monthNames[selectedMonth];

  // Callbacks para el onboarding - abrir/cerrar modales durante el tour
  const closeAllModals = useCallback(() => {
    setShowLiquidityModal(false);
    setShowExpenseModal(false);
    setShowIncomeModal(false);
    setShowSavingsModal(false);
    setEditingTransaction(null);
  }, []);

  const onboardingModalCallbacks: OnboardingModalCallbacks = useMemo(() => ({
    onOpenLiquidityModal: () => setShowLiquidityModal(true),
    onOpenExpenseModal: () => {
      setEditingTransaction(null);
      setShowExpenseModal(true);
    },
    onOpenIncomeModal: () => {
      setEditingTransaction(null);
      setShowIncomeModal(true);
    },
    onOpenSavingsModal: () => {
      setEditingTransaction(null);
      setShowSavingsModal(true);
    },
    onCloseAllModals: closeAllModals,
  }), [closeAllModals]);

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Onboarding Tour */}
      <AppOnboarding page='my-month' modalCallbacks={onboardingModalCallbacks} />

      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Mi Mes</h1>
          <div className='flex items-center gap-2 text-muted-foreground mt-1'>
            <Calendar className='w-4 h-4' />
            <span>
              {displayMonthName} {selectedYear}
            </span>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            data-tour='add-expense-btn'
            onClick={() => {
              if (user?.uid && fixedExpenses.length === 0) {
                dispatch(loadFixedExpenses(user.uid));
              }
              setEditingTransaction(null);
              setShowExpenseModal(true);
            }}
          >
            <CreditCard className='w-4 h-4 mr-2' />
            <span className='hidden sm:inline'>Agregar</span> Gasto
          </Button>
          <Button
            variant='outline'
            data-tour='add-income-btn'
            onClick={() => handleOpenIncomeModal()}
          >
            <DollarSign className='w-4 h-4 mr-2' />
            <span className='hidden sm:inline'>Agregar</span> Ingreso
          </Button>
          <Button
            variant='outline'
            data-tour='add-savings-btn'
            onClick={() => handleOpenSavingsModal()}
          >
            <PiggyBank className='w-4 h-4 mr-2' />
            <span className='hidden sm:inline'>Agregar</span> Ahorro
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
        <div className='relative' data-tour='liquidity-card'>
          <BalanceCard
            title='Liquidez Inicial'
            amount={displayLiquidity}
            icon={<Wallet className='w-5 h-5 text-foreground' />}
            subtitle='Inicio del período'
          />
          <button
            onClick={() => setShowLiquidityModal(true)}
            className='absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted/50 transition-colors'
            title='Editar liquidez'
          >
            <Pencil className='w-4 h-4 text-muted-foreground' />
          </button>
        </div>
        <div data-tour='income-card'>
          <BalanceCard
            title='Total Ingresos'
            amount={totalIncomes}
            icon={<TrendingUp className='w-5 h-5 text-income' />}
            variant='income'
            subtitle={`${
              mappedTransactions.filter(
                (t) =>
                  t.type === 'expected_income' || t.type === 'unexpected_income'
              ).length
            } transacciones`}
          />
        </div>
        <div data-tour='expense-card'>
          <BalanceCard
            title='Total Gastos'
            amount={totalExpenses}
            icon={<TrendingDown className='w-5 h-5 text-expense' />}
            variant='expense'
            subtitle={`${
              mappedTransactions.filter(
                (t) =>
                  t.type === 'fixed_expense' || t.type === 'regular_expense'
              ).length
            } transacciones`}
          />
        </div>
        <div data-tour='savings-card'>
          <BalanceCard
            title='Total Ahorros'
            amount={totalSavings}
            icon={<PiggyBank className='w-5 h-5 text-purple-600' />}
            variant='savings'
            subtitle={`${
              mappedTransactions.filter((t) => t.type === 'savings').length
            } transacciones`}
          />
        </div>
        <div data-tour='balance-card'>
          <BalanceCard
            title='Balance Final'
            amount={finalBalance}
            icon={<Calculator className='w-5 h-5 text-primary-foreground' />}
            variant='balance'
            subtitle='Disponible'
          />
        </div>
      </div>

      {/* Transactions */}
      <div
        className='glass-card rounded-2xl p-6'
        data-tour='transactions-section'
      >
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <h2 className='text-xl font-semibold'>Transacciones</h2>
          <div className='flex items-center gap-2'>
            <Filter className='w-4 h-4 text-muted-foreground' />
            <Select
              value={activeFilter}
              onValueChange={(value) =>
                setActiveFilter(value as TransactionFilter)
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filtrar por tipo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas</SelectItem>
                <SelectItem value='fixed_expense'>Gastos Fijos</SelectItem>
                <SelectItem value='regular_expense'>
                  Gastos Variables
                </SelectItem>
                <SelectItem value='expected_income'>
                  Ingresos Esperados
                </SelectItem>
                <SelectItem value='unexpected_income'>
                  Ingresos Extra
                </SelectItem>
                <SelectItem value='savings'>Ahorros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TransactionsTable
          transactions={allTransactionsForWidget}
          loading={loading}
          currency={currency}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          activeFilter={activeFilter}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Modales */}
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
                updateMonthlyBalances({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
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
                updateMonthlyBalances({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
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
          initialLiquidityAmount={displayLiquidity}
          calculatedAmount={initialLiquidityData.calculatedAmount}
          wasCalculated={initialLiquidityData.wasCalculated}
          onClose={() => setShowLiquidityModal(false)}
          onSave={async (amount?: number) => {
            // Guardar liquidez inicial usando la nueva API
            if (user?.uid && amount !== undefined) {
              await dispatch(
                saveInitialLiquidity({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
                  amount,
                })
              ).unwrap();
            }
            // Recargar liquidez inicial
            await dispatch(
              loadInitialLiquidity({
                userId: user?.uid || '',
                monthPeriod: currentPeriod,
              })
            ).unwrap();
            // Actualizar balances después de guardar
            if (user?.uid && userConfig) {
              await dispatch(
                updateMonthlyBalances({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
                })
              ).unwrap();
            }
            setShowLiquidityModal(false);
          }}
          onDelete={async () => {
            // Limpiar realAmount (volver a usar calculado)
            if (user?.uid) {
              await dispatch(
                clearInitialLiquidity({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
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
                updateMonthlyBalances({
                  userId: user.uid,
                  monthPeriod: currentPeriod,
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
