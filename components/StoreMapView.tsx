
import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Store, Info, ArrowRight } from 'lucide-react';
import { POSAudit, AssignedStore } from '../types';

interface StoreMapViewProps {
  stores: (AssignedStore | POSAudit)[];
  title: string;
}

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const MarkerWithInfo = ({ position, title, subtitle }: { position: google.maps.LatLngLiteral, title: string, subtitle?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <AdvancedMarker
      position={position}
      onClick={() => setOpen(true)}
    >
      <Pin background="#2563eb" glyphColor="#fff" borderColor="#1e3a5f" scale={1.2} />
      {open && (
        <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
          <div className="p-1 min-w-[100px]">
            <div className="text-[10px] font-black uppercase text-slate-900 border-b border-slate-100 pb-1 mb-1">{title}</div>
            {subtitle && <div className="text-[8px] font-bold text-slate-500 uppercase leading-tight">{subtitle}</div>}
            <div className="mt-2 text-[7px] font-black text-blue-600 uppercase flex items-center gap-1">
              <Navigation size={8} /> CLICK PARA NAVEGAR
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
          {title}
        </h3>
        <div className="aspect-[16/9] w-full bg-slate-100 rounded-3xl flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <MapPin size={32} />
          </div>
          <h2 className="text-lg font-black uppercase text-slate-900 mb-2">Google Maps API Key Requerida</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold max-w-xs leading-relaxed">
            Para ver el mapa real, configura la variable <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> en los Secrets de AI Studio.
          </p>
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
