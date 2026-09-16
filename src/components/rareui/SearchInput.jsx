'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
  onClear,
  autoFocus = false
}) {
  return (
    <div
      className={cn(
        'relative flex items-center bg-white rounded-2xl border border-neutral-200/90 px-3.5 py-2 shadow-2xs focus-within:border-[#1B4820] focus-within:ring-2 focus-within:ring-[#1B4820]/10 transition-all',
        className
      )}
    >
      <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-800 placeholder:text-neutral-400 font-medium"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
