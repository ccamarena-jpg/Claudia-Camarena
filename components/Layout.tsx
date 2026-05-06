
import React from 'react';
import { LayoutDashboard, ClipboardCheck, History, Menu, X, Map as MapIcon, LogOut, User as UserIcon, Database } from 'lucide-react';
import { User } from '../types';
import Chatbot from './Chatbot';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'route' | 'history' | 'admin' | 'catalog';
  onTabChange: (tab: 'dashboard' | 'route' | 'history' | 'admin' | 'catalog') => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'route', label: 'Mi Ruta', icon: MapIcon },
    { id: 'history', label: 'Historial', icon: History },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'catalog', label: 'Catálogo PDVs', icon: Database });
    navItems.push({ id: 'admin', label: 'Gestionar Rutas', icon: ClipboardCheck });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#1e3a5f] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-lg tracking-tight">AuditPOS</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-[70] bg-slate-900 text-white w-64 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 hidden md:flex">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <ClipboardCheck size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">AuditPOS</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
            <div className="px-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
                <UserIcon size={20} />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold truncate">{user.name}</div>
                <div className="text-[10px] uppercase text-slate-500 font-bold">{user.role}</div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
        <Chatbot />
      </main>
    </div>
  );
};

export default Layout;
