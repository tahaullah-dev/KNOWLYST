// client/src/components/layout/Header.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History } from 'lucide-react';
import faviconUrl from '../../assets/favicon.svg';

interface HeaderProps {
  onBrandClick?: () => void;
  onHistoryClick?: () => void;
  className?: string;
}

export default function Header({ onBrandClick, onHistoryClick, className = '' }: HeaderProps) {
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleBrandClick = () => {
    if (onBrandClick) {
      onBrandClick();
      return;
    }

    window.location.href = '/';
  };

  return (
    <header className={`border-b border-border-light bg-surface-paper ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-md px-base py-lg sm:px-lg">
        <motion.button
          type="button"
          onClick={handleBrandClick}
          className="brand-button min-w-0"
          aria-label="Go to the home page"
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <motion.span
            className="brand-mark relative inline-flex"
            aria-hidden="true"
            onMouseEnter={() => !prefersReducedMotion && setIsHoveringLogo(true)}
            onMouseLeave={() => setIsHoveringLogo(false)}
            onFocus={() => !prefersReducedMotion && setIsHoveringLogo(true)}
            onBlur={() => setIsHoveringLogo(false)}
          >
            {/* Ripple effect container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <AnimatePresence>
                {isHoveringLogo && !prefersReducedMotion && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderWidth: '1px',
                      borderColor: 'rgb(214, 79, 60)',
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Logo icon with scale */}
            <motion.img
              src={faviconUrl}
              alt=""
              className="h-4 w-4 relative z-10"
              animate={isHoveringLogo && !prefersReducedMotion ? { scale: 1.07 } : { scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </motion.span>
          <span className="text-overline tracking-[0.2em] text-text-primary uppercase">KNOWLYST</span>
        </motion.button>

        <div className="flex flex-wrap items-center justify-end gap-sm text-text-tertiary">
          <motion.button
            type="button"
            onClick={onHistoryClick}
            className="header-action"
            aria-label="View assessment history"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
