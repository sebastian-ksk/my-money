"use client";

import { TrendingUp, TrendingDown, PiggyBank, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  amount: number;
  change?: number;
  icon: React.ElementType;
  variant?: "default" | "income" | "expense" | "savings";
}

function StatCard({ title, amount, change, icon: Icon, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "glass-card",
    income: "bg-income/10 border-income/20",
    expense: "bg-expense/10 border-expense/20",
    savings: "bg-savings/10 border-savings/20",
  };

  const iconColors = {
    default: "text-primary bg-primary/10",
    income: "text-income bg-income/20",
    expense: "text-expense bg-expense/20",
    savings: "text-savings bg-savings/20",
  };

  return (
    <div className={cn(
      "rounded-2xl p-6 border transition-all hover:shadow-lg",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconColors[variant])}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            change >= 0 ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
          )}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}

export function StatsCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Balance Total"
        amount={4250000}
        change={12}
        icon={Wallet}
        variant="default"
      />
      <StatCard
        title="Ingresos del Mes"
        amount={5500000}
        change={8}
        icon={TrendingUp}
        variant="income"
      />
      <StatCard
        title="Gastos del Mes"
        amount={1250000}
        change={-5}
        icon={TrendingDown}
        variant="expense"
      />
      <StatCard
        title="Total Ahorrado"
        amount={7000000}
        change={15}
        icon={PiggyBank}
        variant="savings"
      />
    </div>
  );
}


