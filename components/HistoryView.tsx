
import React, { useState } from 'react';
import { 
  ChevronRight, Calendar, User, MapPin, Search, X, Store, 
  Sparkles, Loader2, Download, FileSpreadsheet, ExternalLink 
} from 'lucide-react';
import { POSAudit, StoreStatus } from '../types';
import { generateAuditSummary } from '../services/geminiService';
import StoreMapView from './StoreMapView';
import * as XLSX from 'xlsx';

interface HistoryViewProps {
  audits: POSAudit[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ audits }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<POSAudit | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const filteredAudits = audits
    .filter(a => 
      a.storeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.auditorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleOpenDetail = async (audit: POSAudit) => {
    setSelectedAudit(audit);
    setAiSummary(null);
    setIsGeneratingSummary(true);
    const summary = await generateAuditSummary(audit);
    setAiSummary(summary);
    setIsGeneratingSummary(false);
  };

  const handleExportExcel = () => {
    if (audits.length === 0) return alert('No hay datos para exportar');

    // Aplanamiento de datos para Excel
    const reportData = audits.map(audit => {
      // Fix: Use optional chaining directly on the audit object to avoid type errors with empty objects
      const details = audit.details;
      
      return {
        'ID Auditoría': audit.id,
        'Fecha': new Date(audit.timestamp).toLocaleDateString(),
        'Hora': new Date(audit.timestamp).toLocaleTimeString(),
        'Auditor': audit.auditorName,
        'Tienda': audit.storeName,
        'Dirección': audit.address,
        'Estado Tienda': audit.storeStatus,
        'Acceso Counter': audit.auditAccess || 'N/A',
        'Área Auditada': details?.area || 'N/A',
        'Cumple FEFO': typeof details?.fefo?.value === 'boolean' ? (details.fefo?.value ? 'SI' : 'NO') : 'N/A',
        'Layout Inicial': typeof details?.initialLayout?.value === 'boolean' ? (details.initialLayout?.value ? 'SI' : 'NO') : 'N/A',
        'Layout Final': typeof details?.finalLayout?.value === 'boolean' ? (details.finalLayout?.value ? 'SI' : 'NO') : 'N/A',
        'Contaminado': typeof details?.contamination?.value === 'boolean' ? (details.contamination?.value ? 'SI' : 'NO') : 'N/A',
        'Activo OK': typeof details?.activeStatus?.value === 'boolean' ? (details.activeStatus?.value ? 'SI' : 'NO') : 'N/A',
        'Limpieza': audit.finalAudit?.assetsCleaned ? 'SI' : 'NO',
        'Comentarios Generales': audit.finalAudit?.comment || 'Sin comentarios',
        'Link Foto Fachada': audit.statusPhotoBase64 ? 'Ver en App / Base64 Data' : 'Sin Foto',
        'Link Foto Panorámica': audit.panoramicPhotoBefore ? 'Ver en App / Base64 Data' : 'Sin Foto',
        'Link Foto Layout': details?.initialLayout?.photo ? 'Ver en App / Base64 Data' : 'Sin Foto',
        'Ubicación Lat': audit.location?.lat || '',
        'Ubicación Lng': audit.location?.lng || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Auditorías Consolidado");

    // Guardar el archivo
    XLSX.writeFile(workbook, `Reporte_AuditPOS_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Historial de Auditorías</h1>
          <p className="text-slate-500">Consulta de registros y descarga de reportes Excel.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
          >
            <FileSpreadsheet size={18} />
            Exportar Excel
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tienda o auditor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* MAPA DE HISTORIAL */}
      <StoreMapView stores={filteredAudits} title="Geolocalización de Auditorías Realizadas" />

      <div className="grid gap-4">
        {filteredAudits.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Sin registros que coincidan.</p>
          </div>
        ) : (
          filteredAudits.map(audit => (
            <div
              key={audit.id}
              onClick={() => handleOpenDetail(audit)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg group-hover:bg-blue-50 relative border border-slate-100">
                  {audit.storeName.charAt(0)}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${audit.storeStatus === StoreStatus.OPEN ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">{audit.storeName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(audit.timestamp).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><User size={12} /> {audit.auditorName}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-blue-50 group-hover:translate-x-1 transition-all" />
            </div>
          ))
        )}
      </div>

      {selectedAudit && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${selectedAudit.storeStatus === StoreStatus.OPEN ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <Store size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedAudit.storeName}</h2>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{new Date(selectedAudit.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAudit(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* AI Insight Section */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] mb-4 text-blue-400">
                    <Sparkles size={18} />
                    Resumen Inteligente Gemini
                  </h3>
                  {isGeneratingSummary ? (
                    <div className="flex items-center gap-3 text-slate-400 py-4">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-sm font-bold uppercase">Analizando reporte...</span>
                    </div>
                  ) : (
                    <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase italic">"{aiSummary}"</p>
                  )}
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
              </div>

              {/* Fotos Section - Links Visuales */}
              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Registro Fotográfico</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedAudit.statusPhotoBase64 && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Fachada</span>
                        <img src={selectedAudit.statusPhotoBase64} className="w-full aspect-video object-cover rounded-2xl border" alt="Fachada" />
                      </div>
                    )}
                    {selectedAudit.panoramicPhotoBefore && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Panorámica</span>
                        <img src={selectedAudit.panoramicPhotoBefore} className="w-full aspect-video object-cover rounded-2xl border" alt="Panorámica" />
                      </div>
                    )}
                    {selectedAudit.details?.initialLayout?.photo && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Layout</span>
                        <img src={selectedAudit.details.initialLayout.photo} className="w-full aspect-video object-cover rounded-2xl border" alt="Layout" />
                      </div>
                    )}
                 </div>
              </div>

              {/* Contenido Detallado */}
              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Indicadores de Ejecución</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAudit.details && (
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                         <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">{selectedAudit.details.area}</span>
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[8px] font-black">AREA AUDITADA</span>
                         </div>
                         {Object.entries(selectedAudit.details).map(([key, value]: [string, any]) => (
                           key !== 'area' && value && (
                             <div key={key} className="flex justify-between items-center text-[10px] font-bold">
                               <span className="text-slate-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                               <span className={value.value === true || value.value?.includes('SI') ? 'text-emerald-600' : 'text-rose-600'}>
                                 {typeof value.value === 'boolean' ? (value.value ? 'SI' : 'NO') : value.value}
                               </span>
                             </div>
                           )
                         ))}
                      </div>
                    )}
                    
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materiales Implementados</h4>
                       {selectedAudit.campaigns?.filter(c => c.status).map(c => (
                         <div key={c.name} className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                            <div className="flex justify-between">
                               <span className="text-[9px] font-black text-[#1e3a5f] uppercase">{c.name}</span>
                               <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${c.status === 'IMPLEMENTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                 {c.status === 'IMPLEMENTED' ? 'EXITOSO' : 'INCIDENCIA'}
                               </span>
                            </div>
                            {(c.implementationType || c.incidenceType) && (
                              <span className="text-[8px] text-slate-400 font-bold italic">{c.implementationType || c.incidenceType}</span>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-6 border-t bg-white flex justify-end">
              <button onClick={() => setSelectedAudit(null)} className="px-10 py-4 bg-[#1e3a5f] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
