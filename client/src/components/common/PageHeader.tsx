// client/src/components/common/PageHeader.tsx
import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
  action?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-3xl min-w-0 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-lg min-w-0">
          <ol className="flex flex-wrap items-center gap-sm text-body-sm text-text-secondary">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex min-w-0 items-center gap-sm">
                {index > 0 && <span className="text-text-tertiary">/</span>}
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="rounded-sm px-xs py-1 text-left text-text-primary underline-offset-4 transition-colors hover:text-accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="break-words text-text-primary">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-lg sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="mb-md break-words text-text-primary">{title}</h1>
          {subtitle && <p className="text-body text-text-secondary">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
