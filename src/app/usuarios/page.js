'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import Badge from '@/components/rareui/Badge';
import Button from '@/components/rareui/Button';
import SearchInput from '@/components/rareui/SearchInput';
import Tabs from '@/components/rareui/Tabs';
import Modal from '@/components/rareui/Modal';
import Drawer from '@/components/rareui/Drawer';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TablePagination,
} from '@/components/rareui/Table';
import { BoneyardTableSkeleton } from '@/components/ui/BoneyardSkeleton';
import Select from '@/components/rareui/Select';
import Switch from '@/components/rareui/Switch';
import ConfirmModal from '@/components/rareui/ConfirmModal';
import { supabase } from '@/lib/supabaseClient';
import { hashPassword } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { sileo } from 'sileo';
import {
  UserPlus,
  Pencil,
  Power,
  Building2,
  Layers,
  Search,
  Eye,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  Lock,
  User as UserIcon,
  Filter
} from 'lucide-react';

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [farmsCountByUser, setFarmsCountByUser] = useState({});
  const [animalsCountByUser, setAnimalsCountByUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Activo, Inactivo
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserDrawer, setSelectedUserDrawer] = useState(null);
  const [drawerData, setDrawerData] = useState({ farms: [], animals: [], loading: false });
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    user: null,
    nextStatus: null,
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operador',
    status: 'Activo',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    try {
      // Load users, farms, and animals to compute counts
      const [usersRes, farmsRes, animalsRes] = await Promise.all([
        supabase.from('usuarios').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('farms').select('id, user_id').is('deleted_at', null),
        supabase.from('animals').select('id, user_id').is('deleted_at', null),
      ]);

      const usersList = usersRes.data || [];
      const farmsList = farmsRes.data || [];
      const animalsList = animalsRes.data || [];

      // Counts per user
      const fCounts = {};
      farmsList.forEach(f => {
        if (f.user_id) fCounts[f.user_id] = (fCounts[f.user_id] || 0) + 1;
      });
      setFarmsCountByUser(fCounts);

      const aCounts = {};
      animalsList.forEach(a => {
        if (a.user_id) aCounts[a.user_id] = (aCounts[a.user_id] || 0) + 1;
      });
      setAnimalsCountByUser(aCounts);

      setUsers(usersList);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Filtered users (excluding admin)
  const nonAdminUsers = useMemo(() => {
    return users.filter(user => 
      user.role?.toLowerCase() !== 'admin' &&
      user.email?.toLowerCase() !== 'netgenteam@gmail.com'
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    return nonAdminUsers.filter(user => {
      const matchesSearch = 
        !searchTerm.trim() ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      const matchesStatus = 
        statusFilter === 'ALL' || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [nonAdminUsers, searchTerm, statusFilter]);

  // Paginated slice
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Handle open Drawer with user data
  async function handleOpenDrawer(user) {
    setSelectedUserDrawer(user);
    setDrawerData({ farms: [], animals: [], loading: true });

    try {
      const [fRes, aRes] = await Promise.all([
        supabase.from('farms').select('*').eq('user_id', user.id).is('deleted_at', null),
        supabase.from('animals').select('*').eq('user_id', user.id).is('deleted_at', null),
      ]);
      setDrawerData({
        farms: fRes.data || [],
        animals: aRes.data || [],
        loading: false
      });
    } catch (e) {
      setDrawerData({ farms: [], animals: [], loading: false });
    }
  }

  // Open confirm modal to toggle status
  function handleToggleStatus(user) {
    const nextStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    setStatusModal({
      isOpen: true,
      user,
      nextStatus,
    });
  }

  // Handle Confirm Toggle user status
  async function handleConfirmToggleStatus() {
    if (!statusModal.user) return;
    const { user, nextStatus } = statusModal;

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      if (nextStatus === 'Activo') {
        sileo.success({
          title: 'Cuenta Habilitada',
          description: `El usuario ${user.name || user.email} ahora tiene acceso activo.`
        });
      } else {
        sileo.warning({
          title: 'Cuenta Deshabilitada',
          description: `Se suspendió el acceso a ${user.name || user.email}.`
        });
      }
    } catch (err) {
      sileo.error({
        title: 'Error al cambiar estado',
        description: err.message
      });
    } finally {
      setStatusModal({ isOpen: false, user: null, nextStatus: null });
    }
  }

  // Open Create Modal
  function handleOpenCreate() {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'operador',
      status: 'Activo',
    });
    setFormError('');
    setIsCreateModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(user) {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // blank by default, only update if typed
      role: user.role || 'operador',
      status: user.status || 'Activo',
    });
    setFormError('');
    setIsCreateModalOpen(true);
  }

  // Handle Save (Create or Update)
  async function handleSubmitForm(e) {
    e.preventDefault();
    if (!formData.email.trim()) {
      setFormError('El correo electrónico es requerido.');
      sileo.warning({ title: 'Campo requerido', description: 'Ingresa un correo válido.' });
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const now = new Date().toISOString();

      if (editingUser) {
        // UPDATE
        const updatePayload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          status: formData.status,
          updated_at: now
        };

        if (formData.password.trim()) {
          updatePayload.password_hash = await hashPassword(formData.password.trim());
        }

        const { error } = await supabase
          .from('usuarios')
          .update(updatePayload)
          .eq('id', editingUser.id);

        if (error) throw error;

        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updatePayload } : u));
        setIsCreateModalOpen(false);
        sileo.success({
          title: 'Usuario Actualizado',
          description: `Se guardaron los cambios de ${updatePayload.name}.`
        });
      } else {
        // CREATE
        if (!formData.password.trim()) {
          setFormError('La contraseña es obligatoria para un nuevo usuario.');
          sileo.warning({ title: 'Contraseña requerida', description: 'Ingresa una contraseña para la cuenta.' });
          setIsSaving(false);
          return;
        }

        const passHash = await hashPassword(formData.password.trim());
        const newId = globalThis.crypto.randomUUID();

        const insertPayload = {
          id: newId,
          name: formData.name.trim() || 'Nuevo Usuario',
          email: formData.email.trim().toLowerCase(),
          password_hash: passHash,
          role: formData.role,
          status: formData.status,
          created_at: now,
          updated_at: now
        };

        const { error } = await supabase
          .from('usuarios')
          .insert(insertPayload);

        if (error) throw error;

        setUsers(prev => [insertPayload, ...prev]);
        setIsCreateModalOpen(false);
        sileo.success({
          title: 'Usuario Registrado',
          description: `Cuenta creada exitosamente para ${insertPayload.email}.`
        });
      }
    } catch (err) {
      setFormError(err.message || 'Error al guardar usuario.');
      sileo.error({
        title: 'Error al procesar usuario',
        description: err.message
      });
    } finally {
      setIsSaving(false);
    }
  }

  const statusTabs = [
    { id: 'ALL', label: 'Todos', count: nonAdminUsers.length },
    { id: 'Activo', label: 'Activos', count: nonAdminUsers.filter(u => u.status === 'Activo').length },
    { id: 'Inactivo', label: 'Inactivos', count: nonAdminUsers.filter(u => u.status === 'Inactivo').length },
  ];

  return (
    <AdminShell title="Gestión de Usuarios">
      {/* Header bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Usuarios del Sistema
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Control de cuentas, roles, permisos y asignación de fincas y ganado.
          </p>
        </div>

        <Button
          variant="primary"
          icon={UserPlus}
          onClick={handleOpenCreate}
          className="shadow-md shadow-[#1B4820]/20"
        >
          <span>Crear Usuario</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs">
        <Tabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onChange={(tabId) => {
            setStatusFilter(tabId);
            setCurrentPage(1);
          }}
        />

        <div className="w-full md:w-80">
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre o email..."
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <BoneyardTableSkeleton rows={8} />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fincas</TableHead>
                <TableHead>Animales</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableEmpty
                  title="No se encontraron usuarios"
                  message="Intenta cambiar los términos de búsqueda o el filtro de estado."
                  colSpan={7}
                />
              ) : (
                paginatedUsers.map((user) => {
                  const farmsCount = farmsCountByUser[user.id] || 0;
                  const animalsCount = animalsCountByUser[user.id] || 0;
                  const isActive = user.status === 'Activo';

                  return (
                    <TableRow key={user.id}>
                      {/* Name and Email */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#EEF7EE] text-[#1B4820] font-black text-sm flex items-center justify-center shrink-0 border border-[#1B4820]/15 shadow-2xs">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-neutral-900 truncate">
                              {user.name || 'Sin nombre'}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Badge
                          variant={user.role === 'admin' ? 'primary' : 'neutral'}
                          size="sm"
                        >
                          {user.role === 'admin' ? 'Administrador' : 'Operador'}
                        </Badge>
                      </TableCell>

                      {/* Status Switch */}
                      <TableCell>
                        <Switch
                          checked={isActive}
                          onChange={() => handleToggleStatus(user)}
                          size="sm"
                          label={user.status}
                        />
                      </TableCell>

                      {/* Farms count */}
                      <TableCell>
                        <Link
                          href={`/fincas?user_id=${user.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{farmsCount} fincas</span>
                        </Link>
                      </TableCell>

                      {/* Animals count */}
                      <TableCell>
                        <Link
                          href={`/animales?user_id=${user.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer border border-emerald-200/50"
                        >
                          <Layers className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{animalsCount} animales</span>
                        </Link>
                      </TableCell>

                      {/* Created date */}
                      <TableCell className="text-xs text-neutral-400">
                        {formatDate(user.created_at)}
                      </TableCell>

                      {/* Action buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details drawer */}
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(user)}
                            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                            title="Ver detalles rápidos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit user */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 text-[#1B4820] hover:bg-[#EEF7EE] rounded-xl transition-colors cursor-pointer"
                            title="Editar usuario"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </TableContainer>
      )}

      {/* Modal: Create or Edit User */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        description={
          editingUser
            ? `Modificando los datos de ${editingUser.name || editingUser.email}`
            : 'Asigna credenciales y rol para el nuevo integrante del sistema.'
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Nombre Completo
            </label>
            <div className="relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#1B4820] focus-within:bg-white transition-all">
              <UserIcon className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Juan Pérez"
                required
                className="w-full bg-transparent outline-none text-sm text-neutral-800 font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Correo Electrónico
            </label>
            <div className="relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#1B4820] focus-within:bg-white transition-all">
              <Mail className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@campo.com"
                required
                className="w-full bg-transparent outline-none text-sm text-neutral-800 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso'}
            </label>
            <div className="relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#1B4820] focus-within:bg-white transition-all">
              <Lock className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? 'Dejar en blanco para no cambiar' : '••••••••'}
                required={!editingUser}
                className="w-full bg-transparent outline-none text-sm text-neutral-800 font-medium"
              />
            </div>
          </div>

          {/* Grid Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Rol en el Sistema"
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                options={[
                  { value: 'operador', label: 'Operador' },
                  { value: 'admin', label: 'Administrador' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Estado de la Cuenta"
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                options={[
                  { value: 'Activo', label: 'Activo' },
                  { value: 'Inactivo', label: 'Inactivo / Deshabilitado' },
                ]}
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Drawer: Detailed Inspection of User */}
      <Drawer
        isOpen={!!selectedUserDrawer}
        onClose={() => setSelectedUserDrawer(null)}
        title={selectedUserDrawer?.name || 'Ficha de Usuario'}
        description={selectedUserDrawer?.email}
      >
        {selectedUserDrawer && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Fincas Asignadas
                </span>
                <p className="text-2xl font-black text-neutral-900 mt-1">
                  {drawerData.farms.length}
                </p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Total de Animales
                </span>
                <p className="text-2xl font-black text-emerald-800 mt-1">
                  {drawerData.animals.length}
                </p>
              </div>
            </div>

            {/* Farms list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                  Fincas Registradas ({drawerData.farms.length})
                </h4>
                <Link
                  href={`/fincas?user_id=${selectedUserDrawer.id}`}
                  className="text-xs font-bold text-[#1B4820] hover:underline"
                >
                  Gestionar Fincas &rarr;
                </Link>
              </div>

              {drawerData.farms.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-2">
                  Este usuario aún no tiene fincas registradas.
                </p>
              ) : (
                <div className="space-y-2">
                  {drawerData.farms.map(f => (
                    <div
                      key={f.id}
                      className="p-3 bg-white rounded-2xl border border-neutral-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-neutral-800">{f.name}</p>
                        <p className="text-neutral-400">{f.location || 'Sin ubicación'}</p>
                      </div>
                      <Badge variant="neutral" size="sm">Predio</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Animals list sample */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                  Ganado ({drawerData.animals.length})
                </h4>
                <Link
                  href={`/animales?user_id=${selectedUserDrawer.id}`}
                  className="text-xs font-bold text-[#1B4820] hover:underline"
                >
                  Ver Todo el Ganado &rarr;
                </Link>
              </div>

              {drawerData.animals.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-2">
                  No hay animales registrados para este usuario.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {drawerData.animals.slice(0, 10).map(a => (
                    <Link
                      key={a.id}
                      href={`/animales/${a.id}`}
                      className="p-3 bg-white rounded-2xl border border-neutral-200/80 hover:border-emerald-300 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-neutral-900 group-hover:text-[#1B4820]">
                          #{a.number}
                        </span>
                        <span className="text-neutral-400">({a.sex})</span>
                        <span className="text-neutral-500 font-semibold">{a.breed || 'Mestizo'}</span>
                      </div>
                      <Badge variant={a.status === 'Activo' ? 'success' : 'danger'} size="sm">
                        {a.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-neutral-100 flex gap-2">
              <Button
                variant="subtle"
                className="w-full"
                onClick={() => {
                  setSelectedUserDrawer(null);
                  handleOpenEdit(selectedUserDrawer);
                }}
              >
                <Pencil className="w-4 h-4" />
                <span>Editar Cuenta</span>
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal: Confirm Status Change */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, user: null, nextStatus: null })}
        onConfirm={handleConfirmToggleStatus}
        title={statusModal.nextStatus === 'Inactivo' ? '¿Deshabilitar Usuario?' : '¿Habilitar Usuario?'}
        description={
          statusModal.nextStatus === 'Inactivo'
            ? `Se suspenderá la cuenta de ${statusModal.user?.name || statusModal.user?.email}. El usuario no podrá ingresar ni sincronizar información.`
            : `Se reactivará la cuenta de ${statusModal.user?.name || statusModal.user?.email}. El usuario podrá acceder normalmente al sistema.`
        }
        confirmText={statusModal.nextStatus === 'Inactivo' ? 'Deshabilitar' : 'Habilitar'}
        variant={statusModal.nextStatus === 'Inactivo' ? 'danger' : 'primary'}
      />
    </AdminShell>
  );
}
