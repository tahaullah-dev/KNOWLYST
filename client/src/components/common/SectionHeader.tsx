// client/src/components/common/SectionHeader.tsx
import React, { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  description,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`mb-2xl flex min-w-0 flex-col gap-lg sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div className="min-w-0">
        <h2 className="mb-md break-words text-text-primary">{title}</h2>
        {description && <p className="text-body-sm text-text-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
