import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="fixed right-base top-16 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-border-light bg-white p-2xl shadow-lg dark:border-[#333333] dark:bg-[#1a1a1a]"
          >
            <div className="mb-2xl flex items-center justify-between gap-lg">
              <h2 id="settings-title" className="text-h3 font-semibold text-text-primary dark:text-white">
                Settings
              </h2>
              <motion.button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-md p-xs text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary dark:hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close settings"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="space-y-lg">
              <div className="flex items-center justify-between gap-lg rounded-lg border border-transparent bg-surface-light p-lg dark:border-[#333333] dark:bg-[#252525]">
                <div className="flex min-w-0 items-center gap-md">
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-text-secondary dark:text-white" />
                  ) : (
                    <Sun className="h-4 w-4 text-text-secondary dark:text-white" />
                  )}
                  <span className="text-body-sm font-semibold text-text-primary dark:text-white">
                    Dark Mode
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                    theme === 'dark'
                      ? 'bg-accent-primary'
                      : 'bg-border-light dark:bg-[#333333]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Turn ${theme === 'dark' ? 'off' : 'on'} dark mode`}
                >
                  <motion.span
                    animate={{ x: theme === 'dark' ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="inline-block h-5 w-5 rounded-full bg-white"
                  />
                </motion.button>
              </div>
            </div>

            <div className="mt-2xl border-t border-border-light pt-lg dark:border-[#333333]">
              <p className="text-body-xs text-text-tertiary dark:text-[#999999]">
                Theme preference is saved locally
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
