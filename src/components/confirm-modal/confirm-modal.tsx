'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Button } from '@/components/ui';

interface ConfirmModalContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModalContext = createContext<ConfirmModalContextType | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmModalProvider');
  }
  return context;
};

interface ConfirmModalProviderProps {
  children: ReactNode;
}

export const ConfirmModalProvider: React.FC<ConfirmModalProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showConfirm = (confirmOptions: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(confirmOptions);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  };

  const variantStyles = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  const buttonVariant = options.variant === 'danger' ? 'secondary' : 'primary';

  return (
    <ConfirmModalContext.Provider value={{ showConfirm }}>
      {children}
      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl'>
            {options.title && (
              <h3
                className={`text-xl font-bold mb-4 ${
                  options.variant ? variantStyles[options.variant] : 'text-primary-dark'
                }`}
              >
                {options.title}
              </h3>
            )}
            <p className='text-zinc-700 mb-6'>{options.message}</p>
            <div className='flex gap-3 justify-end'>
              <Button
                type='button'
                onClick={handleCancel}
                variant='outline'
                size='md'
              >
                {options.cancelText || 'Cancelar'}
              </Button>
              <Button
                type='button'
                onClick={handleConfirm}
                variant={buttonVariant}
                size='md'
              >
                {options.confirmText || 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmModalContext.Provider>
  );
};

