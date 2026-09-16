'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Layers, 
  LogOut, 
  ShieldCheck, 
  Tractor,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import Badge from '@/components/rareui/Badge';

const navItems = [
  { href: '/', label: 'Vista General', icon: LayoutDashboard },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/fincas', label: 'Fincas', icon: Building2 },
  { href: '/animales', label: 'Ganado & Animales', icon: Layers },
];

export default function AdminSidebar({ onCloseMobile }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isCurrent = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-72 bg-white border-r border-neutral-200/80 flex flex-col justify-between h-full select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#143416] via-[#1B4820] to-[#2B6631] flex items-center justify-center text-white shadow-md shadow-[#1B4820]/25 ring-2 ring-[#1B4820]/10">
              <Tractor className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-base font-black text-neutral-900 tracking-tight leading-tight">
                Ganadera Admin
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Portal de Control Global
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-3 py-1">
            Navegación
          </p>
          {navItems.map((item) => {
            const active = isCurrent(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all group',
                  active
                    ? 'bg-[#1B4820] text-white shadow-lg shadow-[#1B4820]/20'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform group-hover:scale-105',
                      active ? 'text-white' : 'text-[#1B4820]'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={cn(
                    'w-4 h-4 transition-transform',
                    active ? 'text-white/70' : 'text-neutral-300 group-hover:translate-x-0.5'
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User & Logout */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF7EE] border border-[#1B4820]/20 flex items-center justify-center text-[#1B4820] font-black text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-neutral-900 truncate">
              {user?.name || 'Administrador'}
            </p>
            <p className="text-[11px] text-neutral-400 font-medium truncate">
              {user?.email || 'admin@campo.com'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors cursor-pointer select-none"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>

        <p className="text-[10px] text-center text-neutral-400 font-medium pt-1">
          App Ganadera Admin v2.0
        </p>
      </div>
    </aside>
  );
}
