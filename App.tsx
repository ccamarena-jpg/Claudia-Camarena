
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NewAuditForm from './components/NewAuditForm';
import HistoryView from './components/HistoryView';
import Login from './components/Login';
import RouteView from './components/RouteView';
import RouteManager from './components/RouteManager';
import StoreCatalog from './components/StoreCatalog';
import { POSAudit, User, Route, AssignedStore, StoreMaster } from './types';

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Administrador Central', role: 'admin' },
  { id: 'u2', name: 'Carlos Auditor', role: 'auditor' },
  { id: 'u3', name: 'Ana Trade', role: 'auditor' },
];

const INITIAL_MASTER_STORES: StoreMaster[] = [
  { id: 's-b1', name: 'OXXO - BATRICH', address: 'Av. San Borja Sur 1002', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.10082749, lng: -76.99370654 } },
  { id: 's-o1', name: 'OXXO - ORDOÑEZ', address: 'Jr. Ordoñez 198 – San Borja', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.1057608, lng: -77.00747474 } },
  { id: 's-v1', name: 'OXXO - VELASQUEZ', address: 'Las Artes Norte 903, San Borja', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.0899646, lng: -76.9974075 } },
  { id: 's-p1', name: 'PRIMAX - E/S NAVAL', address: 'AV. SAN LUIS 2480', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.0983738, lng: -76.99519799 } },
  { id: 's-p2', name: 'PRIMAX - E/S PRINCIPAL', address: 'AV. JOSÉ GÁLVEZ BARRENECHEA 1105, URB. CORPAC', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.1072739, lng: -77.0103314 } },
  { id: 's-p3', name: 'PRIMAX - E/S SAN LUIS 2', address: 'AV. SAN LUIS 2612 _ SAN BORJA', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.1008933, lng: -76.99431991 } },
  { id: 's-t1', name: 'TAMBO - BARRENECHEA C12', address: 'Av. Jose Galvez Barrenechea N° 1204 MZ C LT 10', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.10844, lng: -77.0097871 } },
  { id: 's-t2', name: 'TAMBO - JPRADO-C27', address: 'AV JAVIER PRADO ESTE 2750 MZ L3 LT 14', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.08752, lng: -76.9970192 } },
  { id: 's-t3', name: 'TAMBO - SANBORJASUR-C2', address: 'AVENIDA SAN BORJA SUR N° 247', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.09985, lng: -77.0086301 } },
  { id: 's-t4', name: 'TAMBO - SANLUIS-C20', address: 'Av. San Luis N° 2030', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.09061, lng: -76.9963 } },
  { id: 's-t5', name: 'TAMBO - SANLUIS-C24', address: 'Av. san luis 2498, Mz G13 Lt 4 san borja', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.098765, lng: -76.995077 } },
  { id: 's-t6', name: 'TAMBO - SANLUIS-C26', address: 'AV. SAN LUIS 2622 _ SAN BORJA', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.10128, lng: -76.9947 } },
  { id: 's-t7', name: 'TAMBO - TDA SAN BORJA', address: 'AV SAN BORJA 996 (PRIMER PISO)', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.09329, lng: -76.99586 } },
  { id: 's-on1', name: 'OXXO - NORTE', address: 'Av. Aviación 2699 – San Borja', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.0939721, lng: -77.0025322 } },
  { id: 's-r1', name: 'REPSOL - EL AVION', address: 'AV. AVIACIÓN 3401', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.1054831, lng: -77.0007611 } },
  { id: 's-r2', name: 'REPSOL - PRIMAVERA', address: 'Av. Primavera 1230', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.1124, lng: -76.9854 } },
  { id: 's-ox2', name: 'OXXO - AVIACION', address: 'Av. Aviacion 3120', district: 'SAN BORJA', city: 'Lima', location: { lat: -12.1023, lng: -77.0012 } }
];

const INITIAL_AUDITS: POSAudit[] = [
  {
    id: 'a1',
    timestamp: Date.now() - 86400000 * 2,
    storeName: 'OXXO - BATRICH',
    address: 'Av. San Borja Sur 1002',
    auditorId: 'u2',
    auditorName: 'Carlos Auditor',
    storeStatus: 'Tienda Abierta' as any,
    details: { finalLayout: { value: true } } as any,
    items: [{ skuName: 'VUSE SOLO', quantity: 12, condition: 'Perfecto Estado' }], oosItems: [], checklist: []
  },
  {
    id: 'a2',
    timestamp: Date.now() - 86400000,
    storeName: 'PRIMAX - E/S NAVAL',
    address: 'AV. SAN LUIS 2480',
    auditorId: 'u2',
    auditorName: 'Carlos Auditor',
    storeStatus: 'Tienda Abierta' as any,
    details: { finalLayout: { value: true } } as any,
    items: [{ skuName: 'VELO MINT', quantity: 8, condition: 'Perfecto Estado' }], oosItems: [], checklist: []
  },
  {
    id: 'a3',
    timestamp: Date.now() - 3600000 * 5,
    storeName: 'TAMBO - JPRADO-C27',
    address: 'AV JAVIER PRADO ESTE 2750 MZ L3 LT 14',
    auditorId: 'u3',
    auditorName: 'Ana Trade',
    storeStatus: 'Tienda Abierta' as any,
    details: { finalLayout: { value: false, reason: 'TIENDA NO PERMITE' } } as any,
    items: [{ skuName: 'LUCKY STRIKE CLICK', quantity: 45, condition: 'Faltante' }], oosItems: [], checklist: []
  }
];

