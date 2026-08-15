// client/src/components/common/Card.tsx
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  elevated?: boolean;
  className?: string;
}

export default function Card({ children, elevated = false, className = '' }: CardProps) {
  return (
    <div className={`${elevated ? 'card-elevated' : 'card'} ${className}`}>
      {children}
    </div>
  );
}
