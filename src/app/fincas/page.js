'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import Badge from '@/components/rareui/Badge';
import Button from '@/components/rareui/Button';
import SearchInput from '@/components/rareui/SearchInput';
import Modal from '@/components/rareui/Modal';
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
import ConfirmModal from '@/components/rareui/ConfirmModal';
import { supabase } from '@/lib/supabaseClient';
import { formatDate } from '@/lib/utils';
import { sileo } from 'sileo';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Layers,
  MapPin,
  User,
  Filter,
  X
} from 'lucide-react';

function FincasContent() {
  const searchParams = useSearchParams();
  const filterUserIdParam = searchParams.get('user_id');

  const [farms, setFarms] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [animalsCountByFarm, setAnimalsCountByFarm] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState(filterUserIdParam || 'ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [farmToDelete, setFarmToDelete] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    location: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filterUserIdParam) {
      setSelectedUserFilter(filterUserIdParam);
    }
  }, [filterUserIdParam]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [farmsRes, usersRes, animalsRes] = await Promise.all([
        supabase.from('farms').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('usuarios').select('id, name, email').is('deleted_at', null),
        supabase.from('animals').select('id, farm_id').is('deleted_at', null),
      ]);

      const farmsList = farmsRes.data || [];
      const usersList = usersRes.data || [];
      const animalsList = animalsRes.data || [];

      const uMap = {};
      usersList.forEach(u => { uMap[u.id] = u; });
      setUsersMap(uMap);
      setUsers(usersList);

      const aCounts = {};
      animalsList.forEach(a => {
        if (a.farm_id) aCounts[a.farm_id] = (aCounts[a.farm_id] || 0) + 1;
      });
      setAnimalsCountByFarm(aCounts);

      setFarms(farmsList);
    } catch (err) {
      console.error('Error cargando fincas:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Filtered farms
  const filteredFarms = useMemo(() => {
    return farms.filter(f => {
      const owner = usersMap[f.user_id];
      const matchesSearch =
        !searchTerm.trim() ||
        f.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (f.location && f.location.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (owner?.name && owner.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (owner?.email && owner.email.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      const matchesUser =
        selectedUserFilter === 'ALL' || f.user_id === selectedUserFilter;

      return matchesSearch && matchesUser;
    });
  }, [farms, usersMap, searchTerm, selectedUserFilter]);

  // Paginated slice
  const paginatedFarms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFarms.slice(start, start + pageSize);
  }, [filteredFarms, currentPage, pageSize]);

  // Open Create
  function handleOpenCreate() {
    setEditingFarm(null);
    setFormData({
      user_id: users[0]?.id || '',
      name: '',
      location: '',
      description: '',
    });
    setFormError('');
    setIsModalOpen(true);
  }

  // Open Edit
  function handleOpenEdit(farm) {
    setEditingFarm(farm);
    setFormData({
      user_id: farm.user_id || '',
      name: farm.name || '',
      location: farm.location || '',
      description: farm.description || '',
    });
    setFormError('');
    setIsModalOpen(true);
  }

  // Handle Save
  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('El nombre de la finca es obligatorio.');
      sileo.warning({ title: 'Campo requerido', description: 'El nombre de la finca es obligatorio.' });
      return;
    }
    if (!formData.user_id) {
      setFormError('Debes asignar un usuario propietario para la finca.');
      sileo.warning({ title: 'Propietario requerido', description: 'Debes asignar un usuario para la finca.' });
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const now = new Date().toISOString();

      if (editingFarm) {
        // UPDATE
        const updatePayload = {
          user_id: formData.user_id,
          name: formData.name.trim(),
          location: formData.location.trim() || null,
          description: formData.description.trim() || null,
          updated_at: now
        };

        const { error } = await supabase
          .from('farms')
          .update(updatePayload)
          .eq('id', editingFarm.id);

        if (error) throw error;

        setFarms(prev => prev.map(f => f.id === editingFarm.id ? { ...f, ...updatePayload } : f));
        setIsModalOpen(false);
        sileo.success({
          title: 'Finca Actualizada',
          description: `Se guardaron los cambios para "${updatePayload.name}".`
        });
      } else {
        // CREATE
        const newId = globalThis.crypto.randomUUID();
        const insertPayload = {
          id: newId,
          user_id: formData.user_id,
          name: formData.name.trim(),
          location: formData.location.trim() || null,
          description: formData.description.trim() || null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        };

        const { error } = await supabase
          .from('farms')
          .insert(insertPayload);

        if (error) throw error;

        setFarms(prev => [insertPayload, ...prev]);
        setIsModalOpen(false);
        sileo.success({
          title: 'Finca Creada',
          description: `Se registró la finca "${insertPayload.name}" exitosamente.`
        });
      }
    } catch (err) {
      setFormError(err.message || 'Error al guardar la finca.');
      sileo.error({
        title: 'Error al procesar finca',
        description: err.message
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Prompt Soft Delete
  function handleDelete(farm) {
    setFarmToDelete(farm);
  }

  // Handle Confirm Soft Delete
  async function handleConfirmDelete() {
    if (!farmToDelete) return;
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('farms')
        .update({ deleted_at: now, updated_at: now })
        .eq('id', farmToDelete.id);

      if (error) throw error;

      setFarms(prev => prev.filter(f => f.id !== farmToDelete.id));
      sileo.success({
        title: 'Finca Eliminada',
        description: `Se eliminó la finca "${farmToDelete.name}".`
      });
    } catch (err) {
      sileo.error({
        title: 'Error al eliminar finca',
        description: err.message
      });
    } finally {
      setFarmToDelete(null);
    }
  }

  return (
    <AdminShell title="Gestión de Fincas">
      {/* Header bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Fincas y Predios
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Supervisa los predios ganaderos registrados por todos los usuarios del sistema.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenCreate}
          className="shadow-md shadow-[#1B4820]/20"
        >
          <span>Nueva Finca</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <Select
              size="sm"
              value={selectedUserFilter}
              onChange={(val) => {
                setSelectedUserFilter(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: `Todos los usuarios (${users.length})` },
                ...users.map(u => ({ value: u.id, label: u.name || u.email }))
              ]}
            />
          </div>

          {selectedUserFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedUserFilter('ALL')}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors shrink-0"
              title="Quitar filtro de usuario"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full md:w-80">
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar por finca, ubicación o dueño..."
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <BoneyardTableSkeleton rows={8} />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finca</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Ganado Asociado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFarms.length === 0 ? (
                <TableEmpty
                  title="No se encontraron fincas"
                  message="Intenta cambiar los términos de búsqueda o el filtro de usuario."
                  colSpan={6}
                />
              ) : (
                paginatedFarms.map((farm) => {
                  const owner = usersMap[farm.user_id];
                  const animalsCount = animalsCountByFarm[farm.id] || 0;

                  return (
                    <TableRow key={farm.id}>
                      {/* Farm info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#EEF7EE] text-[#1B4820] flex items-center justify-center shrink-0 border border-[#1B4820]/15 shadow-2xs">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-neutral-900 truncate">
                              {farm.name}
                            </p>
                            {farm.description && (
                              <p className="text-xs text-neutral-400 truncate max-w-xs">
                                {farm.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Owner */}
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-bold text-neutral-800">
                            {owner?.name || 'Desconocido'}
                          </p>
                          <p className="text-neutral-400">{owner?.email}</p>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <span className="text-xs text-neutral-600 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{farm.location || 'Sin ubicación'}</span>
                        </span>
                      </TableCell>

                      {/* Associated Animals */}
                      <TableCell>
                        <Link
                          href={`/animales?farm_id=${farm.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer border border-emerald-200/50"
                        >
                          <Layers className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{animalsCount} animales</span>
                        </Link>
                      </TableCell>

                      {/* Created date */}
                      <TableCell className="text-xs text-neutral-400">
                        {formatDate(farm.created_at)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(farm)}
                            className="p-2 text-[#1B4820] hover:bg-[#EEF7EE] rounded-xl transition-colors cursor-pointer"
                            title="Editar finca"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(farm)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Eliminar finca"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalItems={filteredFarms.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </TableContainer>
      )}

      {/* Modal: Create or Edit Farm */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? 'Editar Finca' : 'Registrar Nueva Finca'}
        description="Ingresa los datos del predio ganadero y asigna el propietario."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Nombre de la Finca / Predio
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Hacienda Las Mercedes"
              required
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all"
            />
          </div>

          <div>
            <Select
              label="Propietario / Usuario Asignado"
              value={formData.user_id}
              onChange={(val) => setFormData({ ...formData, user_id: val })}
              placeholder="Selecciona un usuario..."
              options={users.map(u => ({
                value: u.id,
                label: u.name ? `${u.name} (${u.email})` : u.email
              }))}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Ubicación / Sector (Opcional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej. Santa Bárbara del Zulia, Sector El Guayabo"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Descripción / Notas (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Notas sobre potreros, capacidad o características del predio..."
              rows={3}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all resize-none"
            />
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
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              {editingFarm ? 'Guardar Cambios' : 'Registrar Finca'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete Farm */}
      <ConfirmModal
        isOpen={!!farmToDelete}
        onClose={() => setFarmToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`¿Eliminar finca "${farmToDelete?.name}"?`}
        description="Esta acción desvinculará el predio del sistema. Los animales asociados conservarán su información pero quedarán sin finca asignada."
        confirmText="Eliminar Finca"
        variant="danger"
      />
    </AdminShell>
  );
}

export default function FincasPage() {
  return (
    <Suspense fallback={<BoneyardTableSkeleton rows={8} />}>
      <FincasContent />
    </Suspense>
  );
}
