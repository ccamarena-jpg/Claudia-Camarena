
import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Store, Info, ArrowRight, Map as MapIcon } from 'lucide-react';
import { POSAudit, AssignedStore } from '../types';

interface StoreMapViewProps {
  stores: (AssignedStore | POSAudit)[];
  title: string;
}

const API_KEY = (process.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
const hasValidKey = Boolean(API_KEY) && API_KEY.length > 8;

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
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
              <MapIcon size={40} className="text-slate-300 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[200px]">
                Google Maps API Key no detectada. Por favor configure GOOGLE_MAPS_PLATFORM_KEY en los Secrets.
              </p>
            </div>
          )}
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
