import './globals.css';
import 'sileo/styles.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sileo';

export const metadata = {
  title: 'Panel Administrativo - App Ganadera',
  description: 'Portal de administración web y supervisión global para App Ganadera',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F6F8F4] text-[#141713]">
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
