import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Button from './Button';

export function TableContainer({ children, className }) {
  return (
    <div
      className={cn(
        'w-full bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden',
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children, className }) {
  return (
    <table className={cn('w-full text-left border-collapse text-sm', className)}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn('bg-neutral-50/80 border-b border-neutral-200/80', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }) {
  return (
    <tbody className={cn('divide-y divide-neutral-100', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, onClick, isClickable = false }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors',
        isClickable || onClick
          ? 'hover:bg-emerald-50/30 cursor-pointer'
          : 'hover:bg-neutral-50/60',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th
      className={cn(
        'px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 select-none whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return (
    <td
      className={cn(
        'px-4 py-3.5 text-sm text-neutral-700 font-medium whitespace-nowrap align-middle',
        className
      )}
    >
      {children}
    </td>
  );
}

export function TableEmpty({
  title = 'No hay registros encontrados',
  message = 'Intenta ajustar los filtros de búsqueda.',
  icon: Icon = Inbox,
  colSpan = 6
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
            <Icon className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h4 className="text-base font-bold text-neutral-800">{title}</h4>
          <p className="text-xs text-neutral-500 font-medium">{message}</p>
        </div>
      </td>
    </tr>
  );
}

export function TablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 15,
  onPageChange,
  className
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-medium',
        className
      )}
    >
      <div>
        Mostrando <span className="font-bold text-neutral-800">{startItem}</span> -{' '}
        <span className="font-bold text-neutral-800">{endItem}</span> de{' '}
        <span className="font-bold text-neutral-800">{totalItems}</span> registros
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="px-3 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 shadow-2xs">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg"
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
