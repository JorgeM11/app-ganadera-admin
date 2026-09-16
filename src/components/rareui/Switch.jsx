'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md', // 'sm' | 'md'
  className,
}) {
  const isSmall = size === 'sm';

  function handleToggle(e) {
    e.stopPropagation();
    if (disabled) return;
    onChange?.(!checked);
  }

  return (
    <div
      onClick={handleToggle}
      className={cn(
        'inline-flex items-center gap-2.5 cursor-pointer select-none group',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="switch"
      aria-checked={checked}
    >
      <div
        className={cn(
          'relative rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4820]/30',
          isSmall ? 'w-9 h-5 p-0.5' : 'w-11 h-6 p-0.5',
          checked
            ? 'bg-[#1B4820] shadow-xs'
            : 'bg-neutral-300 hover:bg-neutral-400/80'
        )}
      >
        <motion.div
          animate={{
            x: checked ? (isSmall ? 16 : 20) : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={cn(
            'bg-white rounded-full shadow-md pointer-events-none transform transition-shadow',
            isSmall ? 'w-4 h-4' : 'w-5 h-5',
            checked ? 'shadow-[#1B4820]/30' : 'shadow-black/10'
          )}
        />
      </div>

      {(label || description) && (
        <div className="flex flex-col text-left leading-tight">
          {label && (
            <span
              className={cn(
                'font-bold text-neutral-800 transition-colors',
                isSmall ? 'text-xs' : 'text-sm',
                checked ? 'text-[#1B4820]' : 'text-neutral-600'
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-[10px] text-neutral-400 font-medium">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
