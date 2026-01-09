"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  title: string;
  amount: number;
  icon: ReactNode;
  variant?: "default" | "income" | "expense" | "savings" | "balance";
  subtitle?: string;
}

export function BalanceCard({ title, amount, icon, variant = "default", subtitle }: BalanceCardProps) {
  const variants = {
    default: "glass-card",
    income: "bg-income/10 border-income/20",
    expense: "bg-expense/10 border-expense/20",
    savings: "bg-savings/10 border-savings/20",
    balance: "gradient-primary text-primary-foreground",
  };

  const textColors = {
    default: "text-foreground",
    income: "text-income",
    expense: "text-expense",
    savings: "text-savings",
    balance: "text-primary-foreground",
  };

  const subtitleColors = {
    default: "text-muted-foreground",
    income: "text-income/70",
    expense: "text-expense/70",
    savings: "text-savings/70",
    balance: "text-primary-foreground/80",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className={cn("text-sm font-medium", subtitleColors[variant])}>{title}</p>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            variant === "balance" ? "bg-primary-foreground/20" : "bg-background"
          )}
        >
          {icon}
        </div>
      </div>
      <p className={cn("text-3xl font-bold", textColors[variant])}>
        {formatCurrency(amount)}
      </p>
      {subtitle && (
        <p className={cn("text-sm mt-2", subtitleColors[variant])}>{subtitle}</p>
      )}
    </div>
  );
}


