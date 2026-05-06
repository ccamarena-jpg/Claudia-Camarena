
import React, { useState, useRef } from 'react';
import { Plus, Search, Trash2, FileJson, Database, Edit2, Check, X, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { StoreMaster } from '../types';
import * as XLSX from 'xlsx';

interface StoreCatalogProps {
  stores: StoreMaster[];
  onUpdateStores: (stores: StoreMaster[]) => void;
}

const StoreCatalog: React.FC<StoreCatalogProps> = ({ stores, onUpdateStores }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rawJson, setRawJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExcelImporting, setIsExcelImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        const newStores = parsed.map(s => ({
          id: s.id || crypto.randomUUID(),
          name: s.name || 'PDV Sin Nombre',
          address: s.address || 'Sin Dirección',
          channel: s.channel || 'Tradicional',
          city: s.city || 'N/A'
        }));
        onUpdateStores([...stores, ...newStores]);
        setRawJson('');
        setIsImporting(false);
      }
    } catch (e) {
      alert('Error: JSON inválido.');
    }
  };

  const removeStore = (id: string) => {
    if (confirm('¿Eliminar esta tienda del catálogo maestro?')) {
      onUpdateStores(stores.filter(s => s.id !== id));
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'nombre de tienda': 'Ejemplo Tienda Oxxo',
        'código de tienda': 'COD001',
        'direccion de tienda': 'Av. Principal 123',
        'latitud': -12.046374,
        'longitud': -77.042793,
        'distrito': 'Lima',
        'provincia': 'Lima',
        'ciudad': 'Lima'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Catalogo");
    XLSX.writeFile(workbook, "Plantilla_Catalogo_PDVs.xlsx");
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const newStores: StoreMaster[] = data.map(item => ({
          id: String(item['código de tienda'] || crypto.randomUUID()),
          name: String(item['nombre de tienda'] || 'Sin Nombre'),
          address: String(item['direccion de tienda'] || 'Sin Dirección'),
          location: item['latitud'] && item['longitud'] ? {
            lat: parseFloat(item['latitud']),
            lng: parseFloat(item['longitud'])
          } : undefined,
          district: String(item['distrito'] || ''),
          province: String(item['provincia'] || ''),
          city: String(item['ciudad'] || ''),
          channel: 'General'
        }));

        if (newStores.length > 0) {
          onUpdateStores([...stores, ...newStores]);
          alert(`Se han importado ${newStores.length} tiendas correctamente.`);
          setIsExcelImporting(false);
        } else {
          alert('No se encontraron datos válidos en el archivo.');
        }
      } catch (err) {
        console.error(err);
        alert('Error al procesar el archivo Excel. Asegúrate de usar la plantilla correcta.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Base de Datos de PDVs</h1>
          <p className="text-slate-500">Gestión centralizada de puntos de venta disponibles.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={handleDownloadTemplate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Download size={18} />
            Plantilla Excel
          </button>
          <button 
            onClick={() => setIsExcelImporting(!isExcelImporting)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/20 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Upload size={18} />
            Carga Excel
          </button>
          <button 
            onClick={() => setIsImporting(!isImporting)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <FileJson size={18} />
            {isImporting ? 'Cerrar JSON' : 'Carga JSON'}
          </button>
        </div>
      </header>

      {isExcelImporting && (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-dashed border-emerald-200 space-y-6 animate-in zoom-in-95">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase">Importar Catálogo desde Excel</h3>
              <p className="text-xs text-slate-400">Sube el archivo Excel con las columnas de la plantilla.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleExcelUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <Upload size={48} className="mb-2 opacity-30" />
              <p className="text-[10px] uppercase font-black tracking-widest">Haz clic para seleccionar archivo Excel</p>
            </button>
          </div>
        </div>
      )}

      {isImporting && (
        <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-blue-200 animate-in zoom-in-95">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pegar JSON de Tiendas</label>
          <textarea
            className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 font-mono text-xs"
            placeholder='[{"name": "Oxxo 1", "address": "Av. Principal 123"}, {"name": "Bodega 2", "address": "Calle 4"}]'
            value={rawJson}
            onChange={e => setRawJson(e.target.value)}
          />
          <button
            onClick={handleImportJson}
            className="mt-3 w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Check size={18} /> Procesar e Importar al Catálogo
          </button>
        </div>
      )}

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-medium"
            placeholder="Buscar tienda por nombre o dirección..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="pb-4 px-4">Código</th>
                <th className="pb-4 px-4">Punto de Venta</th>
                <th className="pb-4 px-4">Dirección</th>
                <th className="pb-4 px-4">Ciudad/Distrito</th>
                <th className="pb-4 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStores.map(store => (
                <tr key={store.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 text-xs font-bold text-slate-400 uppercase">{store.id}</td>
                  <td className="py-4 px-4 font-bold text-slate-900 uppercase text-xs">{store.name}</td>
                  <td className="py-4 px-4 text-[10px] text-slate-500 uppercase">{store.address}</td>
                  <td className="py-4 px-4 text-[10px] text-slate-400 uppercase">
                    {store.city} {store.district ? `/ ${store.district}` : ''}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => removeStore(store.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest italic">No hay tiendas en el catálogo maestro.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreCatalog;
