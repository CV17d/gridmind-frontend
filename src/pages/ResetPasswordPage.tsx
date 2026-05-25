import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../services/api';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Token de seguridad no proporcionado.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess('Contraseña restablecida correctamente.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al restablecer la contraseña, token inválido o caducado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-brand-header">
        <svg
          className="brand-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="brand-text">GridMind</span>
      </div>

      <div className="login-title-section">
        <h1 className="login-h1">Establecer Nueva Clave</h1>
        <p className="login-subtitle">
          Protocolo de seguridad abierto. Por favor ingresa tu nueva contraseña.
        </p>
      </div>

      <div className="login-form-card">
        {error && <div className="login-error-toast">{error}</div>}
        {success && (
          <div style={{
            background: 'rgba(60, 236, 176, 0.1)',
            border: '1px solid rgba(60, 236, 176, 0.2)',
            color: '#3cecb0',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {success} Redirigiendo...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label className="login-label">NUEVA CONTRASEÑA</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Ingresa tu nueva clave maestra"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={64}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-button" disabled={isLoading || !!success}>
            {isLoading ? 'PROCESANDO...' : 'CAMBIAR CONTRASEÑA'}
          </button>
        </form>

        <div className="login-register-prompt">
          <Link to="/login">Volver al ingreso seguro</Link>
        </div>
      </div>

      <div className="login-page-footer">
        <div className="footer-mini-links">
          <Link to="#">SOPORTE</Link>
          <Link to="#">TÉRMINOS</Link>
          <Link to="#">PRIVACIDAD</Link>
        </div>
        <div className="footer-copyright">
          © 2026 GRIDMIND SYSTEMS PROTOCOL
        </div>
      </div>
    </div>
  );
}
