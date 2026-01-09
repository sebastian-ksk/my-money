"use client";

import { useState } from "react";
import { Settings, PiggyBank, CreditCard, TrendingUp, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface ConfigItem {
  id: string;
  name: string;
  amount?: number;
  day?: number;
}

const currencies = ["COP", "USD", "EUR", "MXN"];
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export function ConfigTabs() {
  const [cutoffDay, setCutoffDay] = useState("15");
  const [currency, setCurrency] = useState("COP");
  
  const [savingsSources, setSavingsSources] = useState<ConfigItem[]>([
    { id: "1", name: "Cuenta de Ahorros", amount: 5000000 },
    { id: "2", name: "Fondo de Emergencia", amount: 2000000 },
  ]);
  
  const [fixedExpenses, setFixedExpenses] = useState<ConfigItem[]>([
    { id: "1", name: "Arriendo", amount: 1500000, day: 5 },
    { id: "2", name: "Netflix", amount: 45000, day: 1 },
    { id: "3", name: "Servicios Públicos", amount: 350000, day: 10 },
  ]);
  
  const [expectedIncomes, setExpectedIncomes] = useState<ConfigItem[]>([
    { id: "1", name: "Salario", amount: 5000000, day: 15 },
    { id: "2", name: "Bonificación", amount: 500000, day: 30 },
  ]);

  const ConfigItemRow = ({ item, onDelete, showDay = false }: { item: ConfigItem; onDelete: (id: string) => void; showDay?: boolean }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 group hover:bg-muted transition-colors">
      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {item.amount && <span>{formatCurrency(item.amount, currency)}</span>}
          {showDay && item.day && (
            <>
              <span>•</span>
              <span>Día {item.day}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon">
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 gap-1">
        <TabsTrigger value="general" className="gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">General</span>
        </TabsTrigger>
        <TabsTrigger value="savings" className="gap-2 py-3 data-[state=active]:bg-savings data-[state=active]:text-savings-foreground">
          <PiggyBank className="w-4 h-4" />
          <span className="hidden sm:inline">Ahorros</span>
        </TabsTrigger>
        <TabsTrigger value="expenses" className="gap-2 py-3 data-[state=active]:bg-expense data-[state=active]:text-expense-foreground">
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Gastos Fijos</span>
        </TabsTrigger>
        <TabsTrigger value="income" className="gap-2 py-3 data-[state=active]:bg-income data-[state=active]:text-income-foreground">
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Ingresos</span>
        </TabsTrigger>
      </TabsList>

      {/* General Config */}
      <TabsContent value="general" className="mt-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Configuración General</h3>
            <p className="text-muted-foreground mb-6">Define los parámetros base de tu economía personal.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cutoff">Día de Corte Mensual</Label>
              <Select value={cutoffDay} onValueChange={setCutoffDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day.toString()}>Día {day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">El día en que inicia tu período mensual</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Moneda para mostrar los valores</p>
            </div>
          </div>

          <Button variant="hero" className="mt-4">
            Guardar Cambios
          </Button>
        </div>
      </TabsContent>

      {/* Savings Sources */}
      <TabsContent value="savings" className="mt-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Fuentes de Ahorro</h3>
              <p className="text-muted-foreground">Registra las cuentas donde guardas tus ahorros.</p>
            </div>
            <Button variant="savings">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>

          <div className="space-y-3">
            {savingsSources.map((source) => (
              <ConfigItemRow 
                key={source.id} 
                item={source} 
                onDelete={(id) => setSavingsSources(s => s.filter(i => i.id !== id))} 
              />
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Fixed Expenses */}
      <TabsContent value="expenses" className="mt-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Gastos Fijos</h3>
              <p className="text-muted-foreground">Gastos recurrentes mensuales como servicios y suscripciones.</p>
            </div>
            <Button variant="expense">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>

          <div className="space-y-3">
            {fixedExpenses.map((expense) => (
              <ConfigItemRow 
                key={expense.id} 
                item={expense} 
                showDay
                onDelete={(id) => setFixedExpenses(e => e.filter(i => i.id !== id))} 
              />
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Expected Income */}
      <TabsContent value="income" className="mt-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ingresos Esperados</h3>
              <p className="text-muted-foreground">Salarios y otros ingresos que esperas recibir regularmente.</p>
            </div>
            <Button variant="income">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>

          <div className="space-y-3">
            {expectedIncomes.map((income) => (
              <ConfigItemRow 
                key={income.id} 
                item={income} 
                showDay
                onDelete={(id) => setExpectedIncomes(i => i.filter(item => item.id !== id))} 
              />
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}


