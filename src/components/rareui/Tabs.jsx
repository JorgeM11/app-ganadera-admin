'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 p-1.5 bg-neutral-100/90 rounded-2xl border border-neutral-200/60 overflow-x-auto max-w-full',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap',
              isActive
                ? 'text-[#1B4820]'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeAdminTab"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-neutral-200/50 -z-0"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-black',
                    isActive ? 'bg-[#EEF7EE] text-[#1B4820]' : 'bg-neutral-200 text-neutral-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
