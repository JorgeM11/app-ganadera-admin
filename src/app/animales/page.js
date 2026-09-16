'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import Badge from '@/components/rareui/Badge';
import Button from '@/components/rareui/Button';
import SearchInput from '@/components/rareui/SearchInput';
import Tabs from '@/components/rareui/Tabs';
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
import { supabase } from '@/lib/supabaseClient';
import { formatDate, calculateAge, formatWeight } from '@/lib/utils';
import { sileo } from 'sileo';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  Scale,
  Calendar,
  Building2,
  Dna,
  ExternalLink
} from 'lucide-react';

function AnimalesContent() {
  const searchParams = useSearchParams();
  const filterUserIdParam = searchParams.get('user_id');
  const filterFarmIdParam = searchParams.get('farm_id');

  const [animals, setAnimals] = useState([]);
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [farmsMap, setFarmsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState(filterUserIdParam || 'ALL');
  const [selectedFarmFilter, setSelectedFarmFilter] = useState(filterFarmIdParam || 'ALL');
  const [selectedSexFilter, setSelectedSexFilter] = useState('ALL'); // ALL, Macho, Hembra
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL'); // ALL, Activo, Inactivo
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Quick Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    farm_id: '',
    number: '',
    sex: 'Hembra',
    breed: 'Mestizo',
    purity_percentage: 50,
    color: '',
    status: 'Activo',
    birth_date: '',
    last_weight_kg: '',
    observations: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filterUserIdParam) setSelectedUserFilter(filterUserIdParam);
    if (filterFarmIdParam) setSelectedFarmFilter(filterFarmIdParam);
  }, [filterUserIdParam, filterFarmIdParam]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [animalsRes, usersRes, farmsRes] = await Promise.all([
        supabase.from('animals').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('usuarios').select('id, name, email').is('deleted_at', null),
        supabase.from('farms').select('id, name, user_id').is('deleted_at', null),
      ]);

      const animalsList = animalsRes.data || [];
      const usersList = usersRes.data || [];
      const farmsList = farmsRes.data || [];

      const uMap = {};
      usersList.forEach(u => { uMap[u.id] = u; });
      setUsersMap(uMap);
      setUsers(usersList);

      const fMap = {};
      farmsList.forEach(f => { fMap[f.id] = f; });
      setFarmsMap(fMap);
      setFarms(farmsList);

      setAnimals(animalsList);
    } catch (err) {
      console.error('Error cargando animales:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Filtered animals
  const filteredAnimals = useMemo(() => {
    return animals.filter(a => {
      const owner = usersMap[a.user_id];
      const farm = farmsMap[a.farm_id];

      const matchesSearch =
        !searchTerm.trim() ||
        a.number.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (a.breed && a.breed.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (a.color && a.color.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (owner?.name && owner.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (farm?.name && farm.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      const matchesUser =
        selectedUserFilter === 'ALL' || a.user_id === selectedUserFilter;

      const matchesFarm =
        selectedFarmFilter === 'ALL' || a.farm_id === selectedFarmFilter;

      const matchesSex =
        selectedSexFilter === 'ALL' || a.sex === selectedSexFilter;

      const matchesStatus =
        selectedStatusFilter === 'ALL' || a.status === selectedStatusFilter;

      return matchesSearch && matchesUser && matchesFarm && matchesSex && matchesStatus;
    });
  }, [animals, usersMap, farmsMap, searchTerm, selectedUserFilter, selectedFarmFilter, selectedSexFilter, selectedStatusFilter]);

  // Paginated slice
  const paginatedAnimals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnimals.slice(start, start + pageSize);
  }, [filteredAnimals, currentPage, pageSize]);

  // Farms belonging to currently selected user in the modal
  const modalAvailableFarms = useMemo(() => {
    if (!formData.user_id) return farms;
    return farms.filter(f => f.user_id === formData.user_id);
  }, [farms, formData.user_id]);

  // Open Create
  function handleOpenCreate() {
    setEditingAnimal(null);
    setFormData({
      user_id: users[0]?.id || '',
      farm_id: '',
      number: '',
      sex: 'Hembra',
      breed: 'Mestizo',
      purity_percentage: 50,
      color: '',
      status: 'Activo',
      birth_date: new Date().toISOString().split('T')[0],
      last_weight_kg: '',
      observations: ''
    });
    setFormError('');
    setIsModalOpen(true);
  }

  // Open Edit
  function handleOpenEdit(animal) {
    setEditingAnimal(animal);
    setFormData({
      user_id: animal.user_id || '',
      farm_id: animal.farm_id || '',
      number: animal.number || '',
      sex: animal.sex || 'Hembra',
      breed: animal.breed || 'Mestizo',
      purity_percentage: animal.purity_percentage ?? 50,
      color: animal.color || '',
      status: animal.status || 'Activo',
      birth_date: animal.birth_date || '',
      last_weight_kg: animal.last_weight_kg ?? '',
      observations: animal.observations || ''
    });
    setFormError('');
    setIsModalOpen(true);
  }

  // Handle Save
  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.number.trim()) {
      setFormError('El número o código de arete es obligatorio.');
      sileo.warning({
        title: 'Campo obligatorio',
        description: 'El número o arete del animal es requerido.'
      });
      return;
    }
    if (!formData.user_id) {
      setFormError('Debes asignar un propietario para el animal.');
      sileo.warning({
        title: 'Propietario no asignado',
        description: 'Debes seleccionar el usuario dueño del animal.'
      });
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const now = new Date().toISOString();

      if (editingAnimal) {
        // UPDATE
        const updatePayload = {
          user_id: formData.user_id,
          farm_id: formData.farm_id || null,
          number: formData.number.trim(),
          sex: formData.sex,
          breed: formData.breed || 'Mestizo',
          purity_percentage: Number(formData.purity_percentage) || 50,
          color: formData.color.trim() || null,
          status: formData.status,
          birth_date: formData.birth_date || null,
          last_weight_kg: formData.last_weight_kg ? Number(formData.last_weight_kg) : null,
          observations: formData.observations.trim() || null,
          updated_at: now
        };

        const { error } = await supabase
          .from('animals')
          .update(updatePayload)
          .eq('id', editingAnimal.id);

        if (error) throw error;

        setAnimals(prev => prev.map(a => a.id === editingAnimal.id ? { ...a, ...updatePayload } : a));
        setIsModalOpen(false);
        sileo.success({
          title: 'Animal actualizado',
          description: `Los datos del ejemplar #${updatePayload.number} fueron guardados.`
        });
      } else {
        // CREATE
        const newId = globalThis.crypto.randomUUID();
        const insertPayload = {
          id: newId,
          user_id: formData.user_id,
          farm_id: formData.farm_id || null,
          number: formData.number.trim(),
          sex: formData.sex,
          breed: formData.breed || 'Mestizo',
          purity_percentage: Number(formData.purity_percentage) || 50,
          color: formData.color.trim() || null,
          status: formData.status,
          birth_date: formData.birth_date || null,
          last_weight_kg: formData.last_weight_kg ? Number(formData.last_weight_kg) : null,
          observations: formData.observations.trim() || null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        };

        const { error } = await supabase
          .from('animals')
          .insert(insertPayload);

        if (error) throw error;

        setAnimals(prev => [insertPayload, ...prev]);
        setIsModalOpen(false);
        sileo.success({
          title: 'Animal registrado',
          description: `El ejemplar #${insertPayload.number} fue agregado con éxito.`
        });
      }
    } catch (err) {
      setFormError(err.message || 'Error al guardar el animal.');
      sileo.error({
        title: 'Error al procesar',
        description: err.message || 'No se pudo guardar la información del animal.'
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Handle Soft Delete
  async function handleDelete(animal) {
    if (!window.confirm(`¿Estás seguro de eliminar el animal #${animal.number}? Esta acción se reflejará en todo el sistema.`)) {
      return;
    }

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('animals')
        .update({ deleted_at: now, updated_at: now })
        .eq('id', animal.id);

      if (error) throw error;

      setAnimals(prev => prev.filter(a => a.id !== animal.id));
      sileo.success({
        title: 'Animal eliminado',
        description: `El animal #${animal.number} ha sido retirado del sistema.`
      });
    } catch (err) {
      sileo.error({
        title: 'Error al eliminar',
        description: err.message || 'No se pudo retirar el animal.'
      });
    }
  }

  const sexTabs = [
    { id: 'ALL', label: 'Todos', count: animals.length },
    { id: 'Hembra', label: 'Hembras', count: animals.filter(a => a.sex === 'Hembra').length },
    { id: 'Macho', label: 'Machos', count: animals.filter(a => a.sex === 'Macho').length },
  ];

  return (
    <AdminShell title="Gestión de Ganado">
      {/* Header bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Inventario General de Ganado
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Supervisa, edita e inspecciona el ganado de todos los usuarios y fincas registradas.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenCreate}
          className="shadow-md shadow-[#1B4820]/20"
        >
          <span>Nuevo Animal</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Sex filter tabs */}
          <Tabs
            tabs={sexTabs}
            activeTab={selectedSexFilter}
            onChange={(tabId) => {
              setSelectedSexFilter(tabId);
              setCurrentPage(1);
            }}
          />

          {/* Search Box */}
          <div className="w-full lg:w-80">
            <SearchInput
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Buscar por #arete, raza, color..."
            />
          </div>
        </div>

        {/* Secondary filters row (User, Farm, Status) */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100 text-xs">
          {/* Filter by User */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-400">Dueño:</span>
            <select
              value={selectedUserFilter}
              onChange={(e) => {
                setSelectedUserFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1 text-xs text-neutral-800 font-semibold outline-none focus:border-[#1B4820] cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL">Todos los usuarios</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
          </div>

          {/* Filter by Farm */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-400">Finca:</span>
            <select
              value={selectedFarmFilter}
              onChange={(e) => {
                setSelectedFarmFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1 text-xs text-neutral-800 font-semibold outline-none focus:border-[#1B4820] cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL">Todas las fincas</option>
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-400">Estado:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1 text-xs text-neutral-800 font-semibold outline-none focus:border-[#1B4820] cursor-pointer"
            >
              <option value="ALL">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedUserFilter !== 'ALL' || selectedFarmFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedUserFilter('ALL');
                setSelectedFarmFilter('ALL');
                setSelectedStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="text-[#1B4820] font-bold hover:underline ml-auto cursor-pointer"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Animals Table */}
      {isLoading ? (
        <BoneyardTableSkeleton rows={8} />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ejemplar</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Finca</TableHead>
                <TableHead>Raza & Genética</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAnimals.length === 0 ? (
                <TableEmpty
                  title="No se encontraron animales"
                  message="Intenta cambiar los términos de búsqueda o los filtros activos."
                  colSpan={8}
                />
              ) : (
                paginatedAnimals.map((animal) => {
                  const owner = usersMap[animal.user_id];
                  const farm = farmsMap[animal.farm_id];
                  const isFemale = animal.sex === 'Hembra';

                  return (
                    <TableRow key={animal.id}>
                      {/* Number and Sex */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm border shadow-2xs ${
                            isFemale 
                              ? 'bg-pink-50 text-pink-700 border-pink-100' 
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            #{animal.number}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-neutral-900 truncate">
                              #{animal.number}
                            </p>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase">
                              {animal.sex}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Owner */}
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-bold text-neutral-800 truncate max-w-[130px]">
                            {owner?.name || 'Desconocido'}
                          </p>
                          <p className="text-neutral-400 truncate max-w-[130px]">{owner?.email}</p>
                        </div>
                      </TableCell>

                      {/* Farm */}
                      <TableCell>
                        <span className="text-xs text-neutral-700 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{farm?.name || 'Sin finca'}</span>
                        </span>
                      </TableCell>

                      {/* Breed & Purity */}
                      <TableCell>
                        <div className="text-xs">
                          <span className="font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-lg">
                            {animal.breed || 'Mestizo'}
                          </span>
                          {animal.purity_percentage && animal.purity_percentage < 100 && (
                            <span className="ml-1 text-[11px] text-neutral-400 font-bold">
                              {animal.purity_percentage}%
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Weight */}
                      <TableCell>
                        <span className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{formatWeight(animal.last_weight_kg || animal.birth_weight_kg)}</span>
                        </span>
                      </TableCell>

                      {/* Age */}
                      <TableCell className="text-xs text-neutral-500 font-medium">
                        {calculateAge(animal.birth_date)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={animal.status === 'Activo' ? 'success' : 'danger'}
                          size="sm"
                          dot
                        >
                          {animal.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/animales/${animal.id}`}>
                            <Button
                              variant="subtle"
                              size="sm"
                              className="text-xs font-bold"
                              title="Ver ficha completa y registros"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ficha</span>
                            </Button>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(animal)}
                            className="p-2 text-[#1B4820] hover:bg-[#EEF7EE] rounded-xl transition-colors cursor-pointer"
                            title="Editar características"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(animal)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Eliminar ejemplar"
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
            totalItems={filteredAnimals.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </TableContainer>
      )}

      {/* Modal: Quick Edit or Create Animal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnimal ? `Editar Animal #${editingAnimal.number}` : 'Registrar Nuevo Animal'}
        description="Modifica o ingresa los datos base del ejemplar y su asignación."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Número / Arete
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Ej. 104"
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Sexo
              </label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Hembra">Hembra (Vaca / Novilla / Becerro)</option>
                <option value="Macho">Macho (Toro / Torete / Becerro)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Propietario / Usuario
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value, farm_id: '' })}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all cursor-pointer"
              >
                <option value="" disabled>Selecciona usuario...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name ? `${u.name} (${u.email})` : u.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Finca Asignada (Opcional)
              </label>
              <select
                value={formData.farm_id}
                onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all cursor-pointer"
              >
                <option value="">Sin Finca Asignada</option>
                {modalAvailableFarms.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Raza
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="Ej. Brahman, Mestizo, Gyr..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Pureza (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.purity_percentage}
                onChange={(e) => setFormData({ ...formData, purity_percentage: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Peso Actual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.last_weight_kg}
                onChange={(e) => setFormData({ ...formData, last_weight_kg: e.target.value })}
                placeholder="Ej. 420.5"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo / Vendido / Muerto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Detalles sobre señas particulares, origen o notas..."
              rows={2}
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
              {editingAnimal ? 'Guardar Cambios' : 'Registrar Animal'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}

export default function AnimalesPage() {
  return (
    <Suspense fallback={<BoneyardTableSkeleton rows={8} />}>
      <AnimalesContent />
    </Suspense>
  );
}
