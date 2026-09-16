'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  icon: CustomIcon,
  isLoading: externalLoading,
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isBusy = externalLoading !== undefined ? externalLoading : internalLoading;

  async function handleConfirmAction() {
    if (isBusy) return;
    try {
      setInternalLoading(true);
      await onConfirm?.();
    } finally {
      setInternalLoading(false);
      onClose?.();
    }
  }

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const IconComponent = CustomIcon || (isDanger ? AlertTriangle : isWarning ? AlertCircle : HelpCircle);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={!isBusy ? onClose : undefined}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/90 z-10 my-auto"
          >
            {/* Close X button */}
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer disabled:opacity-40"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Header */}
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border',
                  isDanger && 'bg-rose-50 text-rose-600 border-rose-200/70',
                  isWarning && 'bg-amber-50 text-amber-600 border-amber-200/70',
                  !isDanger && !isWarning && 'bg-emerald-50 text-[#1B4820] border-emerald-200/70'
                )}
              >
                <IconComponent className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="min-w-0 flex-1 pr-4">
                <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-snug">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isBusy}
                onClick={onClose}
                className="font-bold"
              >
                {cancelText}
              </Button>

              <Button
                type="button"
                variant={isDanger ? 'danger' : 'primary'}
                size="sm"
                isLoading={isBusy}
                onClick={handleConfirmAction}
                className={cn(
                  'font-bold shadow-md',
                  isDanger && 'shadow-rose-500/20 bg-rose-600 hover:bg-rose-700 text-white',
                  !isDanger && 'shadow-[#1B4820]/20'
                )}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
