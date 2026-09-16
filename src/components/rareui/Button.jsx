'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
  ...props
}) {
  const baseVariants = {
    primary: 'bg-[#1B4820] hover:bg-[#143416] text-white shadow-md shadow-[#1B4820]/20 border border-[#143416]',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 shadow-2xs',
    subtle: 'bg-[#EEF7EE] hover:bg-[#e0f0e0] text-[#1B4820] border border-[#1B4820]/15',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70',
    dangerSolid: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 border border-rose-700',
    ghost: 'bg-transparent hover:bg-neutral-100/70 text-neutral-700 border border-transparent',
    link: 'bg-transparent text-[#1B4820] hover:underline p-0 h-auto border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl gap-1.5',
    md: 'px-4 py-2 text-sm font-semibold rounded-2xl gap-2',
    lg: 'px-6 py-2.5 text-base font-bold rounded-2xl gap-2.5',
    icon: 'p-2 rounded-xl',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#1B4820]/20 disabled:opacity-50 disabled:cursor-not-allowed',
        baseVariants[variant] || baseVariants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </motion.button>
  );
}
