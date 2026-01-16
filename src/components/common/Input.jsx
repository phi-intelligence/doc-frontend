import React from 'react';
import classNames from 'classnames';

/**
 * Input component
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {Function} onChange - Change handler
 * @param {boolean} disabled - Whether input is disabled
 * @param {string} className - Additional CSS classes
 * @param {Object} props - Other input props
 */
const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={classNames(
        'w-full px-4 py-3 bg-white border border-light-border rounded-lg text-light-text placeholder-light-text-muted',
        'focus:outline-none focus:ring-2 focus:ring-brand-accent-100 focus:border-brand-accent-300',
        'transition-all duration-200',
        'dark:bg-dark-surface dark:border-dark-border dark:text-dark-text dark:placeholder-dark-text-muted',
        'dark:focus:ring-brand-accent-800 dark:focus:border-brand-accent-600',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};

export default Input;

