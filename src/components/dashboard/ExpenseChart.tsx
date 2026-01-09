"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

const data = [
  { name: "Vivienda", value: 1500000, color: "hsl(160, 84%, 39%)" },
  { name: "Alimentación", value: 800000, color: "hsl(43, 96%, 56%)" },
  { name: "Transporte", value: 400000, color: "hsl(217, 91%, 60%)" },
  { name: "Entretenimiento", value: 250000, color: "hsl(280, 70%, 60%)" },
  { name: "Servicios", value: 350000, color: "hsl(340, 80%, 55%)" },
  { name: "Otros", value: 200000, color: "hsl(200, 50%, 50%)" },
];

export function ExpenseChart() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-6">Distribución de Gastos</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                padding: "0.75rem",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

