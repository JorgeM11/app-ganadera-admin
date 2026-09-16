'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Select({
  options = [],
  value,
  defaultValue,
  onChange,
  name,
  placeholder = 'Seleccionar...',
  label,
  error,
  disabled = false,
  className,
  size = 'md', // 'sm' | 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value !== undefined ? value : (defaultValue ?? ''));
  const containerRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (value === undefined && defaultValue !== undefined) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, value]);

  const currentValue = value !== undefined ? value : internalValue;

  // Normalize options into { value, label, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(currentValue));

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function handleSelect(opt) {
    if (disabled) return;
    setInternalValue(opt.value);
    onChange?.(opt.value);
    setIsOpen(false);
  }

  const isSmall = size === 'sm';

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue !== undefined && currentValue !== null ? currentValue : ''}
        />
      )}

      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
          {label}
        </label>
      )}

      {/* Select Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between text-left transition-all outline-none rounded-2xl cursor-pointer select-none',
          'bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/90 text-neutral-900',
          'focus:border-[#1B4820] focus:ring-2 focus:ring-[#1B4820]/10 focus:bg-white',
          isOpen && 'border-[#1B4820] bg-white ring-2 ring-[#1B4820]/10 shadow-sm',
          disabled && 'opacity-60 cursor-not-allowed hover:bg-neutral-50',
          isSmall ? 'px-3 py-2 text-xs font-semibold' : 'px-3.5 py-2.5 text-sm font-semibold'
        )}
      >
        <span className={cn('truncate flex items-center gap-2', !selectedOption && 'text-neutral-400 font-normal')}>
          {selectedOption?.icon && (
            <selectedOption.icon className={cn('shrink-0', isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          )}
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={cn(
            'text-neutral-400 shrink-0 transition-transform duration-200 ml-2',
            isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4',
            isOpen && 'rotate-180 text-[#1B4820]'
          )}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl shadow-black/10 border border-neutral-200/80 p-1.5 max-h-60 overflow-y-auto overflow-x-hidden backdrop-blur-md',
              'scrollbar-thin scrollbar-thumb-neutral-200'
            )}
          >
            {normalizedOptions.length === 0 ? (
              <div className="py-3 px-4 text-xs text-neutral-400 text-center font-medium">
                Sin opciones disponibles
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const Icon = opt.icon;

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer select-none text-xs sm:text-sm',
                      isSelected
                        ? 'bg-[#EEF7EE] text-[#1B4820] font-bold'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 font-medium'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {Icon && <Icon className="w-4 h-4 shrink-0 text-[#1B4820]" />}
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[11px] text-neutral-400 font-normal">
                          ({opt.sublabel})
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#1B4820] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}
