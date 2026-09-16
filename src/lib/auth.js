import { supabase } from './supabaseClient';

/**
 * SHA-256 password hashing matching App-ganadera-v2 authService.js
 */
export async function hashPassword(plainText) {
  if (!plainText) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Seeds default admin if database table is empty
 */
export async function seedDefaultAdminIfNeeded() {
  const defaultAdminEmail = 'admin@campo.com';
  const defaultPass = 'admin123';
  const passHash = await hashPassword(defaultPass);

  try {
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', defaultAdminEmail)
      .limit(1);

    if (!error && (!users || users.length === 0)) {
      await supabase.from('usuarios').insert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Administrador Principal',
        email: defaultAdminEmail,
        password_hash: passHash,
        role: 'admin',
        status: 'Activo'
      });
      console.log('[Admin Auth] Usuario admin por defecto creado en Supabase.');
    }
  } catch (err) {
    console.warn('[Admin Auth] Error verificando admin por defecto:', err.message);
  }
}

/**
 * Authenticates an admin user
 */
export async function authenticateAdmin(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const passHash = await hashPassword(password);

  // Asegurar admin por defecto si es necesario
  await seedDefaultAdminIfNeeded();

  const { data: users, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', cleanEmail)
    .limit(1);

  if (error) {
    throw new Error('Error al conectar con el servidor: ' + error.message);
  }

  if (!users || users.length === 0) {
    return { success: false, message: 'Usuario no encontrado.' };
  }

  const user = users[0];

  if (user.status !== 'Activo') {
    return { success: false, message: `Cuenta deshabilitada (Estado: ${user.status}). Contacte al soporte.` };
  }

  if (user.role !== 'admin') {
    return { success: false, message: 'Acceso denegado. Se requieren privilegios de Administrador para acceder a este portal.' };
  }

  if (user.password_hash !== passHash) {
    return { success: false, message: 'Contraseña incorrecta.' };
  }

  // Guardar sesión
  saveAdminSession(user);
  return { success: true, user };
}

export function saveAdminSession(user) {
  if (typeof window === 'undefined') return;
  const sessionData = {
    id: user.id,
    name: user.name || 'Administrador',
    email: user.email,
    role: user.role,
    loggedInAt: new Date().toISOString()
  };
  localStorage.setItem('ganadera_admin_session', JSON.stringify(sessionData));
}

export function getAdminSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ganadera_admin_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ganadera_admin_session');
}
