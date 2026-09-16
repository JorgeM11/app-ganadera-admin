'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { useAuth } from '@/context/AuthContext';
import { BoneyardDetailsSkeleton } from '@/components/ui/BoneyardSkeleton';

export default function AdminShell({ children, title }) {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F6F8F4] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-6">
          <BoneyardDetailsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F4] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-72 shrink-0 h-screen sticky top-0 z-40">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-10"
            >
              <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          title={title}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
