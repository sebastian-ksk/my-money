'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { BalanceCard, TransactionItem, QuickActions, AddTransactionModal, TransactionType } from '@/components/my-month';
import { Wallet, TrendingUp, TrendingDown, Calculator, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  category?: string;
}

const initialTransactions: Transaction[] = [
  { id: '1', type: 'expected_income', description: 'Salario Mensual', amount: 5000000, date: '15 Ene' },
  { id: '2', type: 'fixed_expense', description: 'Arriendo Apartamento', amount: 1500000, date: '05 Ene', category: 'Vivienda' },
  { id: '3', type: 'fixed_expense', description: 'Netflix', amount: 45000, date: '01 Ene', category: 'Entretenimiento' },
  { id: '4', type: 'regular_expense', description: 'Mercado Semanal', amount: 350000, date: '08 Ene', category: 'Alimentación' },
  { id: '5', type: 'savings', description: 'Transferencia a CDT', amount: 500000, date: '16 Ene' },
  { id: '6', type: 'unexpected_income', description: 'Freelance Diseño Web', amount: 800000, date: '20 Ene' },
  { id: '7', type: 'regular_expense', description: 'Gasolina', amount: 180000, date: '22 Ene', category: 'Transporte' },
];

export default function MyMonthPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('regular_expense');
  const [filterType, setFilterType] = useState('all');

  const handleAddTransaction = (type: string) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSubmitTransaction = (transaction: {
    type: string;
    description: string;
    amount: number;
    date: string;
    category?: string;
  }) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transaction.type as TransactionType,
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      category: transaction.category,
    };
    setTransactions([newTransaction, ...transactions]);
  };

  // Calculate totals
  const initialLiquidity = 2000000;
  const totalIncome = transactions
    .filter(t => t.type === 'expected_income' || t.type === 'unexpected_income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'fixed_expense' || t.type === 'regular_expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = transactions
    .filter(t => t.type === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = initialLiquidity + totalIncome - totalExpenses - totalSavings;

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mi Mes</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Calendar className="w-4 h-4" />
              <span>15 Ene - 14 Feb, 2024</span>
            </div>
          </div>
          <Button variant="hero" onClick={() => handleAddTransaction('regular_expense')}>
            Nueva Transacción
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <BalanceCard
            title="Liquidez Inicial"
            amount={initialLiquidity}
            icon={<Wallet className="w-5 h-5 text-foreground" />}
            subtitle="Inicio del período"
          />
          <BalanceCard
            title="Total Ingresos"
            amount={totalIncome}
            icon={<TrendingUp className="w-5 h-5 text-income" />}
            variant="income"
            subtitle={`${transactions.filter(t => t.type.includes('income')).length} transacciones`}
          />
          <BalanceCard
            title="Total Gastos"
            amount={totalExpenses}
            icon={<TrendingDown className="w-5 h-5 text-expense" />}
            variant="expense"
            subtitle={`${transactions.filter(t => t.type.includes('expense')).length} transacciones`}
          />
          <BalanceCard
            title="Balance Final"
            amount={balance}
            icon={<Calculator className="w-5 h-5 text-primary-foreground" />}
            variant="balance"
            subtitle="Disponible"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions onAddTransaction={handleAddTransaction} />
        </div>

        {/* Transactions */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">Transacciones</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="fixed_expense">Gastos Fijos</SelectItem>
                  <SelectItem value="regular_expense">Gastos Variables</SelectItem>
                  <SelectItem value="expected_income">Ingresos Esperados</SelectItem>
                  <SelectItem value="unexpected_income">Ingresos Extra</SelectItem>
                  <SelectItem value="savings">Ahorros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                type={transaction.type}
                description={transaction.description}
                amount={transaction.amount}
                date={transaction.date}
                category={transaction.category}
              />
            ))}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay transacciones para mostrar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalType}
        onSubmit={handleSubmitTransaction}
      />
    </AppLayout>
  );
}
