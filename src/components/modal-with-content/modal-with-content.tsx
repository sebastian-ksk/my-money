'use client';

import React, { useEffect } from 'react';

interface ModalWithContentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closeOnBackdropClick?: boolean;
}

const ModalWithContent: React.FC<ModalWithContentProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  closeOnBackdropClick = true,
}) => {
  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 bg-white/30 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden'
      onClick={handleBackdropClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`relative p-4 w-full ${maxWidthClasses[maxWidth]} max-h-full`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal content */}
        <div className='relative bg-white border border-zinc-200 rounded-lg shadow-lg p-4 md:p-6'>
          {/* Modal header */}
          {title && (
            <div className='flex items-center justify-between border-b border-zinc-200 pb-4 md:pb-5 mb-4 md:mb-6'>
              <h3
                id='modal-title'
                className='text-lg md:text-2xl font-bold text-primary-dark'
              >
                {title}
              </h3>
              <button
                type='button'
                onClick={onClose}
                className='text-zinc-600 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 rounded-lg text-sm w-9 h-9 inline-flex justify-center items-center transition-colors'
                aria-label='Cerrar modal'
              >
                <svg
                  className='w-5 h-5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18 17.94 6M18 18 6.06 6'
                  />
                </svg>
                <span className='sr-only'>Cerrar modal</span>
              </button>
            </div>
          )}

          {/* Modal body */}
          <div className='max-h-[calc(90vh-200px)] overflow-y-auto'>
            {children}
          </div>

          {/* Modal footer */}
          {footer && (
            <div className='flex items-center border-t border-zinc-200 space-x-4 pt-4 md:pt-5 mt-4 md:mt-6'>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalWithContent;
