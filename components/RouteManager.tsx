
import React, { useState } from 'react';
import { Plus, Trash2, User as UserIcon, Store, Save, CheckCircle2, Search, ArrowRight, Database, Map as MapIcon, FileJson, List, AlertCircle } from 'lucide-react';
import { User, Route, AssignedStore, StoreMaster } from '../types';

interface RouteManagerProps {
  onSaveRoute: (route: Route) => void;
  users: User[];
  existingRoutes: Route[];
  masterStores: StoreMaster[];
}

const RouteManager: React.FC<RouteManagerProps> = ({ onSaveRoute, users, existingRoutes, masterStores }) => {
  const [mode, setMode] = useState<'manual' | 'massive'>('manual');
  const [selectedUserId, setSelectedUserId] = useState(users.find(u => u.role === 'auditor')?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStores, setSelectedStores] = useState<StoreMaster[]>([]);
  const [rawJson, setRawJson] = useState('');
  const [success, setSuccess] = useState(false);

  const filteredMaster = masterStores.filter(s => 
    !selectedStores.find(ss => ss.id === s.id) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddStoreToRoute = (store: StoreMaster) => {
    setSelectedStores([...selectedStores, store]);
  };

  const handleRemoveFromRoute = (id: string) => {
    setSelectedStores(selectedStores.filter(s => s.id !== id));
  };

  const handleSaveManual = () => {
    if (!selectedUserId || selectedStores.length === 0) {
      alert('Seleccione un auditor y al menos una tienda.');
      return;
    }
    
    const newRoute: Route = {
      id: crypto.randomUUID(),
      userId: selectedUserId,
      date: new Date().toISOString().split('T')[0],
      stores: selectedStores.map(s => ({ ...s, completed: false }))
    };

    onSaveRoute(newRoute);
    setSuccess(true);
    setSelectedStores([]);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSaveMassive = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        parsed.forEach((routeData: any) => {
          const auditor = users.find(u => u.name === routeData.auditorName || u.id === routeData.auditorId);
          if (auditor && routeData.stores) {
            const newRoute: Route = {
              id: crypto.randomUUID(),
              userId: auditor.id,
              date: routeData.date || new Date().toISOString().split('T')[0],
              stores: routeData.stores.map((s: any) => {
                const master = masterStores.find(m => m.id === s.id || m.name === s.name);
                return master ? { ...master, completed: false } : null;
              }).filter(Boolean) as AssignedStore[]
            };
            if (newRoute.stores.length > 0) onSaveRoute(newRoute);
          }
        });
        setSuccess(true);
        setRawJson('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('El formato debe ser un array de rutas.');
      }
    } catch (e) {
      alert('Error: JSON inválido.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Gestión de Rutas</h1>
          <p className="text-slate-500">Crea rutas personalizadas o masivas para tu equipo.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl shadow-inner">
          <button 
            onClick={() => setMode('manual')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'manual' ? 'bg-[#1e3a5f] text-white shadow-lg' : 'text-slate-500'}`}
          >
            Manual
          </button>
          <button 
            onClick={() => setMode('massive')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'massive' ? 'bg-[#1e3a5f] text-white shadow-lg' : 'text-slate-500'}`}
          >
            Masivo (JSON)
          </button>
        </div>
      </header>

      {mode === 'manual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selector de Tiendas de la BD */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Database size={20} className="text-blue-500" />
              PDVs Disponibles
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold uppercase"
                placeholder="Buscar tienda..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 no-scrollbar">
              {filteredMaster.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-xs italic">No hay más tiendas disponibles.</p>
              ) : (
                filteredMaster.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-colors">
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-slate-900 truncate uppercase">{s.name}</div>
                      <div className="text-[9px] text-slate-500 truncate uppercase">{s.address}</div>
                    </div>
                    <button 
                      onClick={() => handleAddStoreToRoute(s)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Armado de la Ruta */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col h-[500px] relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase tracking-tighter">
                <MapIcon size={20} className="text-blue-400" />
                Nueva Ruta
              </h3>

              <div className="space-y-4 mb-6 flex-1 flex flex-col min-h-0">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Asignar Auditor:</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-blue-500 font-bold uppercase text-xs"
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                  >
                    {users.filter(u => u.role === 'auditor').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tiendas en Ruta ({selectedStores.length})</label>
                  {selectedStores.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group animate-in slide-in-from-right-2">
                      <div className="overflow-hidden">
                        <div className="text-[11px] font-bold truncate uppercase">{s.name}</div>
                        <div className="text-[9px] text-slate-400 truncate uppercase">{s.address}</div>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromRoute(s.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {selectedStores.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                      <Store size={32} className="mb-2 opacity-20" />
                      <p className="text-[10px] uppercase font-bold tracking-widest">Selecciona tiendas de la izquierda</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10">
                <button
                  disabled={selectedStores.length === 0}
                  onClick={handleSaveManual}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all disabled:opacity-30 active:scale-95"
                >
                  <Save size={20} />
                  Guardar Ruta
                </button>
              </div>
            </div>
            {success && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-emerald-400 animate-in fade-in">
                <CheckCircle2 size={48} className="mb-4" />
                <span className="font-black uppercase tracking-[0.2em]">Ruta Guardada</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in zoom-in-95">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <FileJson size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase">Carga Masiva de Rutas</h3>
              <p className="text-xs text-slate-400">Pega un JSON con el formato de rutas para múltiples auditores.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <textarea
              className="w-full h-64 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-mono text-[10px]"
              placeholder='[
  {
    "auditorName": "Carlos Auditor",
    "date": "2024-01-12",
    "stores": [
      { "name": "Oxxo 1" },
      { "name": "Tambo 2" }
    ]
  }
]'
              value={rawJson}
              onChange={e => setRawJson(e.target.value)}
            />
            
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start">
              <AlertCircle className="text-amber-600 shrink-0" size={18} />
              <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed">
                Asegúrese de que los nombres de las tiendas y auditores coincidan exactamente con la base de datos maestra para una vinculación correcta.
              </p>
            </div>

            <button
              onClick={handleSaveMassive}
              className="w-full py-5 bg-[#1e3a5f] text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
            >
              Procesar Carga Masiva
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
          <List size={16} className="text-blue-600" />
          Rutas de Hoy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {existingRoutes.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-300 italic uppercase text-[10px] font-black">No hay rutas registradas para hoy</div>
          ) : (
            existingRoutes.map(route => {
              const auditor = users.find(u => u.id === route.userId);
              return (
                <div key={route.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-black text-[#1e3a5f] uppercase">{auditor?.name || 'Usuario desconocido'}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">{route.stores.length} Tiendas asignadas</div>
                  </div>
                  <div className="flex -space-x-2">
                    {route.stores.slice(0, 3).map((s, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {s.name.charAt(0)}
                      </div>
                    ))}
                    {route.stores.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">
                        +{route.stores.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteManager;
