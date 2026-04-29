import { useState, type FormEvent } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <svg className="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" />
        </svg>
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
            />
          </div>

          <div className="login-input-group">
            <div className="login-label-row">
              <label className="login-label">CONTRASEÑA</label>
              <Link to="/forgot-password" className="login-forgot-link">¿OLVIDASTE TU CONTRASEÑA?</Link>
            </div>
            <input
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
