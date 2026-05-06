
export enum MaterialType {
  POSTER = 'Afiche / Poster',
  WOBBLER = 'Wobbler',
  SHELF_TALKER = 'Cenefa / Shelf Talker',
  DISPLAY = 'Exhibidor / Floor Display',
  NECK_HANGER = 'Colgante de Cuello',
  OTHER = 'Otro'
}

export enum Condition {
  PERFECT = 'Perfecto Estado',
  DAMAGED = 'Dañado / Sucio',
  OUTDATED = 'Desactualizado',
  MISSING = 'Faltante'
}

export enum StoreStatus {
  OPEN = 'Tienda Abierta',
  CLOSED = 'Tienda Cerrada'
}

export const CLOSURE_REASONS = [
  'LOCAL DEJÓ DE FUNCIONAR',
  'LOCAL CERRADO POR INVENTARIO',
  'LOCAL EN AUDITORÍA',
  'LOCAL EN MANTENIMIENTO',
  'OTRO MOTIVO: COMENTARIO'
];

export enum AuditAccess {
  ALLOWED = 'Permitido',
  DENIED = 'Denegado'
}

export const DENIAL_REASONS = [
  'Staff ocupado',
  'Tienda en mantenimiento',
  'Counter con comida',
  'Otro (especificar)'
];

export enum AuditArea {
  CIGARRERA = 'CIGARRERA',
  CAJONERA = 'CAJONERA',
  DISPENSER = 'DISPENSER',
  GLORIFICADOR_VUSE = 'GLORIFICADOR VUSE',
  GLORIFICADOR_FMC = 'GLORIFICADOR FMC'
}

// MOTIVOS ESPECÍFICOS SEGÚN IMÁGENES
export const ASSET_INCIDENCE_REASONS = [
  'PRODUCTOS ENCIMA',
  'MATERIALES PEGADOS',
  'ACTIVO APAGADO',
  'OTRO MOTIVO: COMENTARIO'
];

export const ASSET_FIX_REASONS = [
  'TIENDA NO PERMITE RETIRAR',
  'TIENDA NO PERMITE ENCENDER ACTIVO',
  'OTRO MOTIVO: COMENTARIO'
];

// Added missing layout constants
export const LAYOUT_FAIL_REASONS = [
  'PRODUCTOS DESORDENADOS',
  'CONTAMINACIÓN MARCA',
  'FALTA DE PRODUCTO',
  'OTRO'
];

export const LAYOUT_FIX_REASONS = [
  'SE ORDENÓ SEGÚN PLANOGRAMA',
  'NO SE PERMITIÓ ORDENAR',
  'OTRO'
];

export const EXHIBITION_OPTIONS_DISPENSER = [
  'SI - PRIMERA POSICIÓN (DISPENSER)',
  'SI',
  'ACTIVO RETIRADO TRASCAJA',
  'ACTIVO GUARDADO EN ALMACEN',
  'ACTIVO MAL EXHIBIDO',
  'OTRO MOTIVO: COMENTARIO'
];

export const EXHIBITION_OPTIONS_GLORIFICADOR = [
  'SI',
  'ACTIVO RETIRADO TRASCAJA',
  'ACTIVO GUARDADO EN ALMACEN',
  'ACTIVO MAL EXHIBIDO',
  'OTRO MOTIVO: COMENTARIO'
];

export interface CampaignRecord {
  name: string;
  status: 'IMPLEMENTED' | 'INCIDENCE' | null;
  implementationType?: 'PRIMERA IMPLEMENTACIÓN' | 'REABASTECIMIENTO' | null;
  rectified?: boolean;
  photo?: string;
  comment: string;
}

export const CURRENT_CAMPAIGNS = [
  'ACOPLE PMI',
  'MARCAPRECIOS COMPLETOS',
  'STICKER FRIOS - VUSE',
  'TABLE TENT VELO',
  'TABLE TENT VUSE',
  'VIBRIN VUSE',
  'VIBRIN PACK LUCKY STRIKE',
  'VIBRIN +18 PRIMAX'
];

