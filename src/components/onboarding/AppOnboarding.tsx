'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { CallBackProps } from 'react-joyride';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import { selectOnboardingCompleted, setOnboardingCompleted } from '@/Redux/features/user';
import { selectUser } from '@/Redux/features/auth';
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

interface AppOnboardingProps {
  page: OnboardingPage;
}

export const AppOnboarding: React.FC<AppOnboardingProps> = ({ page }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const onboardingCompleted = useAppSelector(selectOnboardingCompleted);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Obtener los pasos según la página
  const steps = page === 'config' ? configOnboardingSteps : myMonthOnboardingSteps;

  // Cargar estado del onboarding desde Firebase
  useEffect(() => {
    const loadOnboardingStatus = async () => {
      if (user?.uid) {
        try {
          const completed = await userService.getOnboardingStatus(user.uid);
          dispatch(setOnboardingCompleted(completed));
        } catch (error) {
          console.error('Error loading onboarding status:', error);
        }
      }
    };
    loadOnboardingStatus();
  }, [user?.uid, dispatch]);

  // Iniciar el tour si no se ha completado
  useEffect(() => {
    setMounted(true);
    // Pequeño delay para asegurar que los elementos del DOM estén listos
    const timer = setTimeout(() => {
      if (!onboardingCompleted && user?.uid) {
        setRun(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [onboardingCompleted, user?.uid]);

  const handleJoyrideCallback = useCallback(async (data: CallBackProps) => {
    const { status, index, type } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (type === 'step:after') {
      setStepIndex(index + 1);
    }

    if (finishedStatuses.includes(status as string)) {
      setRun(false);
      
      // Solo marcar como completado si estamos en my-month (el último paso del onboarding)
      if (page === 'my-month' && user?.uid) {
        try {
          await userService.setOnboardingCompleted(user.uid, true);
          dispatch(setOnboardingCompleted(true));
        } catch (error) {
          console.error('Error saving onboarding status:', error);
        }
      }
    }
  }, [page, user?.uid, dispatch]);

  // No renderizar en el servidor
  if (!mounted) {
    return null;
  }

  // No mostrar si ya completó el onboarding
  if (onboardingCompleted) {
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