// Ruta solicitada para Carlos (u2) y Demo para el Administrador
const INITIAL_ROUTES: Route[] = [
  {
    id: 'r-demo-1',
    userId: 'u2',
    date: '2024-05-12',
    stores: INITIAL_MASTER_STORES.map(s => ({ ...s, completed: false }))
  },
  {
    id: 'r-demo-admin',
    userId: 'u1',
    date: '2024-05-12',
    stores: INITIAL_MASTER_STORES.slice(0, 5).map(s => ({ ...s, completed: false }))
  }
];

const App: React.FC = () => {
  const [availableUsers, setAvailableUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pos_available_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pos_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'route' | 'history' | 'admin' | 'catalog'>('dashboard');
  
  const [audits, setAudits] = useState<POSAudit[]>(() => {
    const saved = localStorage.getItem('pos_audits');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed : INITIAL_AUDITS;
  });

  const [routes, setRoutes] = useState<Route[]>(() => {
    const saved = localStorage.getItem('pos_routes');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed : INITIAL_ROUTES;
  });

  const [masterStores, setMasterStores] = useState<StoreMaster[]>(() => {
    const saved = localStorage.getItem('pos_master_stores');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed : INITIAL_MASTER_STORES;
  });

  const [auditingStore, setAuditingStore] = useState<AssignedStore | null>(null);

  useEffect(() => {
    localStorage.setItem('pos_available_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  useEffect(() => {
    localStorage.setItem('pos_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pos_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('pos_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('pos_master_stores', JSON.stringify(masterStores));
  }, [masterStores]);

  const handleLogin = (user: User) => {
    if (!availableUsers.find(u => u.id === user.id)) {
      setAvailableUsers([...availableUsers, user]);
    }
    setCurrentUser(user);
    setActiveTab(user.role === 'admin' ? 'dashboard' : 'route');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuditingStore(null);
  };

  const handleSaveAudit = (newAudit: POSAudit) => {
    setAudits([newAudit, ...audits]);
    
    // Update route status if it was from a route
    if (newAudit.storeId && currentUser) {
      setRoutes(prev => prev.map(r => {
        if (r.userId === currentUser.id) {
          return {
            ...r,
            stores: r.stores.map(s => s.id === newAudit.storeId ? { ...s, completed: true, auditId: newAudit.id } : s)
          };
        }
        return r;
      }));
    }
    
    setAuditingStore(null);
    setActiveTab('history');
  };

  const handleAuditFromRoute = (store: AssignedStore) => {
    setAuditingStore(store);
  };

  const handleSaveRoute = (newRoute: Route) => {
    setRoutes(prev => {
      const filtered = prev.filter(r => r.userId !== newRoute.userId);
      return [...filtered, newRoute];
    });
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} availableUsers={availableUsers} />;
  }

  // Intercept normal tab rendering if we are in the middle of an audit
  if (auditingStore) {
    return (
      <Layout activeTab="route" onTabChange={setActiveTab} user={currentUser} onLogout={handleLogout}>
        <NewAuditForm 
          onSave={handleSaveAudit} 
          user={currentUser} 
          prefillStore={auditingStore} 
          onCancel={() => setAuditingStore(null)}
        />
      </Layout>
    );
  }

  const userRoute = routes.find(r => r.userId === currentUser.id);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard audits={audits} />;
      case 'route':
        return <RouteView route={userRoute} onAuditStore={handleAuditFromRoute} />;
      case 'history':
        return <HistoryView audits={audits} />;
      case 'catalog':
        return currentUser.role === 'admin' ? (
          <StoreCatalog stores={masterStores} onUpdateStores={setMasterStores} />
        ) : <Dashboard audits={audits} />;
      case 'admin':
        return currentUser.role === 'admin' ? (
          <RouteManager 
            users={availableUsers} 
            existingRoutes={routes} 
            onSaveRoute={handleSaveRoute} 
            masterStores={masterStores}
          />
        ) : <Dashboard audits={audits} />;
      default:
        return <Dashboard audits={audits} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={currentUser} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
