'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, ArrowRight, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { authenticateAdmin, getAdminSession } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/rareui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authenticateAdmin(email, password);
      if (!result.success) {
        setError(result.message || 'Credenciales incorrectas.');
        return;
      }
      setUser(result.user);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoAdmin = () => {
    setEmail('admin@campo.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F8F4] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Subtle glowing orbs */}
      <div className="w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl absolute -top-24 -right-24 pointer-events-none" />
      <div className="w-80 h-80 bg-[#1B4820]/10 rounded-full blur-3xl absolute -bottom-24 -left-24 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10 flex flex-col items-center"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#143416] via-[#1B4820] to-[#2B6631] flex items-center justify-center shadow-xl shadow-[#1B4820]/25 ring-4 ring-[#1B4820]/10 mb-4 transition-transform hover:scale-105 duration-200">
            <Tractor size={38} strokeWidth={1.75} className="text-emerald-100" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#1B4820] text-[11px] font-bold tracking-wider uppercase mb-2 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal de Administración Web</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            App Ganadera
          </h1>
          <p className="text-xs sm:text-sm font-medium text-neutral-500 mt-1">
            Gestión Global de Usuarios, Fincas y Ganado
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-15px_rgba(27,72,32,0.1)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 px-4 py-3 focus-within:border-[#1B4820] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B4820]/10 transition-all">
                <Mail className="w-4 h-4 text-neutral-400 mr-3 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@campo.com"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent outline-none text-sm text-neutral-800 font-medium placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Contraseña
              </label>
              <div className="relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 px-4 py-3 focus-within:border-[#1B4820] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B4820]/10 transition-all">
                <Lock className="w-4 h-4 text-neutral-400 mr-3 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent outline-none text-sm text-neutral-800 font-medium placeholder:text-neutral-400"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-700 font-medium overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full shadow-lg shadow-[#1B4820]/25"
            >
              <span>Acceder al Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">¿Cuenta admin por defecto?</span>
            <button
              type="button"
              onClick={handleUseDemoAdmin}
              className="text-[#1B4820] font-bold hover:underline cursor-pointer"
            >
              Usar admin@campo.com
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
