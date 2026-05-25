import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadCount, getDailyAnalytics, getForecast, getComparison, getDevices } from './services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Cpu, 
  FileText, 
  Bell, 
  Zap, 
  Settings, 
  LifeBuoy, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import BillsPage from './pages/BillsPage';
import AlertsPage from './pages/AlertsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppLayout() {
  const { logout, userEmail, userName } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Panel de Control';
      case '/devices': return 'Gestión de Activos';
      case '/bills': return 'Inteligencia de Facturación';
      case '/alerts': return 'Monitor de Alertas';
      default: return 'GridMind Central';
    }
  };

  useEffect(() => {
    getUnreadCount()
      .then(res => setUnread(typeof res.data === 'number' ? res.data : (res.data?.unreadAlerts || 0)))
      .catch(() => {});
    setIsMobileMenuOpen(false);
  }, [location.pathname]);



  const generatePDF = async () => {
    const loadingToast = toast.loading("Preparando reporte...");
    try {
      const [analyticsRes, forecastRes, comparisonRes, devicesRes] = await Promise.all([
        getDailyAnalytics().catch(() => ({ data: [] })),
        getForecast().catch(() => ({ data: null })),
        getComparison().catch(() => ({ data: null })),
        getDevices().catch(() => ({ data: [] }))
      ]);

      const chartData = Array.isArray(analyticsRes.data) ? analyticsRes.data : [];
      const forecast = forecastRes.data;
      const comparison = comparisonRes.data;
      const deviceCount = Array.isArray(devicesRes.data) ? devicesRes.data.length : 0;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("GridMind | Reporte Energético", 20, 25);
      doc.setFontSize(9);
      doc.text(`Fecha: ${new Date().toLocaleString()}`, pageWidth - 70, 25);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text("1. Análisis de Consumo", 20, 55);
      
      const totalKwhVal = chartData.reduce((acc: number, curr: any) => acc + (curr.totalKwh || 0), 0);
      
      autoTable(doc, {
        startY: 62,
        head: [['Métrica', 'Detalle']],
        body: [
          ['Dispositivos Conectados', deviceCount.toString()],
          ['Consumo Acumulado', `${totalKwhVal.toFixed(2)} kWh (Kilovatios-hora)`],
          ['Predicción IA (30 días)', `${forecast?.predicted_next_30_days?.toFixed(2) || 'Sin datos'} kWh`],
          ['Estado General', 'SISTEMA OPERATIVO']
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [15, 23, 42] }
      });

      let currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("2. Auditoría Inteligente", 20, currentY);

      if (comparison && comparison.status === 'SUCCESS') {
        autoTable(doc, {
          startY: currentY + 5,
          body: [
            ['KWh Facturado (Compañía)', `${comparison.billKwh} kWh`],
            ['KWh Medido (GridMind)', `${comparison.measuredKwh?.toFixed(2)} kWh`],
            ['Diferencia Detectada', `${((comparison.billKwh || 0) - (comparison.measuredKwh || 0)).toFixed(2)} kWh`]
          ],
          theme: 'plain',
          styles: { fontSize: 10 }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const advice = comparison.advice || "No hay recomendaciones para este periodo.";
        const splitAdvice = doc.splitTextToSize(`Recomendación IA: ${advice}`, pageWidth - 40);
        doc.text(splitAdvice, 20, currentY);
      } else {
        doc.setFontSize(10);
        doc.text("Pendiente: No se encontraron facturas analizadas para este periodo.", 20, currentY + 10);
      }

      doc.save(`GridMind_Reporte_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Reporte descargado correctamente.", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Error al generar el reporte PDF.", { id: loadingToast });
    }
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/devices', icon: <Cpu size={20} />, label: 'Dispositivos' },
    { to: '/bills', icon: <FileText size={20} />, label: 'Facturas IA' },
    { to: '/alerts', icon: <Bell size={20} />, label: 'Alertas', badge: unread },
  ];

  return (
    <div className={`app-layout ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
      
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={28} fill="var(--accent-green)" color="var(--accent-green)" style={{ filter: 'drop-shadow(0 0 8px var(--accent-green))' }} />
            <h1 style={{ margin: 0 }}>GridMind</h1>
          </div>
          <p>PRECISIÓN TÉCNICA</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && item.badge > 0 ? (
                <span className="notification-dot" style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: 'var(--accent-red)', 
                  borderRadius: '50%', 
                  marginLeft: '8px',
                  boxShadow: '0 0 8px var(--accent-red)'
                }}></span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="energy-report-btn" onClick={generatePDF}>
            <Zap size={18} fill="currentColor" />
            Reporte Energético
          </button>
          
          <NavLink to="/settings" className="footer-link">
            <Settings size={18} />
            Ajustes
          </NavLink>
          
          <NavLink to="/support" className="footer-link">
            <LifeBuoy size={18} />
            Soporte
          </NavLink>

          <button 
            className="footer-link" 
            onClick={logout} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', padding: 0 }}
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="header-info">
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '-0.5px' }}>{getPageTitle()}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bienvenido de nuevo al centro de control</p>
        </div>
        <div className="header-actions">
            <div className="status-badge">
              <span className="status-dot"></span>
              ESTADO EN VIVO
            </div>
            
            <div className="user-profile">
              <div className="user-info">
                <div className="user-status">CONECTADO</div>
                <div className="user-name" style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{userName || 'Usuario'}</div>
              </div>
              <div className="avatar">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || userEmail}`} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
