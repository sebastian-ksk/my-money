"use client";

import { TrendingUp, TrendingDown, PiggyBank, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAddTransaction: (type: string) => void;
}

const actions = [
  { type: "fixed_expense", label: "Gasto Fijo", icon: TrendingDown, variant: "expense" as const },
  { type: "regular_expense", label: "Gasto Variable", icon: TrendingDown, variant: "expense" as const },
  { type: "expected_income", label: "Ingreso", icon: TrendingUp, variant: "income" as const },
  { type: "unexpected_income", label: "Ingreso Extra", icon: Gift, variant: "gold" as const },
  { type: "savings", label: "Ahorro", icon: PiggyBank, variant: "savings" as const },
];

export function QuickActions({ onAddTransaction }: QuickActionsProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.type}
              variant={action.variant}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => onAddTransaction(action.type)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}


