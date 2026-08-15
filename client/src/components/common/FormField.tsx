// client/src/components/common/FormField.tsx
import React, { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: ReactNode;
  children?: ReactNode;
  isTextarea?: boolean;
}

export default function FormField({
  label,
  helperText,
  error,
  icon,
  children,
  isTextarea = false,
  className = '',
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full min-w-0">
      {label && (
        <label htmlFor={fieldId} className="form-label">
          {label}
          {props.required && <span className="text-accent-primary ml-xs">*</span>}
        </label>
      )}

      <div className="relative min-w-0">
        {icon && <div className="pointer-events-none absolute left-base top-1/2 -translate-y-1/2 text-text-tertiary">{icon}</div>}

        {isTextarea ? (
          <textarea
            id={fieldId}
            className={`form-input ${icon ? 'pl-2xl' : ''} ${error ? 'error' : ''} ${className}`}
            {...(props as any)}
          >
            {children}
          </textarea>
        ) : (
          <input
            id={fieldId}
            className={`form-input ${icon ? 'pl-2xl' : ''} ${error ? 'error' : ''} ${className}`}
            {...props}
          />
        )}
      </div>

      {error && (
        <p id={`${fieldId}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${fieldId}-helper`} className="form-helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
}
