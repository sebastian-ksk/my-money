import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      icon,
      iconOnly = false,
      variant = 'primary',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    // Detectar si los children están realmente visibles
    // En mobile, siempre mostrar el texto si existe (aunque tenga hidden sm:inline)
    // En desktop, respetar las clases CSS
    const hasChildren = Boolean(children);

    // Solo considerar iconOnly si:
    // 1. Se pasa explícitamente iconOnly=true
    // 2. No hay children en absoluto
    const isIconOnly = iconOnly || (!hasChildren && icon);

    const baseStyles = `inline-flex items-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
      isIconOnly ? 'justify-center' : 'justify-start'
    }`;

    const roundedStyles = 'rounded-full';

    const sizeStyles = {
      sm: isIconOnly
        ? 'w-8 h-8 sm:w-9 sm:h-9'
        : 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
      md: isIconOnly
        ? 'w-10 h-10 sm:w-12 sm:h-12'
        : 'px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-base',
      lg: isIconOnly
        ? 'w-12 h-12 sm:w-14 sm:h-14'
        : 'px-3 py-2 text-sm sm:px-6 sm:py-3 sm:text-lg',
    };

    const variantStyles = {
      primary:
        'bg-primary-dark text-white hover:opacity-90 focus:ring-primary-dark',
      secondary:
        'bg-primary-medium text-white hover:opacity-90 focus:ring-primary-medium',
      outline:
        'border-2 border-primary-dark text-primary-dark bg-transparent hover:bg-primary-dark hover:text-white focus:ring-primary-dark',
      ghost:
        'text-primary-dark bg-transparent hover:bg-neutral-light focus:ring-primary-dark',
    };

    const iconSizeStyles = {
      sm: 'w-5 h-5 sm:w-6 sm:h-6',
      md: 'w-6 h-6 sm:w-7 sm:h-7',
      lg: 'w-7 h-7 sm:w-8 sm:h-8',
    };

    const combinedClassName =
      `${baseStyles} ${roundedStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();

    // Extraer el texto del label para el tooltip
    const getLabelText = (): string => {
      if (!children) return '';
      const childrenArray = React.Children.toArray(children);
      return childrenArray
        .map((child) => {
          if (typeof child === 'string') return child;
          if (React.isValidElement(child)) {
            const props = child.props as { children?: React.ReactNode };
            if (props?.children && typeof props.children === 'string') {
              return props.children;
            }
          }
          return '';
        })
        .join('')
        .trim();
    };

    const labelText = getLabelText();
    const showTooltip = isIconOnly && labelText;

    return (
      <div className='relative inline-flex group'>
        <button ref={ref} className={combinedClassName} {...props}>
          {isIconOnly ? (
            icon && (
              <span className='inline-flex items-center justify-center w-full h-full'>
                <span className={iconSizeStyles[size]}>{icon}</span>
              </span>
            )
          ) : (
            <>
              {icon && (
                <span className='inline-flex items-center justify-center flex-shrink-0'>
                  <span className='w-4 h-4 sm:w-5 sm:h-5'>{icon}</span>
                </span>
              )}
              {children && (
                <span className={icon ? 'ml-2' : ''}>{children}</span>
              )}
            </>
          )}
        </button>
        {showTooltip && (
          <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
            {labelText}
            <div className='absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900'></div>
          </div>
        )}
      </div>
    );
  }
);

Button.displayName = 'Button';
