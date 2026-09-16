'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-xl',
  className
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs cursor-pointer"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={cn(
                'w-screen bg-white shadow-2xl border-l border-neutral-200/90 flex flex-col z-10',
                maxWidth,
                className
              )}
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/70">
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 -mr-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
