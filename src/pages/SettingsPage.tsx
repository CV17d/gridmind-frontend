import { useState, useEffect } from 'react';
import { getUserProfile, updateSettings, changePassword } from '../services/api';
import { User, Zap, Bell, Lock, Save, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { userName, login, token, userEmail } = useAuth();

  // Perfil
  const [name, setName] = useState(userName || '');
  // Tarifa y umbral
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [alertThreshold, setAlertThreshold] = useState('50');
  // Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    getUserProfile().then(res => {
      setName(res.data.name || '');
      setElectricityRate(res.data.electricityRate?.toString() || '0.12');
      setAlertThreshold(res.data.alertThreshold?.toString() || '50');
    }).catch(() => { });
  }, []);

  const handleSaveSettings = async () => {
    setLoadingSettings(true);
    try {
      await updateSettings({
        name,
        electricityRate: parseFloat(electricityRate),
        alertThreshold: parseFloat(alertThreshold),
      });
      // Actualizar nombre en el contexto global
      if (token && userEmail) {
        login(token, userEmail, name);
      }
      toast.success('Ajustes guardados correctamente.');
    } catch {
      toast.error('Error al guardar los ajustes.');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoadingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('La contraseña actual es incorrecta.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── CARD: PERFIL Y TARIFAS ── */}
        <div className="card" style={{ border: '1px solid rgba(16,185,129,0.2)', gridColumn: '1 / 2' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="stat-icon-box"><User size={18} /></div>
              <h3 style={{ margin: 0 }}>Perfil y Configuración</h3>
            </div>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Nombre */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                NOMBRE COMPLETO
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', marginTop: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                placeholder="Tu nombre completo"
              />
            </div>

            {/* Tarifa eléctrica - Editable con indicador de auto-detección */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={12} color="var(--accent-green)" /> TARIFA ELÉCTRICA ($ / kWh) 
                {parseFloat(electricityRate) > 0 && (
                  <span style={{ fontSize: '9px', color: 'var(--accent-green)', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: 10, marginLeft: 'auto' }}>
                    SINCERIZADA POR IA ✓
                  </span>
                )}
              </label>
              <div style={{ position: 'relative', marginTop: 8 }}>
                <input
                  type="number"
                  step="0.0001"
                  value={electricityRate}
                  onChange={e => setElectricityRate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 14px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(16,185,129,0.3)', 
                    borderRadius: 8, 
                    color: '#fff', 
                    fontSize: 16, 
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono',
                    boxSizing: 'border-box' 
                  }}
                  placeholder="0.1200"
                />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
                Valor extraído de tu factura. Si es incorrecto (ej: {'>'} $1.00), por favor corrígelo manualmente.
              </p>
            </div>

            {/* Umbral de alerta */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bell size={12} color="var(--accent-red)" /> LÍMITE DE ALERTA (kWh) <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>(recomendado: 50 kWh para uso residencial)</span>
              </label>
              <input
                type="number"
                step="1"
                value={alertThreshold}
                onChange={e => setAlertThreshold(e.target.value)}
                style={{ width: '100%', marginTop: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                placeholder="50"
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                Recibirás una alerta cuando tu consumo supere este valor.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSaveSettings}
              disabled={loadingSettings}
              style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 8 }}
            >
              <Save size={16} />
              {loadingSettings ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        {/* ── CARD: CAMBIAR CONTRASEÑA ── */}
        <div className="card" style={{ border: '1px solid rgba(168,85,247,0.2)', gridColumn: '2 / 3' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="stat-icon-box" style={{ color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)' }}><Lock size={18} /></div>
              <h3 style={{ margin: 0 }}>Seguridad</h3>
            </div>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>CONTRASEÑA ACTUAL</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={{ width: '100%', marginTop: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>NUEVA CONTRASEÑA</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ width: '100%', marginTop: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>CONFIRMAR CONTRASEÑA</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', marginTop: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                placeholder="••••••••"
              />
            </div>

            {/* Requisitos */}
            <div style={{ padding: '12px', background: 'rgba(168,85,247,0.05)', borderRadius: 8, border: '1px solid rgba(168,85,247,0.15)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                <CheckCircle size={11} style={{ marginRight: 4, verticalAlign: 'middle', color: newPassword.length >= 6 ? 'var(--accent-green)' : 'var(--text-muted)' }} />
                Mínimo 6 caracteres
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                <CheckCircle size={11} style={{ marginRight: 4, verticalAlign: 'middle', color: newPassword && newPassword === confirmPassword ? 'var(--accent-green)' : 'var(--text-muted)' }} />
                Las contraseñas coinciden
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleChangePassword}
              disabled={loadingPassword || !currentPassword || !newPassword || !confirmPassword}
              style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', marginTop: 8 }}
            >
              <Lock size={16} />
              {loadingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>

      </div>

      {/* ── INFO CARD ── */}
      <div className="card" style={{ marginTop: 24, border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.03)' }}>
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Zap size={20} color="var(--accent-blue)" />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Tarifa Estimada Actual</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Con tu tarifa de <strong style={{ color: 'var(--accent-green)' }}>${parseFloat(electricityRate || '0').toFixed(3)}/kWh</strong>,
              si tu predicción IA es de 208 kWh, tu costo estimado mensual sería de{' '}
              <strong style={{ color: '#fff' }}>${(208 * parseFloat(electricityRate || '0')).toFixed(2)}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
