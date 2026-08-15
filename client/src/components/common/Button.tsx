// client/src/components/common/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  loadingText,
  fullWidth = false,
  size = 'medium',
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'btn-base';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    small: 'btn-small',
    medium: '',
    large: 'btn-large',
  };

  const widthClass = fullWidth ? 'btn-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner mr-md" aria-hidden="true" />
      )}
      <span className="inline-flex min-w-0 items-center justify-center gap-sm break-words text-center">
        {loading ? (loadingText || children) : children}
      </span>
    </button>
  );
}