import { useState, type FormEvent } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError('Debes autorizar el Protocolo Cinético para continuar.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerUser(name, email, password);
      setSuccess('¡Flujo inicializado! Redirigiendo al enlace neuronal...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      if (err.response) {
        setError(`Error en la secuencia: ${err.response.data?.message || err.response.statusText}`);
      } else if (err.request) {
        setError('Sin conexión al servidor central. Verifica tu red.');
      } else {
        setError('Ocurrió una anomalía inesperada.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper register-variant">

      {/* --- LOGO SUPERIOR --- */}
      <div className="login-brand-header">
        <Zap size={28} fill="#3cecb0" color="#3cecb0" style={{ filter: 'drop-shadow(0 0 8px rgba(60, 236, 176, 0.4))' }} />
        <span className="brand-text">GridMind</span>
      </div>

      {/* --- CARD CENTRAL --- */}
      <div className="login-form-card register-card-expand">

        <div className="register-title-section">
          <h1 className="login-h1">Únete a GridMind</h1>
          <p className="login-subtitle">Inicializa tu flujo de datos cinéticos</p>
        </div>

        {error && <div className="login-error-toast">{error}</div>}
        {success && <div className="login-success-toast">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">

          <div className="login-input-group">
            <label className="login-label">NOMBRE COMPLETO</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              </span>
              <input type="text" className="login-input has-left-icon" placeholder="Alex Sterling" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-label">EMAIL DE TRABAJO</label>
            <div className="input-with-icon">
              <span className="input-icon font-symbol">@</span>
              <input type="email" className="login-input has-left-icon" placeholder="alex@gridmind.io" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={80} />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-label">CLAVE DE SEGURIDAD</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
              </span>
              <input type={showPassword ? "text" : "password"} className="login-input has-left-icon has-right-icon" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={64} />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.83 9L15 12.16V12a3 3 0 00-3-3h-.17zm-4.3.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.3-3.1c3.48 0 6.58 2.12 8.1 5.3-.39.81-.88 1.56-1.44 2.25l-1.5-1.5c.34-.52.63-1.07.86-1.65-1.51-3.64-5.05-6.1-9.02-6.1-1.07 0-2.09.23-3.03.62l1.6 1.6c.45-.14.92-.22 1.43-.22zm-6.66-.7L3.9 4.7 2.5 6.1l3.32 3.32C4.17 10.32 2.87 11.45 2 12c1.51 3.64 5.05 6.1 9.02 6.1 1.48 0 2.89-.35 4.14-1l3.44 3.44 1.41-1.41-4.7-4.7-6.04-6.04L5.17 5.3z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="kinetic-terms-box">
            <label className="cyber-checkbox-label">
              <input type="checkbox" className="cyber-checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span className="checkmark"></span>
              <span className="terms-text">
                Autorizo la sincronización de mi perfil y acepto los <Link to="#">Términos de Servicio</Link>.
              </span>
            </label>
          </div>

          <button type="submit" className="login-submit-button btn-arrow" disabled={loading || !agree}>
            {loading ? 'Inicializando...' : 'Crear Cuenta'}
            {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>}
          </button>
        </form>

        <div className="login-register-prompt prompt-bottom">
          ¿Ya tienes una cuenta? <Link to="/login" className="green-link">Iniciar sesión</Link>
        </div>
      </div>

      <div className="register-footer-icons hide-mobile">
        <svg className="f-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
        <svg className="f-icon link-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
      </div>

      {/* --- FOOTER INFERIOR TIPO NAV --- */}
      <div className="register-panoramic-footer">
        <div className="footer-col-left">
          <span className="brand-text green-tint">GridMind</span>
          <span className="legal-text">© 2026 GridMind</span>
        </div>
        <div className="footer-col-center">
          <Link to="#">Política de Privacidad</Link>
          <Link to="#">Términos de Servicio</Link>
          <Link to="#">Cumplimiento Energético</Link>
        </div>
        <div className="footer-col-right hide-mobile">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v4h-2zm0 6h2v2h-2z" /></svg>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z" /></svg>
        </div>
      </div>

    </div>
  );
}