// Información detallada de recordatorio para el auditor
export const CAMPAIGN_DETAILS: Record<string, { material: string, action: string }> = {
  'ACOPLE PMI': { material: 'Acrílico Acople', action: 'Instalar en el lateral derecho del dispenser principal.' },
  'MARCAPRECIOS COMPLETOS': { material: 'Tira de Marcaprecios', action: 'Actualizar precios vigentes y asegurar alineación con el producto.' },
  'STICKER FRIOS - VUSE': { material: 'Vinil Adhesivo', action: 'Pegar en la puerta del cooler a la altura de la vista del cliente.' },
  'TABLE TENT VELO': { material: 'Portafiche de mesa', action: 'Colocar en la zona de pago (counter) sin obstruir otros medios de pago.' },
  'TABLE TENT VUSE': { material: 'Portafiche de mesa', action: 'Colocar junto a la zona de cigarrillos electrónicos.' },
  'VIBRIN VUSE': { material: 'Wobbler Vibrín', action: 'Colocar en el estante de Vuse asegurando que tenga movimiento.' },
  'VIBRIN PACK LUCKY STRIKE': { material: 'Wobbler Vibrín LS', action: 'Instalar junto al bloque de Lucky Strike en la cigarrera.' },
  'VIBRIN +18 PRIMAX': { material: 'Adhesivo Legal', action: 'Obligatorio: Pegar en zona visible de venta de tabaco.' }
};

export interface AuditIndicator {
  value: string | boolean | null;
  comment: string;
  photo?: string;
  reason?: string;
}

export interface POSAuditDetails {
  area: AuditArea;
  fefo?: AuditIndicator;
  initialLayout?: AuditIndicator;
  finalLayout?: AuditIndicator;
  contamination?: AuditIndicator;
  finalContamination?: AuditIndicator;
  vuseStorage?: AuditIndicator;
  incidence?: AuditIndicator;
  activeStatus?: AuditIndicator;
  exhibitionStatus?: AuditIndicator;
}

export enum SKUCategory {
  CIGARRILLOS = 'Cigarrillos',
  VUSE = 'Vuse',
  VELO = 'Velo'
}

export const SKU_LISTS = {
  [SKUCategory.CIGARRILLOS]: [
    '3991 LS RED-HL 10', '3997 LS RED-HL 20', '3992 LS BLUE-HL 10', '3998 LS BLUE-HL 20', '4227 LS FRESH-HL 10', '4228 LS FRESH-HL 20',
    '4001 LS BIG CHILL-HL 20', '6233 LS BIG CHILL-HL XL 10', '4000 LS CRUSH-HL 20', '6234 LS CRUSH-HL XL 10', '3999 LS WILD MIX-HL 20',
    '6236 LS WILD MIX-HL XL 10', '4002 LS FRESH TWIST-HL 20', '6235 LS FRESH TWIST-HL XL 10', '5030 LS DOUBLE CHILL 20',
    '4011 PALL MALL RED XL-HL 10', '4014 PALL MALL RED XL-HL 20', '4009 PALL MALL BLUE XL-HL 10', '4012 PALL MALL BLUE XL-HL 20',
    '4213 PALL MALL CLICK ON BLUE XL-HL 10', '4212 PALL MALL CLICK ON BLUE XL-HL 20', '4225 PALL MALL BOOST XL-HL 10',
    '4226 PALL MALL BOOST XL-HL 20', '4008 PALL MALL SUNSET XL HL 20', '5149 PALL MALL SUNRISE XL HL 20',
    '4019 WINSTON RED-HL 10', '4021 WINSTON RED-HL 20', '4020 WINSTON BLUE-HL 10', '4022 WINSTON BLUE-HL 20',
    '6231 WINSTON RED-HL 12', '6232 WINSTON BLUE-HL 12'
  ],
  [SKUCategory.VUSE]: [
    '6177 VUSE GREEN APPLE 1K', '6178 VUSE BERRY BLEND 1K', '6179 VUSE BERRY WATERMELON 1K', '6181 VUSE GRAPE ICE 1K',
    '6182 VUSE PEPPERMINT ICE 1K', '6183 VUSE WATERMELON ICE 1K', '6184 VUSE STRAWBERRY KIWI 1K', '6185 VUSE RASPBERRY 1K',
    '6186 VUSE CLASSIC PEACH 1K', '6187 VUSE GRAPE ICE 5K 2.0', '6188 VUSE GREEN APPLE 5K 2.0', '6189 VUSE BERRY BLEND 5K 2.0',
    '6190 VUSE BERRY WATERMELON 5K 2.0', '6191 VUSE RASPBERRY 5K 2.0', '6192 VUSE GRAPE ICE 8K', '6193 VUSE GREEN APPLE 8K',
    '6194 VUSE RASPBERRY 8K', '6195 VUSE GRAPE ICE 3K', '6196 VUSE BLUEBERRY ICE 3K', '6197 VUSE PEPPERMINT ICE 3K',
    '6198 VUSE GREEN APPLE 3K'
  ],
  [SKUCategory.VELO]: [
    'VELO SANDIA FRESCA 4MG', 'VELO MENTA FRESCA 4MG', 'VELO UVA MORADA 4MG',
    'VELO SANDIA FRESCA 6MG', 'VELO MENTA FRESCA 6MG', 'VELO UVA MORADA 6MG'
  ]
};

