import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return '---';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    const d = new Date(dateStr);
    return isNaN(d) ? '---' : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    return isNaN(d) ? '---' : d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatWeight(weight) {
  if (weight === undefined || weight === null || weight === '') return '---';
  return `${Number(weight).toLocaleString('es-ES')} kg`;
}

export function calculateAge(birthDate) {
  if (!birthDate) return 'Desconocida';
  try {
    const birth = new Date(birthDate.includes('T') ? birthDate : `${birthDate}T00:00:00`);
    const now = new Date();
    if (isNaN(birth)) return '---';

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years >= 1) {
      return months > 0 ? `${years}a ${months}m` : `${years} años`;
    }
    if (months >= 1) return `${months} meses`;

    const diffTime = Math.abs(now - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} días`;
  } catch (e) {
    return '---';
  }
}
