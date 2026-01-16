import React from 'react';
import classNames from 'classnames';

/**
 * Button component with variants
 * @param {string} variant - 'primary', 'secondary', or 'ghost'
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {boolean} disabled - Whether button is disabled
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {Object} props - Other button props
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-brand-accent-500 text-white hover:bg-brand-accent-600 active:bg-brand-accent-700',
    secondary: 'bg-white text-light-text border border-light-border hover:border-light-border-hover hover:bg-light-bg dark:bg-dark-surface dark:text-dark-text dark:border-dark-border dark:hover:border-dark-border-hover dark:hover:bg-dark-sidebar',
    ghost: 'bg-transparent text-light-text-secondary hover:bg-light-sidebar hover:text-light-text dark:text-dark-text-secondary dark:hover:bg-dark-sidebar dark:hover:text-dark-text',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

