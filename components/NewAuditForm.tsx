
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Camera, Save, ArrowLeft, Search, Check, Info, ShieldAlert, Store, 
  CheckCircle2, ImageIcon, Package, Sparkles, Loader2, Calendar, 
  ListTodo, LayoutDashboard, Database, HelpCircle, User, MessageSquare, Ban,
  ChevronDown, ArrowRight, Hash, Clock, List, AlertCircle, Wrench, Trophy, Plus,
  Minus, Sparkle, ScanSearch, ShieldCheck, ShieldAlert as AlertIcon, 
  BookOpen, Lightbulb, ChevronUp
} from 'lucide-react';
import { 
  POSAudit, StoreStatus, SKUCategory, SKU_LISTS, User as UserType, 
  AssignedStore, CURRENT_CAMPAIGNS, CampaignRecord, AuditAccess, 
  DENIAL_REASONS, AuditArea, LAYOUT_FAIL_REASONS, POSAuditDetails,
  AuditIndicator, StockCountItem, FinalAudit, CLOSURE_REASONS,
  LAYOUT_FIX_REASONS,
  OOSRecord, OOS_REASONS, MaintenanceAudit, MAINTENANCE_ASSETS, MAINTENANCE_INCIDENCES,
  CompetitorActivityRecord, COMPETITOR_CATEGORIES, COMPETITOR_ACTIVITIES, MaintenanceRecord,
  EXHIBITION_OPTIONS_DISPENSER, EXHIBITION_OPTIONS_GLORIFICADOR, ASSET_INCIDENCE_REASONS, ASSET_FIX_REASONS,
  CAMPAIGN_DETAILS
} from '../types';
import { detectMaterialsAndOOS, verifyLayoutCompliance } from '../services/geminiService';

interface NewAuditFormProps {
  onSave: (audit: POSAudit) => void;
  user: UserType;
  prefillStore?: AssignedStore;
  onCancel: () => void;
}

