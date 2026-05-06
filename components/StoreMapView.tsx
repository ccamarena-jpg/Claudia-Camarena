
import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Store, Info, ArrowRight, Map as MapIcon } from 'lucide-react';
import { POSAudit, AssignedStore } from '../types';

interface StoreMapViewProps {
  stores: (AssignedStore | POSAudit)[];
  title: string;
}

const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || (process.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
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
          {!hasValidKey && (
             <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-600 px-2 py-1 rounded-full animate-pulse">API KEY MISSING</span>
          )}
        </div>

        <div className="aspect-[16/9] w-full bg-slate-100 rounded-3xl relative overflow-hidden border border-slate-200 shadow-inner">
          {hasValidKey ? (
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
          ) : (
            <div className="w-full h-full relative group">
              <img 
                src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1400" 
                className="w-full h-full object-cover opacity-60 grayscale"
                alt="Map Preview"
              />
              <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px]"></div>
              
              {/* Visual Pins for the referential view */}
              <div className="absolute top-1/3 left-1/4 animate-bounce">
                <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><Store size={14} /></div>
              </div>
              <div className="absolute top-1/2 left-1/2 animate-bounce flex flex-col items-center">
                <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg border-2 border-white"><Store size={14} /></div>
                <div className="bg-white px-2 py-1 rounded-[4px] text-[7px] font-black mt-1 shadow-sm uppercase">Punto de Referencia</div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 p-5 rounded-3xl shadow-2xl text-center border border-slate-100 max-w-[240px] backdrop-blur-md">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <MapIcon size={20} />
                  </div>
                  <h2 className="text-[11px] font-black uppercase text-slate-900 mb-2 leading-tight">Configuración Requerida</h2>
                  <p className="text-[9px] text-slate-500 uppercase font-black leading-relaxed">
                    Añade la variable <code className="text-blue-600">GOOGLE_MAPS_PLATFORM_KEY</code> en Vercel o Settings para activar el mapa real.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreMapView;
