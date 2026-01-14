'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, PiggyBank, CreditCard, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import UserConfigSection from '../Widgets/user-config-section/user-config-section';
import SavingsBalanceSection from '../Widgets/savings-balance-section/savings-balance-section';
import FixedExpensesSection from '../Widgets/fixed-expenses-section/fixed-expenses-section';
import ExpectedIncomesSection from '../Widgets/expected-incomes-section/expected-incomes-section';
import { AppOnboarding } from '@/components/onboarding';
import { useAppSelector, useAppDispatch } from '@/Redux/store/hooks';
import { selectUser, selectOnboardingCompleted, setOnboardingCompleted } from '@/Redux/features/auth';
import { userService } from '@/services/Firebase/fireabase-user-service';

const ConfigMyMoney = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const onboardingCompleted = useAppSelector(selectOnboardingCompleted);
  const [isSaving, setIsSaving] = useState(false);

  const handleCompleteOnboarding = async () => {
    if (!user?.uid) return;
    
    setIsSaving(true);
    try {
      await userService.setOnboardingCompleted(user.uid, true);
      dispatch(setOnboardingCompleted(true));
      router.push('/my-month');
    } catch (error) {
      console.error('Error al completar configuración:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Onboarding Tour */}
      <AppOnboarding page='config' />

      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow'>
              <Settings className='w-6 h-6 text-primary-foreground' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Configuración</h1>
              <p className='text-muted-foreground'>
                Personaliza tu economía personal
              </p>
            </div>
          </div>
          
          {/* Botón completar configuración - solo si no ha completado onboarding */}
          {!onboardingCompleted && (
            <Button
              onClick={handleCompleteOnboarding}
              variant='hero'
              disabled={isSaving}
              className='gap-2'
            >
              {isSaving ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <>
                  <CheckCircle className='w-5 h-5' />
                  Completar y comenzar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='general' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 gap-1'>
          <TabsTrigger
            value='general'
            className='gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
          >
            <Settings className='w-4 h-4' />
            <span className='hidden sm:inline'>General</span>
          </TabsTrigger>
          <TabsTrigger
            value='savings'
            data-tour='tab-savings'
            className='gap-2 py-3 data-[state=active]:bg-savings data-[state=active]:text-savings-foreground'
          >
            <PiggyBank className='w-4 h-4' />
            <span className='hidden sm:inline'>Ahorros</span>
          </TabsTrigger>
          <TabsTrigger
            value='expenses'
            data-tour='tab-expenses'
            className='gap-2 py-3 data-[state=active]:bg-expense data-[state=active]:text-expense-foreground'
          >
            <CreditCard className='w-4 h-4' />
            <span className='hidden sm:inline'>Gastos Fijos</span>
          </TabsTrigger>
          <TabsTrigger
            value='income'
            data-tour='tab-income'
            className='gap-2 py-3 data-[state=active]:bg-income data-[state=active]:text-income-foreground'
          >
            <TrendingUp className='w-4 h-4' />
            <span className='hidden sm:inline'>Ingresos</span>
          </TabsTrigger>
        </TabsList>

        {/* General Config */}
        <TabsContent value='general' className='mt-6'>
          <div className='glass-card rounded-2xl p-6'>
            <div className='mb-6'>
              <h3 className='text-xl font-semibold mb-2'>
                Configuración General
              </h3>
              <p className='text-muted-foreground'>
                Define los parámetros base de tu economía personal.
              </p>
            </div>
            <UserConfigSection />
          </div>
        </TabsContent>

        {/* Savings Sources */}
        <TabsContent value='savings' className='mt-6'>
          <div className='glass-card rounded-2xl p-6'>
            <SavingsBalanceSection />
          </div>
        </TabsContent>

        {/* Fixed Expenses */}
        <TabsContent value='expenses' className='mt-6'>
          <div className='glass-card rounded-2xl p-6'>
            <FixedExpensesSection />
          </div>
        </TabsContent>

        {/* Expected Income */}
        <TabsContent value='income' className='mt-6'>
          <div className='glass-card rounded-2xl p-6'>
            <ExpectedIncomesSection />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigMyMoney;
