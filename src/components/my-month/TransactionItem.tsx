"use client";

import { TrendingUp, TrendingDown, PiggyBank, CreditCard, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

export type TransactionType = 
  | "fixed_expense" 
  | "regular_expense" 
  | "expected_income" 
  | "unexpected_income" 
  | "savings";

interface TransactionItemProps {
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  category?: string;
}

const transactionConfig = {
  fixed_expense: {
    icon: CreditCard,
    label: "Gasto Fijo",
    bgColor: "bg-expense/10",
    iconColor: "text-expense",
    amountColor: "text-expense",
    sign: "-",
  },
  regular_expense: {
    icon: TrendingDown,
    label: "Gasto Variable",
    bgColor: "bg-expense/10",
    iconColor: "text-expense",
    amountColor: "text-expense",
    sign: "-",
  },
  expected_income: {
    icon: TrendingUp,
    label: "Ingreso Esperado",
    bgColor: "bg-income/10",
    iconColor: "text-income",
    amountColor: "text-income",
    sign: "+",
  },
  unexpected_income: {
    icon: Gift,
    label: "Ingreso Extra",
    bgColor: "bg-secondary/20",
    iconColor: "text-secondary",
    amountColor: "text-secondary",
    sign: "+",
  },
  savings: {
    icon: PiggyBank,
    label: "Ahorro",
    bgColor: "bg-savings/10",
    iconColor: "text-savings",
    amountColor: "text-savings",
    sign: "-",
  },
};

export function TransactionItem({ type, description, amount, date, category }: TransactionItemProps) {
  const config = transactionConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors group">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bgColor)}>
        <Icon className={cn("w-5 h-5", config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{config.label}</span>
          {category && (
            <>
              <span>•</span>
              <span>{category}</span>
            </>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className={cn("font-bold", config.amountColor)}>
          {config.sign}{formatCurrency(Math.abs(amount))}
        </p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}


