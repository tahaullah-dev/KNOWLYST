// client/src/components/common/ErrorMessage.tsx (updated to use Alert)
import React from 'react';
import Alert from './Alert';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  className = '' 
}: ErrorMessageProps) {
  return (
    <Alert
      type="error"
      title={title}
      message={message}
      action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
      className={className}
    />
  );
}