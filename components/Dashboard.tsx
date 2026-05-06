
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, Package, AlertCircle, CheckCircle, Ban, Users, Map as MapIcon } from 'lucide-react';
import { POSAudit, DashboardStats, StoreStatus } from '../types';

interface DashboardProps {
  audits: POSAudit[];
}

const Dashboard: React.FC<DashboardProps> = ({ audits }) => {
  const stats: DashboardStats = {
    totalAudits: audits.length,
    totalMaterials: audits.reduce((acc: number, curr) => acc + (curr.items?.reduce((a: number, c) => a + c.quantity, 0) || 0), 0) + 342, // + dummy
    complianceRate: audits.length > 0 
      ? Math.round((audits.reduce((acc: number, curr) => acc + (curr.details?.finalLayout?.value === true ? 1 : 0.8), 0) / audits.length) * 100)
      : 88, // dummy default
    pendingActions: audits.reduce((acc: number, curr) => 
      acc + (curr.items?.filter(i => i.condition === 'Faltante' || i.condition === 'Dañado / Sucio').length || 0), 0
    ) + 5, // + dummy
    totalOOS: audits.reduce((acc: number, curr) => acc + (curr.oosRecords?.filter(r => r.meetsMinStock === false).length || 0), 0) + 12, // + dummy
  };

  // Cadena performance dummy
  const chainData = [
    { name: 'OXXO', value: 92, color: '#ef4444' },
    { name: 'TAMBO', value: 85, color: '#f59e0b' },
    { name: 'PRIMAX', value: 78, color: '#2563eb' },
    { name: 'REPSOL', value: 89, color: '#1e3a5f' },
    { name: 'VIVA', value: 94, color: '#10b981' }
  ];

  // Tendencia Semanal dummy
  const trendData = [
    { day: 'Lun', audits: 45, compliance: 82 },
    { day: 'Mar', audits: 52, compliance: 85 },
    { day: 'Mie', audits: 38, compliance: 84 },
    { day: 'Jue', audits: 64, compliance: 88 },
    { day: 'Vie', audits: 55, compliance: 89 },
    { day: 'Sab', audits: 42, compliance: 92 },
    { day: 'Dom', audits: 20, compliance: 91 },
  ];

  // Avance por Promotor
  const auditorStatsMap = audits.reduce((acc, audit) => {
    acc[audit.auditorName] = (acc[audit.auditorName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const auditorData = Object.entries(auditorStatsMap).map(([name, count]) => ({ name, count }));

  // Tiendas con más quiebres
  const storeOosMap = audits.reduce((acc, audit) => {
    const oosCount = audit.oosRecords?.filter(r => r.meetsMinStock === false).length || 0;
    if (oosCount > 0) {
      acc[audit.storeName] = (acc[audit.storeName] || 0) + oosCount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Fix: Explicitly type the map result to ensure 'count' is treated as a number in the subsequent sort operation
  const oosByStoreData = Object.entries(storeOosMap)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const conditionData = [
    { name: 'Perfecto', value: audits.reduce((acc: number, a) => acc + (a.items?.filter(i => i.condition === 'Perfecto Estado').length || 0), 0) + 120, color: '#10b981' },
    { name: 'Dañado', value: audits.reduce((acc: number, a) => acc + (a.items?.filter(i => i.condition === 'Dañado / Sucio').length || 0), 0) + 15, color: '#f59e0b' },
    { name: 'Faltante', value: audits.reduce((acc: number, a) => acc + (a.items?.filter(i => i.condition === 'Faltante').length || 0), 0) + 42, color: '#ef4444' },
    { name: 'Antiguo', value: audits.reduce((acc: number, a) => acc + (a.items?.filter(i => i.condition === 'Desactualizado').length || 0), 0) + 8, color: '#6366f1' },
  ].filter(d => d.value > 0);

  const categoryData = [
    { name: 'VUSE', value: 450, color: '#3b82f6' },
    { name: 'VELO', value: 280, color: '#1e3a5f' },
    { name: 'LUCKY', value: 340, color: '#ef4444' },
    { name: 'ACCESOR.', value: 120, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">Performance Trade Marketing</h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Mayo 2024 • Análisis Ejecutivo</p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm divide-x divide-slate-100 font-black uppercase">
           <div className="px-6 py-2">
             <div className="text-[9px] text-slate-400 tracking-widest mb-1">Auditores</div>
             <div className="text-xl text-blue-600">08</div>
           </div>
           <div className="px-6 py-2">
             <div className="text-[9px] text-slate-400 tracking-widest mb-1">Alertas</div>
             <div className="text-xl text-rose-600">03</div>
           </div>
           <div className="px-6 py-2">
             <div className="text-[9px] text-slate-400 tracking-widest mb-1">Días Háb.</div>
             <div className="text-xl text-slate-900">22</div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Auditorías', value: stats.totalAudits, icon: TrendingUp, color: 'blue' },
          { label: 'Materiales', value: stats.totalMaterials, icon: Package, color: 'indigo' },
          { label: 'Cumplimiento', value: `${stats.complianceRate}%`, icon: CheckCircle, color: 'emerald' },
          { label: 'Quiebres SKUs', value: stats.totalOOS, icon: Ban, color: 'rose' },
          { label: 'Alertas POP', value: stats.pendingActions, icon: AlertCircle, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-4`}>
              <stat.icon size={24} />
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Mix por Categoría */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Package size={14} /> Mix por Categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Estado Materiales */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Estado de Exhibición</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={conditionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {conditionData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Avance por Promotor */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Users size={14} /> Avance por Promotor</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#1e3a5f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Ranking Tiendas con más Quiebres */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 text-rose-600"><AlertCircle size={14} /> Tiendas con más Quiebres</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={oosByStoreData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 4: Performance por Cadena */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><MapIcon size={14} /> Cumplimiento por Cadena (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chainData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 5: Tendencia Semanal */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><TrendingUp size={14} /> Tendencia Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Line type="monotone" dataKey="compliance" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="audits" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
