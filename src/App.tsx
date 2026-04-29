import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadCount } from './services/api';
import { 
  LayoutDashboard, 
  Cpu, 
  FileText, 
  Bell, 
  Zap, 
  Settings, 
  LifeBuoy, 
  LogOut 
} from 'lucide-react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import BillsPage from './pages/BillsPage';
import AlertsPage from './pages/AlertsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout() {
  const { logout, userEmail } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

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
      .then(res => setUnread(res.data?.unreadAlerts || 0))
      .catch(() => {});
  }, [location.pathname]);

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/devices', icon: <Cpu size={20} />, label: 'Dispositivos' },
    { to: '/bills', icon: <FileText size={20} />, label: 'Facturas IA' },
    { to: '/alerts', icon: <Bell size={20} />, label: 'Alertas', badge: unread },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>GridMind</h1>
          <p>TECHNICAL PRECISION</p>
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
              {item.badge ? <span className="badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="energy-report-btn">
            <Zap size={18} fill="currentColor" />
            Energy Report
          </button>
          
          <NavLink to="/settings" className="footer-link">
            <Settings size={18} />
            Settings
          </NavLink>
          
          <NavLink to="/support" className="footer-link">
            <LifeBuoy size={18} />
            Support
          </NavLink>

          <button 
            className="footer-link" 
            onClick={logout} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', padding: 0 }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
        <div className="header-info">
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '-0.5px' }}>{getPageTitle()}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bienvenido de nuevo al centro de control</p>
        </div>
        <div className="header-actions">
            <div className="status-badge">
              <span className="status-dot"></span>
              LIVE STATUS
            </div>
            
            <Bell size={20} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
            
            <div className="user-profile">
              <div className="user-info">
                <div className="user-status">CONNECTED</div>
                <div className="user-id">ID: 0x6842</div>
              </div>
              <div className="avatar">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`} 
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
          <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
          <Route path="/support" element={<div>Support Page (Coming Soon)</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
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
