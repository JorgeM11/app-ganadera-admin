import React from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  info: 'bg-blue-50 text-blue-700 border-blue-200/80',
  primary: 'bg-[#EEF7EE] text-[#1B4820] border-[#1B4820]/20',
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200/80',
};

const dotStyles = {
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  primary: 'bg-[#1B4820]',
  neutral: 'bg-neutral-400',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  className
}) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-bold',
  }[size] || 'text-xs px-2.5 py-1 font-semibold';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-all select-none',
        variantStyles[variant] || variantStyles.neutral,
        sizeClasses,
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotStyles[variant] || dotStyles.neutral
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              dotStyles[variant] || dotStyles.neutral
            )}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
