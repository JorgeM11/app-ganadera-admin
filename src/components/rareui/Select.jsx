'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';
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
  const [filterText, setFilterText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Normalize options into { value, label, icon, sublabel }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: opt, label: String(opt) };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(currentValue));

  // Filtered options if search is active
  const displayedOptions = useMemo(() => {
    if (!filterText.trim()) return normalizedOptions;
    const q = filterText.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [normalizedOptions, filterText]);

  // Focus search input when opening & sync highlighted index
  useEffect(() => {
    if (isOpen) {
      const idx = displayedOptions.findIndex((opt) => String(opt.value) === String(currentValue));
      setHighlightedIndex(idx >= 0 ? idx : 0);
      if (normalizedOptions.length > 7) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    } else {
      setFilterText('');
      setHighlightedIndex(-1);
    }
  }, [isOpen, normalizedOptions.length]);

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

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < displayedOptions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : displayedOptions.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < displayedOptions.length) {
          handleSelect(displayedOptions[highlightedIndex]);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayedOptions, highlightedIndex]);

  function handleSelect(opt) {
    if (disabled) return;
    setInternalValue(opt.value);
    onChange?.(opt.value);
    setIsOpen(false);
    setFilterText('');
  }

  const isSmall = size === 'sm';
  const SelectedIcon = selectedOption?.icon;

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
          'bg-neutral-50 hover:bg-white border border-neutral-200/90 text-neutral-900',
          'focus:border-[#1B4820] focus:ring-2 focus:ring-[#1B4820]/15 focus:bg-white',
          isOpen && 'border-[#1B4820] bg-white ring-2 ring-[#1B4820]/15 shadow-sm',
          disabled && 'opacity-60 cursor-not-allowed hover:bg-neutral-50',
          isSmall ? 'px-3 py-2 text-xs font-semibold' : 'px-3.5 py-2.5 text-sm font-semibold'
        )}
      >
        <span className={cn('truncate flex items-center gap-2', !selectedOption && 'text-neutral-400 font-normal')}>
          {SelectedIcon && (
            <SelectedIcon className={cn('shrink-0', isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
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
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              'absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl shadow-neutral-950/10 border border-neutral-200 p-1.5 max-h-64 overflow-y-auto overflow-x-hidden backdrop-blur-md',
              'scrollbar-thin scrollbar-thumb-neutral-200'
            )}
          >
            {/* Search Filter for longer lists */}
            {normalizedOptions.length > 7 && (
              <div className="p-1.5 mb-1 border-b border-neutral-100 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Buscar opción..."
                  className="w-full text-xs bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 font-medium"
                />
              </div>
            )}

            {displayedOptions.length === 0 ? (
              <div className="py-3 px-4 text-xs text-neutral-400 text-center font-medium">
                Sin coincidencias
              </div>
            ) : (
              displayedOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(currentValue);
                const isHighlighted = idx === highlightedIndex;
                const Icon = opt.icon;

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer select-none text-xs sm:text-sm',
                      isSelected
                        ? 'bg-[#EEF7EE] text-[#1B4820] font-bold'
                        : isHighlighted
                        ? 'bg-neutral-100/90 text-neutral-900 font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 font-medium'
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
