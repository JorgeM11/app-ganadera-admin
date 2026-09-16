# App Ganadera - Portal Web Administrativo (Admin)

Portal web administrativo para la supervisión global, auditoría y gestión integral del sistema **App Ganadera V2**.

---

## 🎯 Propósito
Este sistema es una aplicación **100% Web** construida con **Next.js 16**, **Tailwind CSS v4** y componentes inspirados en **Rare UI** y **Boneyard Skeletons**. 
Permite a los administradores del sistema:
1. **Supervisión Global (Dashboard)**: Métricas consolidadas en tiempo real (total de usuarios, fincas, animales, producción lechera acumulada y tratamientos sanitarios).
2. **Control de Usuarios**:
   - Visualización tabular de todas las cuentas registradas.
   - Creación y edición de usuarios (nombre, correo, rol, contraseña cifrada con SHA-256).
   - Habilitación / Deshabilitación inmediata de cuentas con un solo clic.
   - Inspección rápida en panel lateral (Drawer) con las fincas y ganado asociados al usuario.
3. **Gestión de Fincas**:
   - Tabla general de todos los predios de todos los usuarios.
   - Filtro reactivo por propietario.
   - Creación, edición y reasignación de fincas.
4. **Gestión Integral de Ganado & Ficha Detallada**:
   - Inventario maestro de todos los ejemplares con filtros por sexo, estado, finca y dueño.
   - **Ficha de Detalle y Edición Profunda (`/animales/[id]`)**:
     - Edición de características generales (número, sexo, raza, pureza, color, estado, finca, observaciones).
     - Historial de Pesajes & Crecimiento (`growth_events`) con adición, edición y eliminación.
     - Historial Sanitario (`health_records`) con adición, edición y eliminación.
     - Historial Reproductivo (`services` y `pregnancy_checks`).
     - Control Lechero (`milking_records`) con adición, edición y cálculo de acumulados.

---

## 🛠️ Stack Tecnológico
- **Framework**: Next.js 16 (App Router, JavaScript)
- **Estilos**: Tailwind CSS v4 con paleta institucional "Pastoral Editorial" (`#1B4820`, `#143416`, `#F6F8F4`)
- **Componentes UI**: Inspirados en **Rare UI** (Badges animados con live pulse, StatCards con orbes luminosos, Modals y Drawers elásticos con `framer-motion`)
- **Skeletons**: Diseñados bajo la arquitectura **Boneyard** (`boneyard-js` & `BoneyardSkeleton.jsx`)
- **Backend**: Supabase Cloud (compartiendo exactamente la misma base de datos PostgreSQL y tablas de `App-ganadera-v2`)
- **Seguridad**: Cifrado SHA-256 nativo mediante Web Crypto API

---

## 🚀 Puesta en Marcha

### 1. Variables de Entorno (`.env.local`)
El archivo `.env.local` ya se encuentra configurado con la conexión a Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://awippxgsdwonspjxkmlr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 2. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### 3. Credenciales de Acceso por Defecto
- **Correo**: `admin@campo.com`
- **Contraseña**: `admin123`
- **Rol requerido**: `admin`
- **Estado requerido**: `Activo`

### 4. Compilar para Producción
```bash
npm run build
npm start
```
