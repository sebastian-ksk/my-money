'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { CallBackProps } from 'react-joyride';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  selectUser,
  selectOnboardingCompleted,
  selectOnboardingMyMonthCompleted,
  setOnboardingCompleted,
  setOnboardingMyMonthCompleted,
} from '@/Redux/features/auth';
import { userService } from '@/services/Firebase/fireabase-user-service';
import {
  configOnboardingSteps,
  myMonthOnboardingSteps,
  joyrideStyles,
  joyrideLocale,
} from './onboarding-steps';

// Importar Joyride dinámicamente para evitar SSR issues
const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

type OnboardingPage = 'config' | 'my-month';

// Callbacks para abrir modales durante el onboarding
export interface OnboardingModalCallbacks {
  onOpenLiquidityModal?: () => void;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
  onOpenSavingsModal?: () => void;
  onCloseAllModals?: () => void;
}

interface AppOnboardingProps {
  page: OnboardingPage;
  modalCallbacks?: OnboardingModalCallbacks;
}

export const AppOnboarding: React.FC<AppOnboardingProps> = ({ page, modalCallbacks }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const onboardingCompleted = useAppSelector(selectOnboardingCompleted);
  const onboardingMyMonthCompleted = useAppSelector(selectOnboardingMyMonthCompleted);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Obtener los pasos según la página
  const steps = page === 'config' ? configOnboardingSteps : myMonthOnboardingSteps;

  // Determinar si debe mostrar el onboarding según la página
  const shouldShowOnboarding = page === 'config' 
    ? !onboardingCompleted 
    : !onboardingMyMonthCompleted;

  // Índices de pasos que abren modales (solo para my-month)
  // Paso 1: Liquidez, Paso 5: Gasto, Paso 6: Ingreso, Paso 7: Ahorro
  const LIQUIDITY_STEP = 1;
  const EXPENSE_STEP = 5;
  const INCOME_STEP = 6;
  const SAVINGS_STEP = 7;

  // Cargar estado del onboarding desde Firebase
  useEffect(() => {
    const loadOnboardingStatus = async () => {
      if (user?.uid) {
        try {
          if (page === 'config') {
            const completed = await userService.getOnboardingStatus(user.uid);
            dispatch(setOnboardingCompleted(completed));
          } else {
            const completed = await userService.getMyMonthOnboardingStatus(user.uid);
            dispatch(setOnboardingMyMonthCompleted(completed));
          }
        } catch (error) {
          console.error('Error loading onboarding status:', error);
        }
      }
    };
    loadOnboardingStatus();
  }, [user?.uid, dispatch, page]);

  // Iniciar el tour si no se ha completado
  useEffect(() => {
    setMounted(true);
    // Pequeño delay para asegurar que los elementos del DOM estén listos
    const timer = setTimeout(() => {
      if (shouldShowOnboarding && user?.uid) {
        setRun(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [shouldShowOnboarding, user?.uid]);

  // Función para abrir el modal correspondiente al paso
  const openModalForStep = useCallback((stepIdx: number) => {
    if (page !== 'my-month' || !modalCallbacks) return;
    
    // Primero cerrar todos los modales
    modalCallbacks.onCloseAllModals?.();
    
    // Pequeño delay para cerrar antes de abrir
    setTimeout(() => {
      switch (stepIdx) {
        case LIQUIDITY_STEP:
          modalCallbacks.onOpenLiquidityModal?.();
          break;
        case EXPENSE_STEP:
          modalCallbacks.onOpenExpenseModal?.();
          break;
        case INCOME_STEP:
          modalCallbacks.onOpenIncomeModal?.();
          break;
        case SAVINGS_STEP:
          modalCallbacks.onOpenSavingsModal?.();
          break;
        default:
          // Para otros pasos, asegurarse de cerrar modales
          modalCallbacks.onCloseAllModals?.();
      }
    }, 100);
  }, [page, modalCallbacks]);

  const handleJoyrideCallback = useCallback(async (data: CallBackProps) => {
    const { status, index, type, action } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    // Cuando se muestra un paso, abrir el modal correspondiente
    if (type === 'step:after' && action === 'next') {
      const nextStep = index + 1;
      setStepIndex(nextStep);
      openModalForStep(nextStep);
    }

    // Cuando se retrocede
    if (type === 'step:after' && action === 'prev') {
      const prevStep = index - 1;
      setStepIndex(prevStep);
      openModalForStep(prevStep);
    }

    // Al iniciar el tour, verificar si el primer paso necesita modal
    if (type === 'tour:start') {
      openModalForStep(0);
    }

    if (finishedStatuses.includes(status as string)) {
      setRun(false);
      
      // Cerrar todos los modales al finalizar
      modalCallbacks?.onCloseAllModals?.();
      
      if (user?.uid) {
        try {
          if (page === 'config') {
            await userService.setOnboardingCompleted(user.uid, true);
            dispatch(setOnboardingCompleted(true));
          } else {
            await userService.setMyMonthOnboardingCompleted(user.uid, true);
            dispatch(setOnboardingMyMonthCompleted(true));
          }
        } catch (error) {
          console.error('Error saving onboarding status:', error);
        }
      }
    }
  }, [page, user?.uid, dispatch, openModalForStep, modalCallbacks]);

  // No renderizar en el servidor
  if (!mounted) {
    return null;
  }

  // No mostrar si ya completó el onboarding correspondiente
  if (!shouldShowOnboarding) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      styles={joyrideStyles}
      locale={joyrideLocale}
      callback={handleJoyrideCallback}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};

export default AppOnboarding;
