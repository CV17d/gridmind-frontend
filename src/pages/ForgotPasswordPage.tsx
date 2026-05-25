import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const resp = await forgotPassword(email);
      setSuccess(resp.data.message || 'Instrucciones enviadas');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
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
        <h1 className="login-h1">Recupera tu acceso</h1>
        <p className="login-subtitle">
          Ingresa tu correo para recibir los protocolos de reestablecimiento.
        </p>
      </div>

      <div className="login-form-card">
        {error && <div className="login-error-toast">{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center', color: '#8b9bb4' }}>
            <div style={{ 
              background: 'rgba(60, 236, 176, 0.1)', 
              color: '#3cecb0', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              border: '1px solid rgba(60, 236, 176, 0.2)' 
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 48, height: 48, marginBottom: 12 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <br/>
              <b>{success}</b>
            </div>
            <p>
              Por favor revisa tu bandeja de entrada y carpeta de Spam. El enlace expirará en 15 minutos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label className="login-label">Correo Electrónico</label>
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

            <button type="submit" className="login-submit-button" disabled={isLoading}>
              {isLoading ? 'PROCESANDO...' : 'ENVIAR INSTRUCCIONES'}
            </button>
          </form>
        )}

        {!success && (
          <div className="login-register-prompt">
            ¿Recordaste tu contraseña? <Link to="/login">Volver al ingreso</Link>
          </div>
        )}
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
