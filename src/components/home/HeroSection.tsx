"use client";

import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Control financiero inteligente
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Toma el control de{" "}
              <span className="text-gradient">tu dinero</span>{" "}
              mes a mes
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Registra ingresos, gastos y ahorros. Mantén un balance actualizado de tu liquidez y alcanza tus metas financieras.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/my-month">
                <Button variant="hero" size="xl">
                  Comenzar ahora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/config-my-money">
                <Button variant="outline" size="xl">
                  Configurar
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div>
                <p className="text-3xl font-bold text-gradient">100%</p>
                <p className="text-sm text-muted-foreground">Control total</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gradient-gold">24/7</p>
                <p className="text-sm text-muted-foreground">Acceso</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gradient">∞</p>
                <p className="text-sm text-muted-foreground">Transacciones</p>
              </div>
            </div>
          </div>

          {/* Visual Card */}
          <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              {/* Main Card */}
              <div className="glass-card rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance disponible</p>
                    <p className="text-4xl font-bold text-foreground">$4,250,000</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <TrendingUp className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-income/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-income/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-income" />
                      </div>
                      <div>
                        <p className="font-medium">Ingresos</p>
                        <p className="text-sm text-muted-foreground">Este mes</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-income">+$5,500,000</p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-expense/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-expense/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-expense rotate-180" />
                      </div>
                      <div>
                        <p className="font-medium">Gastos</p>
                        <p className="text-sm text-muted-foreground">Este mes</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-expense">-$1,250,000</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 glass-card rounded-2xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Seguro</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 glass-card rounded-2xl p-4 shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                    <span className="text-xs font-bold text-secondary-foreground">+12%</span>
                  </div>
                  <span className="text-sm font-medium">Ahorro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


