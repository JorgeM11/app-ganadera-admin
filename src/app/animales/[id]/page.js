'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import Badge from '@/components/rareui/Badge';
import Button from '@/components/rareui/Button';
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
} from '@/components/rareui/Table';
import { BoneyardDetailsSkeleton } from '@/components/ui/BoneyardSkeleton';
import { supabase } from '@/lib/supabaseClient';
import { formatDate, calculateAge, formatWeight } from '@/lib/utils';
import { sileo } from 'sileo';
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
  Building2,
  User,
  Scale,
  Calendar,
  Dna,
  ShieldPlus,
  TrendingUp,
  HeartHandshake,
  Milk,
  Share2,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AnimalDetailPage({ params }) {
  // Unwrap params using React.use for Next.js 15/16 App Router
  const resolvedParams = use(params);
  const animalId = resolvedParams.id;
  const router = useRouter();

  const [animal, setAnimal] = useState(null);
  const [owner, setOwner] = useState(null);
  const [farm, setFarm] = useState(null);
  const [father, setFather] = useState(null);
  const [mother, setMother] = useState(null);

  const [growthEvents, setGrowthEvents] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [services, setServices] = useState([]);
  const [pregnancyChecks, setPregnancyChecks] = useState([]);
  const [milkingRecords, setMilkingRecords] = useState([]);

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Animal Main Modal
  const [isEditMainOpen, setIsEditMainOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [farmsList, setFarmsList] = useState([]);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Sub-record modals
  const [eventModal, setEventModal] = useState({ open: false, data: null });
  const [healthModal, setHealthModal] = useState({ open: false, data: null });
  const [serviceModal, setServiceModal] = useState({ open: false, data: null });
  const [checkModal, setCheckModal] = useState({ open: false, data: null });
  const [milkingModal, setMilkingModal] = useState({ open: false, data: null });

  useEffect(() => {
    if (animalId) loadAnimalDetails();
  }, [animalId]);

  async function loadAnimalDetails() {
    setIsLoading(true);
    try {
      // 1. Fetch animal
      const { data: aData, error: aErr } = await supabase
        .from('animals')
        .select('*')
        .eq('id', animalId)
        .single();

      if (aErr || !aData) {
        console.error('Error cargando animal:', aErr);
        setIsLoading(false);
        return;
      }

      setAnimal(aData);

      // 2. Fetch related details in parallel
      const [
        ownerRes,
        farmRes,
        fatherRes,
        motherRes,
        growthRes,
        healthRes,
        servicesRes,
        checksRes,
        milkingRes,
        allUsersRes,
        allFarmsRes
      ] = await Promise.all([
        aData.user_id ? supabase.from('usuarios').select('*').eq('id', aData.user_id).single() : { data: null },
        aData.farm_id ? supabase.from('farms').select('*').eq('id', aData.farm_id).single() : { data: null },
        aData.father_id ? supabase.from('animals').select('id, number, breed').eq('id', aData.father_id).single() : { data: null },
        aData.mother_id ? supabase.from('animals').select('id, number, breed').eq('id', aData.mother_id).single() : { data: null },
        supabase.from('growth_events').select('*').eq('animal_id', animalId).is('deleted_at', null).order('event_date', { ascending: false }),
        supabase.from('health_records').select('*').eq('animal_id', animalId).is('deleted_at', null).order('application_date', { ascending: false }),
        supabase.from('services').select('*').eq('mother_id', animalId).is('deleted_at', null).order('service_date', { ascending: false }),
        supabase.from('pregnancy_checks').select('*').eq('animal_id', animalId).is('deleted_at', null).order('check_date', { ascending: false }),
        supabase.from('milking_records').select('*').eq('animal_id', animalId).is('deleted_at', null).order('milking_date', { ascending: false }),
        supabase.from('usuarios').select('id, name, email').is('deleted_at', null),
        supabase.from('farms').select('id, name, user_id').is('deleted_at', null),
      ]);

      setOwner(ownerRes.data);
      setFarm(farmRes.data);
      setFather(fatherRes.data);
      setMother(motherRes.data);

      setGrowthEvents(growthRes.data || []);
      setHealthRecords(healthRes.data || []);
      setServices(servicesRes.data || []);
      setPregnancyChecks(checksRes.data || []);
      setMilkingRecords(milkingRes.data || []);

      setUsersList(allUsersRes.data || []);
      setFarmsList(allFarmsRes.data || []);
    } catch (err) {
      console.error('Error detallado:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Open Edit Main Animal
  function handleOpenEditMain() {
    if (!animal) return;
    setEditFormData({
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
    setIsEditMainOpen(true);
  }

  // Save Main Animal
  async function handleSaveMain(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatePayload = {
        user_id: editFormData.user_id,
        farm_id: editFormData.farm_id || null,
        number: editFormData.number.trim(),
        sex: editFormData.sex,
        breed: editFormData.breed || 'Mestizo',
        purity_percentage: Number(editFormData.purity_percentage) || 50,
        color: editFormData.color?.trim() || null,
        status: editFormData.status,
        birth_date: editFormData.birth_date || null,
        last_weight_kg: editFormData.last_weight_kg ? Number(editFormData.last_weight_kg) : null,
        observations: editFormData.observations?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('animals')
        .update(updatePayload)
        .eq('id', animalId);

      if (error) throw error;

      setAnimal(prev => ({ ...prev, ...updatePayload }));
      setIsEditMainOpen(false);
      sileo.success({
        title: 'Animal actualizado',
        description: `Ficha del ejemplar #${updatePayload.number} guardada correctamente.`
      });
      loadAnimalDetails(); // refresh related fields
    } catch (err) {
      sileo.error({
        title: 'Error al actualizar',
        description: err.message || 'No se pudieron guardar los datos.'
      });
    } finally {
      setIsSaving(false);
    }
  }

  // --- SUB-RECORDS HANDLERS (GROWTH EVENTS) ---
  async function handleSaveGrowthEvent(e) {
    e.preventDefault();
    const form = e.target;
    const eventId = eventModal.data?.id;
    const now = new Date().toISOString();

    const payload = {
      user_id: animal.user_id,
      animal_id: animal.id,
      event_type: form.event_type.value,
      event_date: form.event_date.value,
      weight_kg: form.weight_kg.value ? Number(form.weight_kg.value) : null,
      scrotal_circumference_cm: form.scrotal.value ? Number(form.scrotal.value) : null,
      navel_length: form.navel.value || null,
      observations: form.observations.value?.trim() || null,
      updated_at: now
    };

    try {
      if (eventId) {
        await supabase.from('growth_events').update(payload).eq('id', eventId);
      } else {
        payload.id = globalThis.crypto.randomUUID();
        payload.created_at = now;
        await supabase.from('growth_events').insert(payload);
      }
      setEventModal({ open: false, data: null });
      sileo.success({
        title: eventId ? 'Evento actualizado' : 'Pesaje registrado',
        description: 'El evento de evolución corporal ha sido guardado.'
      });
      loadAnimalDetails();
    } catch (err) {
      sileo.error({
        title: 'Error al registrar evento',
        description: err.message || 'No se pudo guardar el evento de crecimiento.'
      });
    }
  }

  async function handleDeleteGrowthEvent(id) {
    if (!window.confirm('¿Eliminar este evento de crecimiento?')) return;
    try {
      const { error } = await supabase.from('growth_events').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setGrowthEvents(prev => prev.filter(e => e.id !== id));
      sileo.success({
        title: 'Evento retirado',
        description: 'El evento de evolución corporal fue eliminado.'
      });
    } catch (err) {
      sileo.error({
        title: 'Error al eliminar',
        description: err.message || 'No se pudo retirar el evento.'
      });
    }
  }

  // --- SUB-RECORDS HANDLERS (HEALTH RECORDS) ---
  async function handleSaveHealthRecord(e) {
    e.preventDefault();
    const form = e.target;
    const recordId = healthModal.data?.id;
    const now = new Date().toISOString();

    const payload = {
      user_id: animal.user_id,
      animal_id: animal.id,
      product_type: form.product_type.value,
      product_name: form.product_name.value.trim(),
      dose: form.dose.value.trim() || null,
      application_date: form.application_date.value,
      updated_at: now
    };

    try {
      if (recordId) {
        await supabase.from('health_records').update(payload).eq('id', recordId);
      } else {
        payload.id = globalThis.crypto.randomUUID();
        payload.created_at = now;
        await supabase.from('health_records').insert(payload);
      }
      setHealthModal({ open: false, data: null });
      sileo.success({
        title: recordId ? 'Tratamiento actualizado' : 'Tratamiento aplicado',
        description: `Medicamento ${payload.product_name} registrado en el historial sanitario.`
      });
      loadAnimalDetails();
    } catch (err) {
      sileo.error({
        title: 'Error al guardar tratamiento',
        description: err.message || 'No se pudo registrar la aplicación del producto.'
      });
    }
  }

  async function handleDeleteHealthRecord(id) {
    if (!window.confirm('¿Eliminar este registro médico?')) return;
    try {
      const { error } = await supabase.from('health_records').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setHealthRecords(prev => prev.filter(r => r.id !== id));
      sileo.success({
        title: 'Tratamiento eliminado',
        description: 'El registro médico ha sido retirado del historial.'
      });
    } catch (err) {
      sileo.error({
        title: 'Error al eliminar',
        description: err.message || 'No se pudo eliminar el registro médico.'
      });
    }
  }

  // --- SUB-RECORDS HANDLERS (MILKING RECORDS) ---
  async function handleSaveMilkingRecord(e) {
    e.preventDefault();
    const form = e.target;
    const recordId = milkingModal.data?.id;
    const now = new Date().toISOString();

    const payload = {
      user_id: animal.user_id,
      animal_id: animal.id,
      farm_id: animal.farm_id,
      milking_date: form.milking_date.value,
      shift: form.shift.value,
      liters: Number(form.liters.value),
      observations: form.observations.value?.trim() || null,
      updated_at: now
    };

    try {
      if (recordId) {
        await supabase.from('milking_records').update(payload).eq('id', recordId);
      } else {
        payload.id = globalThis.crypto.randomUUID();
        payload.created_at = now;
        await supabase.from('milking_records').insert(payload);
      }
      setMilkingModal({ open: false, data: null });
      sileo.success({
        title: recordId ? 'Ordeño actualizado' : 'Ordeño registrado',
        description: `Pesaje de ${payload.liters} L registrado exitosamente.`
      });
      loadAnimalDetails();
    } catch (err) {
      sileo.error({
        title: 'Error al guardar ordeño',
        description: err.message || 'No se pudo guardar el registro de producción.'
      });
    }
  }

  async function handleDeleteMilkingRecord(id) {
    if (!window.confirm('¿Eliminar este registro de ordeño?')) return;
    try {
      const { error } = await supabase.from('milking_records').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setMilkingRecords(prev => prev.filter(r => r.id !== id));
      sileo.success({
        title: 'Ordeño eliminado',
        description: 'El registro de producción lechera fue retirado.'
      });
    } catch (err) {
      sileo.error({
        title: 'Error al eliminar',
        description: err.message || 'No se pudo eliminar el registro de ordeño.'
      });
    }
  }

  // Tab definitions
  const tabs = [
    { id: 'general', label: 'Ficha General', icon: Eye },
    { id: 'growth', label: 'Evolución / Pesajes', icon: TrendingUp, count: growthEvents.length },
    { id: 'health', label: 'Salud', icon: ShieldPlus, count: healthRecords.length },
    { id: 'reproduction', label: 'Reproducción', icon: HeartHandshake, count: services.length + pregnancyChecks.length },
  ];

  if (animal?.sex === 'Hembra') {
    tabs.push({ id: 'milking', label: 'Ordeño', icon: Milk, count: milkingRecords.length });
  }

  if (isLoading) {
    return (
      <AdminShell title="Cargando Ficha...">
        <BoneyardDetailsSkeleton />
      </AdminShell>
    );
  }

  if (!animal) {
    return (
      <AdminShell title="Animal No Encontrado">
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-xl font-black text-neutral-900">Ejemplar No Encontrado</h3>
          <p className="text-sm text-neutral-500">
            El animal solicitado no existe en la base de datos o fue eliminado.
          </p>
          <Link href="/animales">
            <Button variant="primary">Volver al Listado</Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  const isFemale = animal.sex === 'Hembra';

  return (
    <AdminShell title={`Ficha Animal #${animal.number}`}>
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/animales')}
            className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight leading-none">
                Ejemplar #{animal.number}
              </h2>
              <Badge variant={animal.status === 'Activo' ? 'success' : 'danger'} size="sm" dot>
                {animal.status}
              </Badge>
              <Badge variant={isFemale ? 'primary' : 'info'} size="sm">
                {animal.sex}
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 font-medium mt-1">
              ID Sistema: {animal.id}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Pencil}
          onClick={handleOpenEditMain}
          className="shadow-md shadow-[#1B4820]/20"
        >
          <span>Editar Características</span>
        </Button>
      </div>

      {/* Top Profile Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Propietario Card */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4 text-neutral-400" />
            <span>Propietario</span>
          </div>
          <p className="text-base font-black text-neutral-900 truncate">
            {owner?.name || 'Desconocido'}
          </p>
          <p className="text-xs text-neutral-500 truncate">{owner?.email}</p>
        </div>

        {/* Finca Card */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-neutral-400" />
            <span>Finca Asignada</span>
          </div>
          <p className="text-base font-black text-neutral-900 truncate">
            {farm?.name || 'Sin Finca Asignada'}
          </p>
          <p className="text-xs text-neutral-500 truncate">{farm?.location || 'Sin ubicación'}</p>
        </div>

        {/* Raza & Genética Card */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <Dna className="w-4 h-4 text-neutral-400" />
            <span>Raza & Genética</span>
          </div>
          <p className="text-base font-black text-neutral-900 truncate">
            {animal.breed || 'Mestizo'}
          </p>
          <p className="text-xs text-neutral-500">
            {animal.purity_percentage ? `${animal.purity_percentage}% pureza` : 'Sin porcentaje'}
          </p>
        </div>

        {/* Peso y Edad Card */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-neutral-400" />
            <span>Peso & Edad</span>
          </div>
          <p className="text-base font-black text-emerald-800 truncate">
            {formatWeight(animal.last_weight_kg || animal.birth_weight_kg)}
          </p>
          <p className="text-xs text-neutral-500">
            {calculateAge(animal.birth_date)} (Nac: {formatDate(animal.birth_date)})
          </p>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="bg-white p-3 rounded-3xl border border-neutral-200/80 shadow-xs overflow-x-auto">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* TAB 1: FICHA GENERAL */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identificación y Atributos */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-neutral-900 border-b border-neutral-100 pb-3">
              Datos Generales del Ejemplar
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Número de Arete:</span>
                <p className="font-black text-neutral-800 text-base mt-0.5">#{animal.number}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sexo:</span>
                <p className="font-bold text-neutral-800 mt-0.5">{animal.sex}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Color / Pelaje:</span>
                <p className="font-bold text-neutral-800 mt-0.5">{animal.color || 'No especificado'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Estado Actual:</span>
                <p className="font-bold text-neutral-800 mt-0.5">{animal.status}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Fecha de Nacimiento:</span>
                <p className="font-bold text-neutral-800 mt-0.5">{formatDate(animal.birth_date)}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Peso al Nacer:</span>
                <p className="font-bold text-neutral-800 mt-0.5">{formatWeight(animal.birth_weight_kg)}</p>
              </div>
            </div>

            {animal.observations && (
              <div className="pt-3 border-t border-neutral-100">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Observaciones:</span>
                <p className="text-xs text-neutral-600 italic mt-1 leading-relaxed bg-neutral-50 p-3 rounded-2xl border border-neutral-200/60">
                  "{animal.observations}"
                </p>
              </div>
            )}
          </div>

          {/* Genealogía & Progenitores */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-neutral-900 border-b border-neutral-100 pb-3">
              Linaje & Progenitores
            </h3>
            <div className="space-y-3">
              {/* Padre */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Padre (Toro)</span>
                  <p className="font-black text-neutral-800 text-sm mt-0.5">
                    {father ? `#${father.number} (${father.breed || 'Sin raza'})` : 'Sin registrar'}
                  </p>
                </div>
                {father && (
                  <Link href={`/animales/${father.id}`}>
                    <Button variant="subtle" size="sm">Ver Ficha</Button>
                  </Link>
                )}
              </div>

              {/* Madre */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Madre (Vaca)</span>
                  <p className="font-black text-neutral-800 text-sm mt-0.5">
                    {mother ? `#${mother.number} (${mother.breed || 'Sin raza'})` : 'Sin registrar'}
                  </p>
                </div>
                {mother && (
                  <Link href={`/animales/${mother.id}`}>
                    <Button variant="subtle" size="sm">Ver Ficha</Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Composición Mestiza si existe */}
            {animal.breed_composition && typeof animal.breed_composition === 'object' && Object.keys(animal.breed_composition).length > 0 && (
              <div className="pt-3 border-t border-neutral-100">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Composición Genética Detallada:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(animal.breed_composition).map(([raza, pct]) => (
                    <Badge key={raza} variant="warning" size="sm">
                      {raza}: {pct}%
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EVOLUCIÓN & CRECIMIENTO */}
      {activeTab === 'growth' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-neutral-900">
              Historial de Pesajes y Eventos ({growthEvents.length})
            </h3>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setEventModal({ open: true, data: null })}
            >
              <span>Registrar Evento</span>
            </Button>
          </div>

          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Evento</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>Circ. Escrotal (cm)</TableHead>
                  <TableHead>Largo Ombligo</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {growthEvents.length === 0 ? (
                  <TableEmpty title="Sin eventos de crecimiento" message="No se han registrado pesajes para este animal." colSpan={7} />
                ) : (
                  growthEvents.map((evt) => (
                    <TableRow key={evt.id}>
                      <TableCell>
                        <Badge variant="primary" size="sm">{evt.event_type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(evt.event_date)}</TableCell>
                      <TableCell className="font-bold text-neutral-900">
                        {evt.weight_kg ? `${evt.weight_kg} kg` : '---'}
                      </TableCell>
                      <TableCell className="text-xs">{evt.scrotal_circumference_cm ? `${evt.scrotal_circumference_cm} cm` : '---'}</TableCell>
                      <TableCell className="text-xs">{evt.navel_length || '---'}</TableCell>
                      <TableCell className="text-xs text-neutral-500 max-w-xs truncate">
                        {evt.observations || '---'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEventModal({ open: true, data: evt })}
                            className="p-1.5 text-[#1B4820] hover:bg-[#EEF7EE] rounded-lg"
                            title="Editar evento"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGrowthEvent(evt.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* TAB 3: SALUD */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-neutral-900">
              Carnet Sanitario & Tratamientos ({healthRecords.length})
            </h3>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setHealthModal({ open: true, data: null })}
            >
              <span>Nuevo Tratamiento</span>
            </Button>
          </div>

          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Dosis</TableHead>
                  <TableHead>Fecha de Aplicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthRecords.length === 0 ? (
                  <TableEmpty title="Sin tratamientos médicos" message="No se han registrado aplicaciones de salud." colSpan={5} />
                ) : (
                  healthRecords.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>
                        <Badge
                          variant={
                            rec.product_type === 'Vacuna' ? 'success' :
                            rec.product_type === 'Desparasitante' ? 'warning' :
                            rec.product_type === 'Antibiótico' ? 'danger' : 'info'
                          }
                          size="sm"
                        >
                          {rec.product_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-neutral-900">{rec.product_name}</TableCell>
                      <TableCell className="text-xs">{rec.dose || 'No especificada'}</TableCell>
                      <TableCell className="text-xs">{formatDate(rec.application_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setHealthModal({ open: true, data: rec })}
                            className="p-1.5 text-[#1B4820] hover:bg-[#EEF7EE] rounded-lg"
                            title="Editar tratamiento"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHealthRecord(rec.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar tratamiento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* TAB 4: REPRODUCCIÓN */}
      {activeTab === 'reproduction' && (
        <div className="space-y-6">
          {/* Servicios */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
              Servicios / Montas ({services.length})
            </h4>
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Padre / Pajuela</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableEmpty title="Sin servicios registrados" colSpan={3} />
                  ) : (
                    services.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Badge variant="primary" size="sm">{s.type_conception || 'Servicio'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(s.service_date)}</TableCell>
                        <TableCell className="text-xs font-bold text-neutral-800">
                          {s.father_id ? `Toro ID: ${s.father_id}` : 'No especificado'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Palpaciones / Tactos */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
              Palpaciones / Tactos Reproductivos ({pregnancyChecks.length})
            </h4>
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pregnancyChecks.length === 0 ? (
                    <TableEmpty title="Sin palpaciones registradas" colSpan={3} />
                  ) : (
                    pregnancyChecks.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Badge variant={c.result === 'Preñada' ? 'success' : 'danger'} size="sm" dot>
                            {c.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(c.check_date)}</TableCell>
                        <TableCell className="text-xs text-neutral-500">{c.observations || '---'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      )}

      {/* TAB 5: ORDEÑO LECHERO */}
      {activeTab === 'milking' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-neutral-900">
              Control Lechero & Ordeños ({milkingRecords.length})
            </h3>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setMilkingModal({ open: true, data: null })}
            >
              <span>Registrar Ordeño</span>
            </Button>
          </div>

          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Producción</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milkingRecords.length === 0 ? (
                  <TableEmpty title="Sin registros de ordeño" message="No se han registrado pesajes de leche para esta vaca." colSpan={5} />
                ) : (
                  milkingRecords.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs">{formatDate(m.milking_date)}</TableCell>
                      <TableCell>
                        <Badge variant="info" size="sm">{m.shift}</Badge>
                      </TableCell>
                      <TableCell className="font-black text-[#1B4820] text-sm">
                        {m.liters} Litros
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500 max-w-xs truncate">
                        {m.observations || '---'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setMilkingModal({ open: true, data: m })}
                            className="p-1.5 text-[#1B4820] hover:bg-[#EEF7EE] rounded-lg"
                            title="Editar ordeño"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMilkingRecord(m.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar ordeño"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* Modal: Edit Main Animal */}
      <Modal
        isOpen={isEditMainOpen}
        onClose={() => setIsEditMainOpen(false)}
        title={`Editar Animal #${animal.number}`}
        description="Actualiza las características principales y la asignación del animal."
      >
        <form onSubmit={handleSaveMain} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Número / Arete
              </label>
              <input
                type="text"
                value={editFormData.number || ''}
                onChange={(e) => setEditFormData({ ...editFormData, number: e.target.value })}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Sexo
              </label>
              <select
                value={editFormData.sex || 'Hembra'}
                onChange={(e) => setEditFormData({ ...editFormData, sex: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Hembra">Hembra</option>
                <option value="Macho">Macho</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Propietario
              </label>
              <select
                value={editFormData.user_id || ''}
                onChange={(e) => setEditFormData({ ...editFormData, user_id: e.target.value })}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all cursor-pointer"
              >
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Finca
              </label>
              <select
                value={editFormData.farm_id || ''}
                onChange={(e) => setEditFormData({ ...editFormData, farm_id: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-bold outline-none focus:border-[#1B4820] focus:bg-white transition-all cursor-pointer"
              >
                <option value="">Sin Finca Asignada</option>
                {farmsList.map(f => (
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
                value={editFormData.breed || ''}
                onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Pureza (%)
              </label>
              <input
                type="number"
                value={editFormData.purity_percentage ?? ''}
                onChange={(e) => setEditFormData({ ...editFormData, purity_percentage: e.target.value })}
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
                value={editFormData.last_weight_kg ?? ''}
                onChange={(e) => setEditFormData({ ...editFormData, last_weight_kg: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Estado
              </label>
              <select
                value={editFormData.status || 'Activo'}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
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
              value={editFormData.observations || ''}
              onChange={(e) => setEditFormData({ ...editFormData, observations: e.target.value })}
              rows={2}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-sm text-neutral-800 font-medium outline-none focus:border-[#1B4820] focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditMainOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Growth Event (Add/Edit) */}
      <Modal
        isOpen={eventModal.open}
        onClose={() => setEventModal({ open: false, data: null })}
        title={eventModal.data ? 'Editar Evento de Crecimiento' : 'Registrar Evento de Crecimiento'}
      >
        <form onSubmit={handleSaveGrowthEvent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Tipo de Evento</label>
              <select name="event_type" defaultValue={eventModal.data?.event_type || 'Pesaje'} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm">
                <option value="Nacimiento">Nacimiento</option>
                <option value="Destete">Destete</option>
                <option value="Peso a los 12 meses">Peso a los 12 meses</option>
                <option value="Peso a los 18 meses">Peso a los 18 meses</option>
                <option value="Pesaje">Pesaje Periódico</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Fecha</label>
              <input type="date" name="event_date" defaultValue={eventModal.data?.event_date || new Date().toISOString().split('T')[0]} required className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Peso (kg)</label>
              <input type="number" step="0.1" name="weight_kg" defaultValue={eventModal.data?.weight_kg || ''} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Circ. Escrotal (cm)</label>
              <input type="number" step="0.1" name="scrotal" defaultValue={eventModal.data?.scrotal_circumference_cm || ''} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Ombligo (1-9)</label>
              <input type="text" maxLength={1} name="navel" defaultValue={eventModal.data?.navel_length || ''} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Observaciones</label>
            <input type="text" name="observations" defaultValue={eventModal.data?.observations || ''} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button variant="secondary" onClick={() => setEventModal({ open: false, data: null })}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar Evento</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Health Record (Add/Edit) */}
      <Modal
        isOpen={healthModal.open}
        onClose={() => setHealthModal({ open: false, data: null })}
        title={healthModal.data ? 'Editar Tratamiento Médico' : 'Registrar Tratamiento Médico'}
      >
        <form onSubmit={handleSaveHealthRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Categoría</label>
              <select name="product_type" defaultValue={healthModal.data?.product_type || 'Vacuna'} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm">
                <option value="Vacuna">Vacuna</option>
                <option value="Desparasitante">Desparasitante</option>
                <option value="Vitamina">Vitamina</option>
                <option value="Antibiótico">Antibiótico</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Fecha</label>
              <input type="date" name="application_date" defaultValue={healthModal.data?.application_date || new Date().toISOString().split('T')[0]} required className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Nombre del Medicamento</label>
              <input type="text" name="product_name" defaultValue={healthModal.data?.product_name || ''} placeholder="Ej. Ivermectina 1%" required className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Dosis (ml / cc)</label>
              <input type="text" name="dose" defaultValue={healthModal.data?.dose || ''} placeholder="Ej. 5 ml" className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button variant="secondary" onClick={() => setHealthModal({ open: false, data: null })}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar Tratamiento</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Milking Record (Add/Edit) */}
      <Modal
        isOpen={milkingModal.open}
        onClose={() => setMilkingModal({ open: false, data: null })}
        title={milkingModal.data ? 'Editar Registro de Ordeño' : 'Registrar Ordeño'}
      >
        <form onSubmit={handleSaveMilkingRecord} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Fecha</label>
              <input type="date" name="milking_date" defaultValue={milkingModal.data?.milking_date || new Date().toISOString().split('T')[0]} required className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Turno</label>
              <select name="shift" defaultValue={milkingModal.data?.shift || 'Mañana'} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm">
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Único">Único</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Litros</label>
              <input type="number" step="0.1" min="0" name="liters" defaultValue={milkingModal.data?.liters || ''} required className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm font-bold" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Observaciones</label>
            <input type="text" name="observations" defaultValue={milkingModal.data?.observations || ''} placeholder="Notas sobre el pesaje..." className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 text-sm" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button variant="secondary" onClick={() => setMilkingModal({ open: false, data: null })}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar Ordeño</Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
