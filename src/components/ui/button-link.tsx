import React from 'react';
import Link from 'next/link';

interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      href,
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
    const isIconOnly = iconOnly || (!children && icon);

    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const roundedStyles = 'rounded-full';

    const sizeStyles = {
      sm: isIconOnly
        ? 'w-8 h-8 sm:w-9 sm:h-9'
        : 'px-3 py-1.5 text-sm sm:px-4 sm:py-2',
      md: isIconOnly
        ? 'w-10 h-10 sm:w-12 sm:h-12'
        : 'px-4 py-2 text-base sm:px-6 sm:py-2.5',
      lg: isIconOnly
        ? 'w-12 h-12 sm:w-14 sm:h-14'
        : 'px-6 py-3 text-lg sm:px-8 sm:py-3.5',
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
      sm: 'w-4 h-4 sm:w-5 sm:h-5',
      md: 'w-5 h-5 sm:w-6 sm:h-6',
      lg: 'w-6 h-6 sm:w-7 sm:h-7',
    };

    const combinedClassName =
      `${baseStyles} ${roundedStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();

    return (
      <Link ref={ref} href={href} className={combinedClassName} {...props}>
        {icon && (
          <span
            className={`inline-flex items-center justify-center ${
              children && !isIconOnly ? 'mr-2' : ''
            }`}
          >
            <span
              className={
                isIconOnly ? iconSizeStyles[size] : 'w-4 h-4 sm:w-5 sm:h-5'
              }
            >
              {icon}
            </span>
          </span>
        )}
        {children && !isIconOnly && <span>{children}</span>}
      </Link>
    );
  }
);

ButtonLink.displayName = 'ButtonLink';
