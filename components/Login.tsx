
import React, { useState } from 'react';
import { ClipboardCheck, User as UserIcon, ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  availableUsers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, availableUsers }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'auditor' | 'admin'>('auditor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin({
      id: crypto.randomUUID(),
      name: name.trim(),
      role
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 bg-blue-600 text-white text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
              <ClipboardCheck size={40} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">AuditPOS</h1>
            <p className="text-blue-100 mt-2 text-sm font-medium">Gestión Inteligente de Rutas</p>
          </div>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
        </div>

        <div className="p-8">
          {!isCreating ? (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Seleccionar Usuario</label>
                <div className="space-y-2">
                  {availableUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => onLogin(user)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 font-bold transition-colors">
                          {user.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[10px] uppercase text-slate-500 font-bold">{user.role}</div>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">O</span></div>
              </div>

              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:border-blue-300 hover:text-blue-600 transition-all text-sm"
              >
                + Crear Nuevo Usuario
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nombre de Usuario</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-500 transition-all text-slate-800 font-medium"
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Rol</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('auditor')}
                    className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      role === 'auditor' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <UserIcon size={24} />
                    <span className="text-xs font-bold uppercase">Auditor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      role === 'admin' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <ShieldCheck size={24} />
                    <span className="text-xs font-bold uppercase">Admin</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all group"
                >
                  Registrar e Ingresar
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              AuditPOS Mobile Suite v4.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
