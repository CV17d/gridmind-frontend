import { useState, type FormEvent } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      login(res.data.token, email, res.data.name);
      navigate('/', { replace: true });
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">

      {/* --- LOGO SUPERIOR --- */}
      <div className="login-brand-header">
        <Zap size={28} fill="#3cecb0" color="#3cecb0" style={{ filter: 'drop-shadow(0 0 8px rgba(60, 236, 176, 0.4))' }} />
        <span className="brand-text">GridMind</span>
      </div>

      {/* --- TÍTULOS --- */}
      <div className="login-title-section">
        <h1 className="login-h1">Bienvenido de nuevo</h1>
        <p className="login-subtitle">Gestión Inteligente de Energía</p>
      </div>

      {error && <div className="login-error-toast">{error}</div>}

      {/* --- CARD DEL FORMULARIO --- */}
      <div className="login-form-card">
        <form onSubmit={handleSubmit} className="login-form">

          <div className="login-input-group">
            <label className="login-label">EMAIL</label>
            <input
              type="email"
              className="login-input"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={80}
            />
          </div>

          <div className="login-input-group">
            <div className="login-label-row">
              <label className="login-label">CONTRASEÑA</label>
              <Link to="/forgot-password" className="login-forgot-link">¿OLVIDASTE TU CONTRASEÑA?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={64}
                style={{ paddingRight: '48px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}>
                {showPassword ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation: 'icon-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation: 'icon-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-button" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>

      {/* --- TEXTO DE REGISTRO EXTERNO --- */}
      <div className="login-register-prompt">
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </div>

      {/* --- FOOTER INFERIOR --- */}
      <div className="login-page-footer">
        <div className="footer-mini-links">
          <Link to="#">PRIVACIDAD</Link>
          <Link to="#">TÉRMINOS</Link>
          <Link to="#">SOPORTE</Link>
        </div>
        <div className="footer-copyright">
          © 2026 GRIDMIND - GESTIÓN INTELIGENTE DE ENERGÍA
        </div>
      </div>

    </div>
  );
}