export const OOS_REASONS = [
  'DESPACHO NO LLEGA',
  'QUIEBRE TOTAL',
  'ROBO EN TIENDA',
  'OTRO'
];

export interface OOSRecord {
  skuName: string;
  meetsMinStock: boolean | null;
  comment: string;
}

export const MAINTENANCE_ASSETS = [
  'CIGARRERA',
  'CAJONERA',
  'DISPENSER',
  'GLORIFICADOR VUSE',
  'GLORIFICADOR FMC'
];

export const MAINTENANCE_INCIDENCES = [
  'FALLA LUZ LED',
  'VALIDACION TRANSFORMADOR',
  'REPARACION ACRILICO (PANTALLA)',
  'CAMBIO DE BRAZO HIDRAULICO',
  'RENOVACION DE CARRILERA',
  'CAMBIO DE ACTIVO',
  'REPARACION CAJONERA',
  'SOLICITUD ACTIVO',
  'OTRO'
];

export interface MaintenanceRecord {
  asset: string;
  status: 'BUEN ESTADO' | 'MAL ESTADO' | null;
  incidenceType?: string;
}

export interface MaintenanceAudit {
  items: MaintenanceRecord[];
  generalComment: string;
  photo?: string;
}

export const COMPETITOR_CATEGORIES = ['CIGARRILLOS', 'VAPES'];
export const COMPETITOR_ACTIVITIES = [
  'PROMOCIONES',
  'NUEVOS LANZAMIENTOS',
  'MATERIAL POP',
  'EXHIBIDOR DE LA COMPETENCIA',
  'OTROS'
];

export interface CompetitorActivityRecord {
  category: string;
  activity: string;
  photo?: string;
  observations: string;
}

export interface FinalAudit {
  assetsCleaned: boolean | null;
  comment: string;
  panoramicPhoto?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'auditor' | 'admin';
}

export interface StoreMaster {
  id: string;
  name: string;
  address: string;
  channel?: string;
  city?: string;
  district?: string;
  province?: string;
  location?: { lat: number; lng: number };
}

export interface AssignedStore extends StoreMaster {
  completed: boolean;
  auditId?: string;
}

export interface Route {
  id: string;
  userId: string;
  date: string;
  stores: AssignedStore[];
}

export interface StockCountItem {
  skuName: string;
  quantity: number;
  expirationDate: string;
}

export interface MaterialItem {
  id: string;
  type: MaterialType;
  condition: Condition;
  photoUrl?: string;
  photoBase64?: string;
  observations: string;
  quantity: number;
}

export interface DashboardStats {
  totalAudits: number;
  totalMaterials: number;
  complianceRate: number;
  pendingActions: number;
  totalOOS: number;
}

export interface POSAudit {
  id: string;
  timestamp: number;
  storeId?: string; 
  storeName: string;
  address: string;
  auditorId: string;
  auditorName: string;
  storeStatus: StoreStatus;
  statusPhotoBase64?: string;
  panoramicPhotoBefore?: string;
  auditAccess?: AuditAccess;
  denialReason?: string;
  personnelName?: string;
  openingComment?: string;
  closureReason?: string;
  details?: POSAuditDetails;
  stockCounts?: StockCountItem[];
  campaigns?: CampaignRecord[];
  oosRecords?: OOSRecord[];
  maintenance?: MaintenanceAudit;
  competitorActivities?: CompetitorActivityRecord[];
  finalAudit?: FinalAudit;
  items: MaterialItem[];
  oosItems: any[];
  checklist: any[];
  location?: { lat: number; lng: number; };
}
