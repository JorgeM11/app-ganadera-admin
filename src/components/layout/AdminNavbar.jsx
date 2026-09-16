'use client';

import React from 'react';
import { Menu, Bell, ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/rareui/Badge';

export default function AdminNavbar({ onOpenMobileMenu, title = 'Panel Administrativo' }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-tight">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="primary" size="sm" dot pulse>
          Modo Admin Activo
        </Badge>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200 text-xs text-neutral-500 font-medium">
          <span className="font-bold text-neutral-800">{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
