
import React from 'react';
import { MapPin, ArrowRight, CheckCircle2, Circle, Clock, Store as StoreIcon } from 'lucide-react';
import { AssignedStore, Route } from '../types';
import StoreMapView from './StoreMapView';

interface RouteViewProps {
  route?: Route;
  onAuditStore: (store: AssignedStore) => void;
}

const RouteView: React.FC<RouteViewProps> = ({ route, onAuditStore }) => {
  if (!route || route.stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
          <StoreIcon size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sin Ruta Asignada</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          No tienes tiendas asignadas para hoy. Contacta a tu supervisor para recibir tu listado de puntos de venta.
        </p>
      </div>
    );
  }

  const completedCount = route.stores.filter(s => s.completed).length;
  const progress = Math.round((completedCount / route.stores.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Mi Ruta Diaria</h1>
          <p className="text-slate-500 mt-1">Sigue el listado de visitas programadas.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso Total</div>
            <div className="text-xl font-bold text-slate-900">{completedCount} / {route.stores.length}</div>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-slate-100 stroke-current" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-blue-600 stroke-current transition-all duration-1000" strokeWidth="4" strokeDasharray={`${progress}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progress}%</div>
          </div>
        </div>
      </header>

      {/* MAPA DE RUTA */}
      <StoreMapView stores={route.stores} title="Mapa de Visitas Programadas" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {route.stores.map((store) => (
          <div 
            key={store.id} 
            className={`group bg-white rounded-3xl p-6 border-2 transition-all overflow-hidden relative ${
              store.completed ? 'border-emerald-100 opacity-80' : 'border-white shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/10'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${store.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                <StoreIcon size={24} />
              </div>
              {store.completed ? (
                <div className="flex items-center gap-1 text-emerald-600 font-black text-[10px] bg-emerald-50 px-3 py-1 rounded-full uppercase">
                  <CheckCircle2 size={12} /> Visitado
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-400 font-black text-[10px] bg-slate-50 px-3 py-1 rounded-full uppercase">
                  <Clock size={12} /> Pendiente
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 uppercase">{store.name}</h3>
            <div className="flex items-start gap-2 mt-2 text-slate-500 min-h-[40px]">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <p className="text-sm line-clamp-2 leading-relaxed uppercase">{store.address}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50">
              {store.completed ? (
                <button 
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm cursor-default uppercase"
                >
                  Auditoría Completada
                </button>
              ) : (
                <button 
                  onClick={() => onAuditStore(store)}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 group uppercase tracking-widest"
                >
                  Iniciar Auditoría
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteView;
