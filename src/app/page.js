'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import StatCard from '@/components/rareui/StatCard';
import Badge from '@/components/rareui/Badge';
import Button from '@/components/rareui/Button';
import { 
  TableContainer, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  TableEmpty 
} from '@/components/rareui/Table';
import { BoneyardCardsSkeleton, BoneyardTableSkeleton } from '@/components/ui/BoneyardSkeleton';
import { supabase } from '@/lib/supabaseClient';
import { formatDate, calculateAge } from '@/lib/utils';
import { 
  Users, 
  Building2, 
  Layers, 
  Milk, 
  ShieldPlus, 
  TrendingUp, 
  ArrowRight, 
  UserPlus, 
  PlusCircle,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    usersCount: 0,
    activeUsersCount: 0,
    farmsCount: 0,
    animalsCount: 0,
    activeAnimalsCount: 0,
    femaleCowsCount: 0,
    totalMilkLiters: 0,
    healthRecordsCount: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [farmsMap, setFarmsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setIsLoading(true);
    try {
      // 1. Fetch counts in parallel
      const [
        usersRes,
        farmsRes,
        animalsRes,
        milkingRes,
        healthRes
      ] = await Promise.all([
        supabase.from('usuarios').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('farms').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('animals').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('milking_records').select('liters').is('deleted_at', null),
        supabase.from('health_records').select('id').is('deleted_at', null),
      ]);

      const users = usersRes.data || [];
      const farms = farmsRes.data || [];
      const animals = animalsRes.data || [];
      const milking = milkingRes.data || [];
      const health = healthRes.data || [];

      // Map users and farms for quick lookups
      const uMap = {};
      users.forEach(u => { uMap[u.id] = u; });
      setUsersMap(uMap);

      const fMap = {};
      farms.forEach(f => { fMap[f.id] = f; });
      setFarmsMap(fMap);

      const totalLiters = milking.reduce((acc, r) => acc + (Number(r.liters) || 0), 0);
      const activeAnimals = animals.filter(a => a.status === 'Activo').length;
      const femaleCows = animals.filter(a => a.sex === 'Hembra').length;
      const activeUsers = users.filter(u => u.status === 'Activo').length;

      setStats({
        usersCount: users.length,
        activeUsersCount,
        farmsCount: farms.length,
        animalsCount: animals.length,
        activeAnimalsCount: activeAnimals,
        femaleCowsCount: femaleCows,
        totalMilkLiters: Number(totalLiters.toFixed(1)),
        healthRecordsCount: health.length,
      });

      setRecentUsers(users.slice(0, 5));
      setRecentAnimals(animals.slice(0, 5));
    } catch (err) {
      console.error('Error cargando métricas del dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AdminShell title="Vista General">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#173418] to-[#255227] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-[#1B4820]/15">
        <div className="relative z-10 max-w-2xl space-y-2">
          <Badge variant="primary" size="sm" className="bg-white/15 text-emerald-200 border-white/20">
            Control Administrativo Maestro
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Panel de Control Central
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
            Supervisa en tiempo real las operaciones de todos los usuarios, predios ganaderos y rebaños registrados en el sistema.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <BoneyardCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Usuarios"
            value={stats.usersCount}
            subtitle={`${stats.activeUsersCount} usuarios activos`}
            icon={Users}
            color="primary"
          />

          <StatCard
            title="Fincas Registradas"
            value={stats.farmsCount}
            subtitle="Predios en el sistema"
            icon={Building2}
            color="blue"
          />

          <StatCard
            title="Total Ganado"
            value={stats.animalsCount}
            subtitle={`${stats.activeAnimalsCount} ejemplares activos`}
            icon={Layers}
            color="amber"
          />

          <StatCard
            title="Producción Lechera"
            value={`${stats.totalMilkLiters.toLocaleString('es-ES')} L`}
            subtitle="Litros acumulados"
            icon={Milk}
            color="purple"
          />
        </div>
      )}

      {/* Two-Column Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-black text-neutral-900 tracking-tight">
                Usuarios Recientes
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                Últimas cuentas registradas
              </p>
            </div>
            <Link href="/usuarios">
              <Button variant="subtle" size="sm">
                <span>Ver Todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <BoneyardTableSkeleton rows={5} />
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.length === 0 ? (
                    <TableEmpty title="Sin usuarios" message="No se encontraron usuarios en el sistema." colSpan={4} />
                  ) : (
                    recentUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#EEF7EE] text-[#1B4820] font-black text-xs flex items-center justify-center shrink-0 border border-[#1B4820]/15">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-neutral-900 truncate">{u.name || 'Sin nombre'}</p>
                              <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === 'admin' ? 'primary' : u.role === 'veterinario' ? 'info' : 'neutral'}
                            size="sm"
                          >
                            {u.role || 'operador'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.status === 'Activo' ? 'success' : 'danger'}
                            size="sm"
                            dot
                          >
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-neutral-400">
                          {formatDate(u.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>

        {/* Recent Animals Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-black text-neutral-900 tracking-tight">
                Últimos Animales
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                Ejemplares incorporados al inventario
              </p>
            </div>
            <Link href="/animales">
              <Button variant="subtle" size="sm">
                <span>Ver Todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <BoneyardTableSkeleton rows={5} />
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Propietario / Finca</TableHead>
                    <TableHead>Raza</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAnimals.length === 0 ? (
                    <TableEmpty title="Sin animales" message="No se han registrado animales en el inventario." colSpan={4} />
                  ) : (
                    recentAnimals.map((a) => {
                      const owner = usersMap[a.user_id];
                      const farm = farmsMap[a.farm_id];
                      return (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center font-black text-xs text-neutral-700 shrink-0 border border-neutral-200">
                                #{a.number}
                              </div>
                              <div>
                                <span className="font-bold text-neutral-900">
                                  #{a.number}
                                </span>
                                <span className="ml-1 text-[10px] font-bold text-neutral-400">
                                  ({a.sex})
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs leading-tight">
                              <p className="font-bold text-neutral-800 truncate max-w-[140px]">
                                {owner?.name || 'Desconocido'}
                              </p>
                              <p className="text-neutral-400 truncate max-w-[140px]">
                                {farm?.name || 'Sin finca'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded-lg border border-neutral-200/60">
                              {a.breed || 'Mestizo'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/animales/${a.id}`}>
                              <Button variant="ghost" size="sm" className="text-xs text-[#1B4820] font-bold">
                                Detalle
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