const NewAuditForm: React.FC<NewAuditFormProps> = ({ onSave, user, prefillStore, onCancel }) => {
  const [storeName] = useState(prefillStore?.name || '');
  
  // 1. Apertura
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(StoreStatus.OPEN);
  const [personnelName, setPersonnelName] = useState('');
  const [openingComment, setOpeningComment] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [statusPhoto, setStatusPhoto] = useState<string | null>(null);

  // Acceso
  const [auditAccess, setAuditAccess] = useState<AuditAccess | null>(null);
  const [denialReason, setDenialReason] = useState<string>('');
  
  // 2. Registro Inicial
  const [panoramicBefore, setPanoramicBefore] = useState<string | null>(null);
  const [panoramicAnalysis, setPanoramicAnalysis] = useState<string | null>(null);

  // 3. Indicadores PDV
  const [auditDetails, setAuditDetails] = useState<POSAuditDetails>({
    area: AuditArea.CIGARRERA,
    fefo: { value: null, comment: '' },
    initialLayout: { value: null, comment: '' },
    finalLayout: { value: null, comment: '' },
    vuseStorage: { value: null, comment: '' },
    incidence: { value: null, comment: '' },
    activeStatus: { value: null, comment: '' },
    contamination: { value: null, comment: '' },
    finalContamination: { value: null, comment: '' },
    exhibitionStatus: { value: null, comment: '' }
  });

  const [layoutAnalysis, setLayoutAnalysis] = useState<string | null>(null);

  // 4. Ejecución POP
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(
    CURRENT_CAMPAIGNS.map(name => ({ name, status: null, comment: '' }))
  );

  // 6. Quiebres (OOS)
  const [oosRecords, setOosRecords] = useState<OOSRecord[]>([]);
  const [oosSearch, setOosSearch] = useState('');
  const [activeOosCategory, setActiveOosCategory] = useState<SKUCategory>(SKUCategory.CIGARRILLOS);

  // 7. Mantenimientos
  const [maintenance, setMaintenance] = useState<MaintenanceAudit>({
    items: MAINTENANCE_ASSETS.map(asset => ({ asset, status: null })),
    generalComment: ''
  });

  // 8. Competencia
  const [competitorActivities, setCompetitorActivities] = useState<CompetitorActivityRecord[]>([]);

  // 9. Cierre
  const [finalAudit, setFinalAudit] = useState<FinalAudit>({
    assetsCleaned: null,
    comment: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Logica Visibilidad
  const isStoreOpen = storeStatus === StoreStatus.OPEN;
  const showAuditFlow = isStoreOpen && auditAccess !== null;

  // Filtros
  const filteredOosSkus = useMemo(() => {
    const list = SKU_LISTS[activeOosCategory];
    return oosSearch ? list.filter(sku => sku.toLowerCase().includes(oosSearch.toLowerCase())) : list;
  }, [activeOosCategory, oosSearch]);

  // Handlers Generales
  const readFileAsDataURL = (file: File, callback: (result: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  };

  const updateAuditIndicator = (key: keyof Omit<POSAuditDetails, 'area'>, field: keyof AuditIndicator, value: any) => {
    setAuditDetails(prev => ({ ...prev, [key]: { ...(prev[key] as any || { value: null, comment: '' }), [field]: value } }));
  };

  const handlePanoramicPhoto = (photo: string) => {
    setPanoramicBefore(photo);
    handleAiDetection(photo);
  };

  const handleAiDetection = async (photo: string) => {
    setIsAnalyzing(true);
    const result = await detectMaterialsAndOOS(photo);
    setPanoramicAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleLayoutPhoto = (photo: string) => {
    updateAuditIndicator('initialLayout', 'photo', photo);
    handleAiLayoutCheck(photo, auditDetails.area);
  };

  const handleAiLayoutCheck = async (photo: string, area: string) => {
    setIsAnalyzing(true);
    const result = await verifyLayoutCompliance(photo, area);
    setLayoutAnalysis(result);
    setIsAnalyzing(false);
  };

  const updateOosRecord = (skuName: string, field: keyof OOSRecord, value: any) => {
    setOosRecords(prev => {
      const existing = prev.find(i => i.skuName === skuName);
      return existing 
        ? prev.map(i => i.skuName === skuName ? { ...i, [field]: value } : i)
        : [...prev, { skuName, meetsMinStock: field === 'meetsMinStock' ? value : null, comment: field === 'comment' ? value : '' }];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusPhoto) return alert('Foto de fachada obligatoria');
    if (isStoreOpen && (!personnelName || !openingComment)) return alert('Datos de apertura incompletos');
    
    setIsSubmitting(true);
    const finalize = (coords?: {lat: number, lng: number}) => {
      const audit: POSAudit = {
        id: crypto.randomUUID(), timestamp: Date.now(), storeName, address: prefillStore?.address || '',
        auditorId: user.id, auditorName: user.name, storeStatus, statusPhotoBase64: statusPhoto || undefined,
        personnelName, openingComment, closureReason, panoramicPhotoBefore: panoramicBefore || undefined,
        auditAccess: auditAccess || undefined, details: showAuditFlow ? auditDetails : undefined,
        campaigns: showAuditFlow ? campaigns : undefined,
        oosRecords: showAuditFlow ? oosRecords : undefined, maintenance: showAuditFlow ? maintenance : undefined,
        competitorActivities: showAuditFlow ? competitorActivities : undefined, finalAudit: showAuditFlow ? finalAudit : undefined,
        items: [], oosItems: [], checklist: [], location: coords || prefillStore?.location
      };
      onSave(audit);
    };
    navigator.geolocation.getCurrentPosition(pos => finalize({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => finalize());
  };

  // UI Helpers
  const StepHeader = ({ icon: Icon, title, color = "text-blue-600" }: any) => (
    <div className="flex items-center gap-2 px-1 mb-4">
      <Icon size={18} className={color} />
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h2>
    </div>
  );

  const AiFeedbackBox = ({ analysis }: { analysis: string | null }) => {
    if (!analysis) return null;
    const isSuccess = analysis.toLowerCase().includes('cumple') || !analysis.toLowerCase().includes('quiebre');
    return (
      <div className={`p-4 rounded-2xl border flex gap-3 animate-in slide-in-from-top-2 ${isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {isSuccess ? <ShieldCheck size={18} /> : <AlertIcon size={18} />}
        </div>
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest block opacity-60">Resultados Análisis IA</span>
          <p className="text-[10px] font-bold uppercase leading-tight italic">{analysis}</p>
        </div>
      </div>
    );
  };

  const QuestionCard = ({ label, icon: Icon, value, onChange, photo, onPhoto, comment, onComment, reasons, currentReason, onReason, isRequired, options, allowAi = false, aiAction, analysis }: any) => (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${value === null ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-600'}`}><Icon size={18} /></div>
          <span className="text-[11px] font-black text-slate-700 uppercase leading-tight mt-1">{label} {isRequired && <span className="text-rose-500">*</span>}</span>
        </div>
        {!options && (
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner shrink-0">
            <button type="button" onClick={() => onChange(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${value === true ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>SI</button>
            <button type="button" onClick={() => onChange(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${value === false ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>NO</button>
          </div>
        )}
      </div>
      {options && (
        <div className="grid gap-2">{options.map((opt: string) => (<button key={opt} type="button" onClick={() => onChange(opt)} className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black border transition-all ${value === opt ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{opt}</button>))}</div>
      )}
      {reasons && value === false && (
        <div className="flex flex-wrap gap-2 pt-1">{reasons.map((r: string) => (<button key={r} type="button" onClick={() => onReason(r)} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-all ${currentReason === r ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{r}</button>))}</div>
      )}
      <div className="space-y-3">
        {onComment && (<input type="text" placeholder="COMENTARIO..." className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-[10px] font-black shadow-inner uppercase outline-none focus:ring-2 focus:ring-blue-100" value={comment || ''} onChange={e => onComment(e.target.value)} />)}
        {onPhoto && value !== null && (
          <div className="flex gap-2">
            <label className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${photo ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-yellow-400/20 border-yellow-400 text-amber-700'}`}>
              {photo ? <CheckCircle2 size={18} /> : <Camera size={18} />}<span className="text-[10px] font-black uppercase tracking-widest">{photo ? 'LISTO' : 'FOTO'}</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && readFileAsDataURL(e.target.files[0], onPhoto)} />
            </label>
            {allowAi && photo && (
              <button type="button" onClick={() => aiAction && aiAction(photo)} className="px-4 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all">
                <Sparkle size={18} />
              </button>
            )}
          </div>
        )}
        <AiFeedbackBox analysis={analysis} />
      </div>
    </div>
  );

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-40">
      <div className="bg-[#1e3a5f] text-white p-4 flex items-center justify-between -mx-4 -mt-8 mb-6 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-4"><button type="button" onClick={onCancel} className="p-1 active:scale-90 transition-transform"><ArrowLeft size={24} /></button><div><h1 className="text-lg font-black uppercase truncate max-w-[200px]">{storeName}</h1><p className="text-[10px] text-blue-300 font-bold uppercase mt-1 tracking-widest">Auditoría Trade Marketing</p></div></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* 1. APERTURA */}
        <section>
          <StepHeader icon={Store} title="1. Apertura" />
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center bg-[#002060] p-4 rounded-2xl text-white">
              <span className="text-[11px] font-black uppercase tracking-widest">LOCAL ABIERTO</span>
              <div className="flex bg-white/10 p-1 rounded-xl">
                <button type="button" onClick={() => setStoreStatus(StoreStatus.OPEN)} className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${isStoreOpen ? 'bg-white text-[#002060]' : 'text-white/60'}`}>SI</button>
                <button type="button" onClick={() => setStoreStatus(StoreStatus.CLOSED)} className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${!isStoreOpen ? 'bg-white text-rose-600' : 'text-white/60'}`}>NO</button>
              </div>
            </div>
            {isStoreOpen ? (
              <div className="space-y-4">
                <input type="text" placeholder="NOMBRE PERSONAL..." className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-black uppercase shadow-inner" value={personnelName} onChange={e => setPersonnelName(e.target.value)} />
                <input type="text" placeholder="COMENTARIO APERTURA..." className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-black uppercase shadow-inner" value={openingComment} onChange={e => setOpeningComment(e.target.value)} />
              </div>
            ) : (
              <div className="grid gap-2">{CLOSURE_REASONS.map(r => (<button key={r} type="button" onClick={() => setClosureReason(r)} className={`w-full text-left p-4 rounded-2xl text-[10px] font-black border transition-all ${closureReason === r ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{r}</button>))}</div>
            )}
            <label className={`relative block h-32 w-full rounded-2xl border-2 border-dashed overflow-hidden transition-all ${statusPhoto ? 'bg-emerald-50 border-emerald-300' : 'bg-yellow-400/20 border-yellow-400'}`}>
              {statusPhoto ? <img src={statusPhoto} className="w-full h-full object-cover" /> : (<div className="w-full h-full flex flex-col items-center justify-center gap-1 text-red-600"><Camera size={24} /><span className="text-[9px] font-black uppercase tracking-tight">FOTO OBLIGATORIA</span></div>)}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && readFileAsDataURL(e.target.files[0], setStatusPhoto)} />
            </label>
          </div>
          {isStoreOpen && (
            <div className="mt-4 space-y-4">
              <QuestionCard label="¿Permitió realizar auditoría en counter?" icon={ShieldAlert} value={auditAccess === AuditAccess.ALLOWED} onChange={(v: boolean) => setAuditAccess(v ? AuditAccess.ALLOWED : AuditAccess.DENIED)} reasons={DENIAL_REASONS} currentReason={denialReason} onReason={setDenialReason} isRequired />
            </div>
          )}
        </section>

        {showAuditFlow && (
          <>
            {/* 2. REGISTRO INICIAL */}
            <section>
              <StepHeader icon={ImageIcon} title="2. Registro Inicial" color="text-amber-500" />
              <div className="space-y-4">
                <label className={`relative block h-40 w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer ${panoramicBefore ? 'bg-blue-50 border-blue-300 shadow-inner' : 'bg-white border-slate-200'}`}>
                  {panoramicBefore ? <img src={panoramicBefore} className="w-full h-full object-cover rounded-3xl" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><Camera size={24} className="text-slate-400"/><span className="text-[9px] font-black uppercase text-slate-400">FOTO PANORÁMICA PREVIA *</span></div>}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && readFileAsDataURL(e.target.files[0], handlePanoramicPhoto)} />
                </label>
                <AiFeedbackBox analysis={panoramicAnalysis} />
              </div>
            </section>

            {/* 3. INDICADORES PDV */}
            <section>
              <StepHeader icon={ListTodo} title="3. Indicadores PDV" />
              <div className="flex bg-slate-200 p-1 rounded-2xl overflow-x-auto no-scrollbar gap-1 mb-4 shadow-inner">
                {Object.values(AuditArea).map(area => (<button key={area} type="button" onClick={() => setAuditDetails(prev => ({ ...prev, area }))} className={`px-4 py-2.5 rounded-xl text-[8px] font-black uppercase transition-all whitespace-nowrap ${auditDetails.area === area ? 'bg-[#1e3a5f] text-white' : 'text-slate-500'}`}>{area}</button>))}
              </div>
              <div className="space-y-4">
                {auditDetails.area === AuditArea.CIGARRERA && (
                   <>
                     <QuestionCard label="1. ¿CUMPLE FEFO?" icon={Calendar} value={auditDetails.fefo?.value} onChange={(v: boolean) => updateAuditIndicator('fefo', 'value', v)} onPhoto={(s: string) => updateAuditIndicator('fefo', 'photo', s)} photo={auditDetails.fefo?.photo} onComment={(c: string) => updateAuditIndicator('fefo', 'comment', c)} comment={auditDetails.fefo?.comment} />
                     <QuestionCard label="2. ¿CUMPLE LAYOUT? (INICIAL)" icon={LayoutDashboard} value={auditDetails.initialLayout?.value} onChange={(v: boolean) => updateAuditIndicator('initialLayout', 'value', v)} reasons={LAYOUT_FAIL_REASONS} currentReason={auditDetails.initialLayout?.reason} onReason={(r: string) => updateAuditIndicator('initialLayout', 'reason', r)} onPhoto={handleLayoutPhoto} photo={auditDetails.initialLayout?.photo} onComment={(c: string) => updateAuditIndicator('initialLayout', 'comment', c)} comment={auditDetails.initialLayout?.comment} allowAi aiAction={(p) => handleAiLayoutCheck(p, 'CIGARRERA')} analysis={layoutAnalysis} />
                     <QuestionCard label="3. ¿SE DEJÓ OK EL LAYOUT?" icon={CheckCircle2} value={auditDetails.finalLayout?.value} onChange={(v: boolean) => updateAuditIndicator('finalLayout', 'value', v)} reasons={LAYOUT_FIX_REASONS} currentReason={auditDetails.finalLayout?.reason} onReason={(r: string) => updateAuditIndicator('finalLayout', 'reason', r)} onPhoto={(s: string) => updateAuditIndicator('finalLayout', 'photo', s)} photo={auditDetails.finalLayout?.photo} />
                   </>
                )}
                {(auditDetails.area === AuditArea.DISPENSER) && (
                   <>
                     <QuestionCard label="1. ¿CONTAMINADO?" icon={Ban} value={auditDetails.contamination?.value} onChange={(v: boolean) => updateAuditIndicator('contamination', 'value', v)} onPhoto={(s: string) => updateAuditIndicator('contamination', 'photo', s)} photo={auditDetails.contamination?.photo} onComment={(c: string) => updateAuditIndicator('contamination', 'comment', c)} comment={auditDetails.contamination?.comment} />
                     <QuestionCard label="2. ¿SE DEJÓ SIN CONTAMINACION?" icon={CheckCircle2} value={auditDetails.finalContamination?.value} onChange={(v: boolean) => updateAuditIndicator('finalContamination', 'value', v)} onPhoto={(s: string) => updateAuditIndicator('finalContamination', 'photo', s)} photo={auditDetails.finalContamination?.photo} reasons={['TIENDA NO PERMITE RETIRAR']} currentReason={auditDetails.finalContamination?.reason} onReason={(r: string) => updateAuditIndicator('finalContamination', 'reason', r)} />
                     <QuestionCard label="3. ¿SE ENCUENTRA EXHIBIDO CORRECTAMENTE?" icon={LayoutDashboard} value={auditDetails.exhibitionStatus?.value} onChange={(v: string) => updateAuditIndicator('exhibitionStatus', 'value', v)} options={EXHIBITION_OPTIONS_DISPENSER} onComment={(c: string) => updateAuditIndicator('exhibitionStatus', 'comment', c)} comment={auditDetails.exhibitionStatus?.comment} />
                     <QuestionCard label="4. ¿PRESENTA ALGUNA INCIDENCIA?" icon={AlertCircle} value={auditDetails.incidence?.value} onChange={(v: boolean) => updateAuditIndicator('incidence', 'value', v)} onPhoto={(s: string) => updateAuditIndicator('incidence', 'photo', s)} photo={auditDetails.incidence?.photo} reasons={ASSET_INCIDENCE_REASONS} currentReason={auditDetails.incidence?.reason} onReason={(r: string) => updateAuditIndicator('incidence', 'reason', r)} />
                     <QuestionCard label="5. ¿SE DEJÓ OK EL ACTIVO?" icon={CheckCircle2} value={auditDetails.activeStatus?.value} onChange={(v: boolean) => updateAuditIndicator('activeStatus', 'value', v)} onPhoto={(s: string) => updateAuditIndicator('activeStatus', 'photo', s)} photo={auditDetails.activeStatus?.photo} reasons={ASSET_FIX_REASONS} currentReason={auditDetails.activeStatus?.reason} onReason={(r: string) => updateAuditIndicator('activeStatus', 'reason', r)} />
                   </>
                )}
                {(auditDetails.area === AuditArea.GLORIFICADOR_FMC || auditDetails.area === AuditArea.GLORIFICADOR_VUSE) && (
                   <>
                     <QuestionCard label="1. ¿SE ENCUENTRA EXHIBIDO CORRECTAMENTE?" icon={LayoutDashboard} value={auditDetails.exhibitionStatus?.value} onChange={(v: string) => updateAuditIndicator('exhibitionStatus', 'value', v)} options={EXHIBITION_OPTIONS_GLORIFICADOR} onComment={(c: string) => updateAuditIndicator('exhibitionStatus', 'comment', c)} comment={auditDetails.exhibitionStatus?.comment} />
                     <QuestionCard label="2. ¿PRESENTA ALGUNA INCIDENCIA?" icon={AlertCircle} value={auditDetails.incidence?.value} onChange={(v: boolean) => updateAuditIndicator('incidence', 'value', v)} onPhoto={(s: string) => updateAuditIndicator('incidence', 'photo', s)} photo={auditDetails.incidence?.photo} reasons={ASSET_INCIDENCE_REASONS} currentReason={auditDetails.incidence?.reason} onReason={(r: string) => updateAuditIndicator('incidence', 'reason', r)} />
                     <QuestionCard label="3. ¿SE DEJÓ OK EL ACTIVO?" icon={CheckCircle2} value={auditDetails.activeStatus?.value} onChange={(v: boolean) => updateAuditIndicator('activeStatus', 'value', v)} onPhoto={(s: string) => updateAuditIndicator('activeStatus', 'photo', s)} photo={auditDetails.activeStatus?.photo} reasons={ASSET_FIX_REASONS} currentReason={auditDetails.activeStatus?.reason} onReason={(r: string) => updateAuditIndicator('activeStatus', 'reason', r)} />
                   </>
                )}
                {auditDetails.area === AuditArea.CAJONERA && (
                  <QuestionCard label="1. ¿CONTAMINADO?" icon={Ban} value={auditDetails.contamination?.value} onChange={(v: boolean) => updateAuditIndicator('contamination', 'value', v)} onPhoto={(s: string) => updateAuditIndicator('contamination', 'photo', s)} photo={auditDetails.contamination?.photo} onComment={(c: string) => updateAuditIndicator('contamination', 'comment', c)} comment={auditDetails.contamination?.comment} />
                )}
              </div>
            </section>

            {/* 4. EJECUCION POP */}
            <section>
              <StepHeader icon={Sparkles} title="4. Ejecución POP" color="text-[#002060]" />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                <div className="bg-[#002060] p-4 text-white font-black text-[10px] uppercase tracking-widest">Materiales en PDV</div>
                {campaigns.map(camp => (
                  <div key={camp.name} className="p-5 space-y-4">
                    <span className="text-[10px] font-black text-[#002060] uppercase">{camp.name}</span>
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setCampaigns(prev => prev.map(c => c.name === camp.name ? { ...c, status: 'IMPLEMENTED', rectified: false } : c))} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${camp.status === 'IMPLEMENTED' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>IMPLEMENTADO</button>
                        <button type="button" onClick={() => setCampaigns(prev => prev.map(c => c.name === camp.name ? { ...c, status: 'INCIDENCE', implementationType: null } : c))} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${camp.status === 'INCIDENCE' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>NO IMPLEMENTADO</button>
                      </div>
                      
                      {camp.status === 'INCIDENCE' && (
                        <div className="animate-in slide-in-from-top-1">
                          <button 
                            type="button" 
                            onClick={() => setCampaigns(prev => prev.map(c => c.name === camp.name ? { ...c, rectified: !c.rectified } : c))} 
                            className={`w-full py-3 rounded-xl text-[10px] font-black border transition-all flex items-center justify-center gap-2 ${camp.rectified ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                          >
                            {camp.rectified && <CheckCircle2 size={16} />}
                            SE IMPLEMENTÓ
                          </button>
                        </div>
                      )}

                      {(camp.status === 'IMPLEMENTED' || (camp.status === 'INCIDENCE' && camp.rectified)) && (
                        <div className="flex gap-2">
                          <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${camp.photo ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {camp.photo ? <CheckCircle2 size={16} /> : <Camera size={16} />}<span className="text-[10px] font-black uppercase">FOTO</span>
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && readFileAsDataURL(e.target.files[0], (s) => setCampaigns(prev => prev.map(c => c.name === camp.name ? { ...c, photo: s } : c)))} />
                          </label>
                          <input type="text" placeholder="OBSERVACIONES..." className="flex-[2] bg-slate-50 border-none rounded-xl py-3 px-4 text-[10px] font-black shadow-inner uppercase outline-none focus:ring-2 focus:ring-blue-100" value={camp.comment} onChange={e => setCampaigns(prev => prev.map(c => c.name === camp.name ? { ...c, comment: e.target.value } : c))} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. QUIEBRES (STOCK MINIMO) */}
            <section>
              <div className="bg-[#002060] text-white p-4 rounded-t-3xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center">
                 <span>QUIEBRES</span>
                 <div className="flex gap-2">
                   {Object.values(SKUCategory).map(cat => (
                     <button key={cat} type="button" onClick={() => setActiveOosCategory(cat)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black border transition-all ${activeOosCategory === cat ? 'bg-white text-[#002060]' : 'bg-white/10 text-white/60'}`}>{cat.toUpperCase()}</button>
                   ))}
                 </div>
              </div>
              <div className="bg-white rounded-b-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto no-scrollbar">
                   <div className="grid grid-cols-[1fr,85px,120px] gap-2 px-4 py-2 bg-slate-100 text-[8px] font-black text-slate-400 uppercase"><span>SKU</span><span className="text-center">¿CUMPLE STOCK?</span><span>MOTIVO (SI NO)</span></div>
                   {filteredOosSkus.map(sku => {
                     const data = oosRecords.find(i => i.skuName === sku);
                     return (
                       <div key={sku} className={`grid grid-cols-[1fr,85px,120px] gap-2 px-4 py-3 items-center ${data?.meetsMinStock === false ? 'bg-rose-50/40' : ''}`}>
                         <span className="text-[9px] font-black text-slate-700 uppercase truncate">{sku}</span>
                         <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg shadow-inner">
                           <button type="button" onClick={() => updateOosRecord(sku, 'meetsMinStock', true)} className={`flex-1 py-1.5 rounded-md text-[8px] font-black ${data?.meetsMinStock === true ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>SI</button>
                           <button type="button" onClick={() => updateOosRecord(sku, 'meetsMinStock', false)} className={`flex-1 py-1.5 rounded-md text-[8px] font-black ${data?.meetsMinStock === false ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>NO</button>
                         </div>
                         <select className={`w-full py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black outline-none ${data?.meetsMinStock === false ? 'border-rose-300' : 'opacity-30'}`} disabled={data?.meetsMinStock !== false} value={data?.comment || ''} onChange={e => updateOosRecord(sku, 'comment', e.target.value)}>
                            <option value="">SELECCIONE...</option>
                            {OOS_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                       </div>
                     );
                   })}
                </div>
              </div>
            </section>

            {/* 7. MANTENIMIENTOS */}
            <section>
              <div className="bg-[#92d050] text-[#1e3a5f] p-4 rounded-t-3xl text-center font-black text-xs uppercase tracking-widest">Mantenimientos</div>
              <div className="bg-[#92d050] text-[#1e3a5f] p-5 rounded-b-3xl space-y-4 shadow-sm border border-[#7eb244]">
                {maintenance.items.map(item => (
                  <div key={item.asset} className="bg-white/95 backdrop-blur p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-[#1e3a5f]">{item.asset}</span>
                      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl shadow-inner">
                        <button type="button" onClick={() => setMaintenance(prev => ({ ...prev, items: prev.items.map(i => i.asset === item.asset ? { ...i, status: 'BUEN ESTADO' } : i) }))} className={`px-4 py-1.5 rounded-lg text-[8px] font-black transition-all ${item.status === 'BUEN ESTADO' ? 'bg-[#1e3a5f] text-white shadow-md' : 'text-slate-400'}`}>BUEN ESTADO</button>
                        <button type="button" onClick={() => setMaintenance(prev => ({ ...prev, items: prev.items.map(i => i.asset === item.asset ? { ...i, status: 'MAL ESTADO' } : i) }))} className={`px-4 py-1.5 rounded-lg text-[8px] font-black transition-all ${item.status === 'MAL ESTADO' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400'}`}>MAL ESTADO</button>
                      </div>
                    </div>
                    {item.status === 'MAL ESTADO' && (
                      <select className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black outline-none animate-in slide-in-from-top-2" value={item.incidenceType || ''} onChange={e => setMaintenance(prev => ({ ...prev, items: prev.items.map(i => i.asset === item.asset ? { ...i, incidenceType: e.target.value } : i) }))}>
                        <option value="">MOTIVO INCIDENCIA...</option>
                        {MAINTENANCE_INCIDENCES.map(inc => <option key={inc} value={inc}>{inc}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                <div className="space-y-3">
                   <textarea placeholder="COMENTARIO GENERAL MANTENIMIENTO..." className="w-full p-4 bg-white/95 rounded-2xl text-[10px] font-black uppercase outline-none shadow-inner min-h-[80px]" value={maintenance.generalComment} onChange={e => setMaintenance(prev => ({ ...prev, generalComment: e.target.value }))} />
                   <label className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${maintenance.photo ? 'bg-emerald-500 text-white border-white' : 'bg-[#1e3a5f] text-white border-white/20'}`}>
                     <Camera size={20} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">{maintenance.photo ? 'FOTO CAPTURADA' : 'FOTO PARA TODOS'}</span>
                     <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && readFileAsDataURL(e.target.files[0], (s) => setMaintenance(prev => ({ ...prev, photo: s })))} />
                   </label>
                </div>
              </div>
            </section>

            {/* 8. ACTIVIDADES DE LA COMPETENCIA */}
            <section>
              <div className="bg-[#8faadc] text-[#1e3a5f] p-4 rounded-t-3xl text-center font-black text-xs uppercase tracking-widest">Actividades de la Competencia</div>
              <div className="bg-white rounded-b-3xl border border-slate-100 shadow-sm overflow-hidden p-5 space-y-6">
                 <div className="flex gap-2">
                    {COMPETITOR_CATEGORIES.map(cat => (
                      <div key={cat} className="flex-1 space-y-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase px-1">{cat}</span>
                         <div className="flex flex-col gap-1.5">
                            {COMPETITOR_ACTIVITIES.map(act => (
                              <button key={act} type="button" onClick={() => setCompetitorActivities(prev => [...prev, { category: cat, activity: act, observations: '' }])} className="text-left px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black hover:border-blue-500 hover:text-blue-600 transition-all flex justify-between items-center group shadow-sm">
                                {act} <Plus size={12} className="text-slate-300 group-hover:text-blue-500" />
                              </button>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="space-y-4">
                   {competitorActivities.map((hallazgo, idx) => (
                     <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 animate-in slide-in-from-right-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">{hallazgo.category} • {hallazgo.activity}</span>
                          <button type="button" onClick={() => setCompetitorActivities(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-rose-500"><Ban size={14} /></button>
                        </div>
                        <div className="flex gap-3">
                           <label className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-white ${hallazgo.photo ? 'border-emerald-500' : 'border-slate-200'}`}>
                              {hallazgo.photo ? <img src={hallazgo.photo} className="w-full h-full object-cover" /> : <Camera size={20} className="text-slate-300" />}
                              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && readFileAsDataURL(e.target.files[0], (s) => setCompetitorActivities(prev => prev.map((h, i) => i === idx ? { ...h, photo: s } : h)))} />
                           </label>
                           <textarea placeholder="OBSERVACIONES..." className="flex-1 p-3 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={hallazgo.observations} onChange={e => setCompetitorActivities(prev => prev.map((h, i) => i === idx ? { ...h, observations: e.target.value } : h))} />
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            </section>

            {/* 9. CIERRE */}
            <section>
              <StepHeader icon={CheckCircle2} title="9. Finalizar Visita" color="text-emerald-500" />
              <div className="space-y-4">
                <QuestionCard label="¿ACTIVOS LIMPIOS Y ORDENADOS?" icon={Sparkles} value={finalAudit.assetsCleaned} onChange={(v: boolean) => setFinalAudit(prev => ({ ...prev, assetsCleaned: v }))} isRequired onComment={(c: string) => setFinalAudit(prev => ({ ...prev, comment: c }))} comment={finalAudit.comment} />
                <label className={`relative block aspect-video w-full rounded-3xl border-2 border-dashed overflow-hidden cursor-pointer transition-all ${finalAudit.panoramicPhoto ? 'bg-emerald-50 border-emerald-300' : 'bg-[#1e3a5f] text-white shadow-xl shadow-blue-900/40'}`}>
                  {finalAudit.panoramicPhoto ? <img src={finalAudit.panoramicPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><Camera size={32} /><span className="text-[10px] font-black uppercase tracking-widest">FOTO PANORÁMICA FINAL *</span></div>}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && readFileAsDataURL(e.target.files[0], (s) => setFinalAudit(prev => ({ ...prev, panoramicPhoto: s })))} />
                </label>
              </div>
            </section>
          </>
        )}

        {isAnalyzing && (
          <div className="fixed inset-0 z-[100] bg-[#1e3a5f]/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
            <Loader2 className="animate-spin mb-6" size={48} />
            <h2 className="text-xl font-black uppercase tracking-widest mb-2">Analizando con IA</h2>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Validando cumplimiento en tiempo real...</p>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 z-[49]">
          <button type="submit" disabled={isSubmitting} className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${isStoreOpen ? 'bg-[#1e3a5f] text-white shadow-blue-900/40' : 'bg-orange-600 text-white shadow-orange-900/40'}`}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={22} />} 
            {isStoreOpen ? 'FINALIZAR REPORTE COMPLETO' : 'FIN (LOCAL CERRADO)'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAuditForm;
