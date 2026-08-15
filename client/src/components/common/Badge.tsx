// client/src/components/common/Badge.tsx
import React, { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = 'neutral',
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {icon && <span className="mr-xs">{icon}</span>}
      {children}
    </span>
  );
}
