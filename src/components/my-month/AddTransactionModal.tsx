"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, PiggyBank, Gift, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
  onSubmit: (transaction: {
    type: string;
    description: string;
    amount: number;
    date: string;
    category?: string;
  }) => void;
}

const transactionTypes = [
  { value: "fixed_expense", label: "Gasto Fijo", icon: CreditCard, color: "text-expense" },
  { value: "regular_expense", label: "Gasto Variable", icon: TrendingDown, color: "text-expense" },
  { value: "expected_income", label: "Ingreso Esperado", icon: TrendingUp, color: "text-income" },
  { value: "unexpected_income", label: "Ingreso Extra", icon: Gift, color: "text-secondary" },
  { value: "savings", label: "Ahorro", icon: PiggyBank, color: "text-savings" },
];

const categories = [
  "Alimentación",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Hogar",
  "Servicios",
  "Otros",
];

export function AddTransactionModal({ isOpen, onClose, initialType = "regular_expense", onSubmit }: AddTransactionModalProps) {
  const [type, setType] = useState(initialType);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      description,
      amount: parseFloat(amount),
      date,
      category: category || undefined,
    });
    // Reset form
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategory("");
    onClose();
  };

  const selectedType = transactionTypes.find(t => t.value === type);
  const isExpense = type.includes("expense") || type === "savings";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {selectedType && (
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                isExpense ? "bg-expense/10" : "bg-income/10"
              )}>
                <selectedType.icon className={cn("w-5 h-5", selectedType.color)} />
              </div>
            )}
            Nueva Transacción
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Tipo de Transacción</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-4 h-4", t.color)} />
                        {t.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Ej: Pago de servicios públicos"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          {(type === "regular_expense" || type === "fixed_expense") && (
            <div className="space-y-2">
              <Label>Categoría (opcional)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={isExpense ? "expense" : "income"}
              className="flex-1"
            >
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


