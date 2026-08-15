// client/src/components/layout/Layout.tsx
import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  onBrandClick?: () => void;
  onHistoryClick?: () => void;
}

export default function Layout({ children, onBrandClick, onHistoryClick }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-paper">
      <Header onBrandClick={onBrandClick} onHistoryClick={onHistoryClick} />
      <main className="flex-1 page-content">
        {children}
      </main>
    </div>
  );
}
