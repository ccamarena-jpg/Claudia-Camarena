
import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Store, Info, ArrowRight, Map as MapIcon } from 'lucide-react';
import { POSAudit, AssignedStore } from '../types';

interface StoreMapViewProps {
  stores: (AssignedStore | POSAudit)[];
  title: string;
}

const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
const hasValidKey = Boolean(API_KEY) && API_KEY.length > 10;

const MarkerWithInfo = ({ position, title, subtitle }: { position: google.maps.LatLngLiteral, title: string, subtitle?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <AdvancedMarker
      position={position}
      onClick={() => setOpen(true)}
    >
      <Pin background={subtitle?.includes('TAMBO') ? "#f59e0b" : "#2563eb"} glyphColor="#fff" borderColor="#fff" scale={1.2} />
      {open && (
        <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
          <div className="p-2 min-w-[120px]">
            <div className="text-[10px] font-black uppercase text-slate-900 border-b border-slate-100 pb-1 mb-1">{title}</div>
            {subtitle && <div className="text-[8px] font-bold text-slate-500 uppercase leading-tight mb-2">{subtitle}</div>}
            <div className="text-[7px] font-black text-blue-600 uppercase flex items-center gap-1 bg-blue-50 p-1 rounded">
              <Navigation size={8} /> GOOGLE MAPS
            </div>
          </div>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
};

const StoreMapView: React.FC<StoreMapViewProps> = ({ stores, title }) => {
  const storesWithLocation = stores.filter(s => s.location);

  if (!hasValidKey) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
          <MapPin size={16} className="text-blue-600" />
          {title} (Vista Referencial)
        </h3>
        <div className="aspect-[16/9] w-full bg-slate-200 rounded-3xl relative overflow-hidden group shadow-inner border border-slate-300">
          <img 
            src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1400" 
            className="w-full h-full object-cover opacity-50 grayscale"
            alt="Map Preview"
          />
          <div className="absolute inset-0 bg-blue-900/10"></div>
          
          <div className="absolute top-1/3 left-1/4 animate-bounce">
            <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><Store size={14} /></div>
          </div>
          <div className="absolute top-1/2 left-1/2 animate-bounce flex flex-col items-center">
            <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg border-2 border-white"><Store size={14} /></div>
            <div className="bg-white px-2 py-1 rounded-[4px] text-[7px] font-black mt-1 shadow-sm uppercase">Tambo San Borja</div>
          </div>
          <div className="absolute bottom-1/4 right-1/3 animate-bounce">
            <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><Store size={14} /></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <div className="bg-white p-6 rounded-3xl shadow-2xl text-center border border-slate-100 max-w-xs mx-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                <MapIcon size={24} />
              </div>
              <h2 className="text-sm font-black uppercase text-slate-900 mb-1 leading-tight">Configuración de Mapa</h2>
              <p className="text-[9px] text-slate-500 uppercase font-bold leading-relaxed px-2">
                Instala tu Google Maps Key en Secrets para activar GPS. Mostrando vista previa de San Borja.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const defaultCenter = storesWithLocation.length > 0 
    ? { lat: storesWithLocation[0].location!.lat, lng: storesWithLocation[0].location!.lng }
    : { lat: -12.0464, lng: -77.0428 }; // Lima default

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" />
            {title}
          </h3>
        </div>

        <div className="aspect-[16/9] w-full bg-slate-100 rounded-3xl relative overflow-hidden border border-slate-200 shadow-inner">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              disableDefaultUI={true}
              zoomControl={true}
            >
              {storesWithLocation.map((s, idx) => (
                <MarkerWithInfo 
                  key={idx} 
                  position={s.location!} 
                  title={'storeName' in s ? s.storeName : s.name}
                  subtitle={'address' in s ? s.address : undefined}
                />
              ))}
            </Map>
          </APIProvider>
        </div>

        <div className="mt-6 space-y-2">
           {storesWithLocation.map((s, idx) => (
             <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                   <Navigation size={14} />
                 </div>
                 <div>
                   <div className="text-[10px] font-black text-slate-900 uppercase">{'storeName' in s ? s.storeName : s.name}</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase">
                     Lat: {s.location?.lat.toFixed(4)} • Lng: {s.location?.lng.toFixed(4)}
                   </div>
                 </div>
               </div>
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${s.location?.lat},${s.location?.lng}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="p-2 bg-white text-slate-400 rounded-lg hover:text-blue-600 transition-colors"
               >
                 <ArrowRight size={16} />
               </a>
             </div>
           ))}
           {storesWithLocation.length === 0 && (
             <div className="text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               <Info size={32} className="mx-auto mb-2 text-slate-300" />
               <p className="text-[10px] font-black uppercase text-slate-400">Sin coordenadas para mostrar</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StoreMapView;
