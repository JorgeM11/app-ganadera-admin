'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  className
}) {
  const colorStyles = {
    primary: {
      iconBg: 'bg-[#EEF7EE] text-[#1B4820] border-[#1B4820]/15',
      glow: 'from-emerald-500/10 via-transparent to-transparent',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
      glow: 'from-blue-500/10 via-transparent to-transparent',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      glow: 'from-amber-500/10 via-transparent to-transparent',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
      glow: 'from-rose-500/10 via-transparent to-transparent',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200/60',
      glow: 'from-purple-500/10 via-transparent to-transparent',
    },
  }[color] || {
    iconBg: 'bg-[#EEF7EE] text-[#1B4820] border-[#1B4820]/15',
    glow: 'from-emerald-500/10 via-transparent to-transparent',
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all',
        className
      )}
    >
      {/* Glow ambient background */}
      <div
        className={cn(
          'absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-60',
          colorStyles.glow
        )}
      />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-none">
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs',
              colorStyles.iconBg
            )}
          >
            <Icon className="w-6 h-6" strokeWidth={2} />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={cn(
                'font-bold px-2 py-0.5 rounded-full text-[10px]',
                trend.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              )}
            >
              {trend.label}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
