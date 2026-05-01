import { ShieldCheck, Cpu, Smartphone, Zap, Key, ExternalLink } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="support-wrapper">
      <div className="page-header">
        <h2>Guía de Configuración</h2>
        <p>Sigue estos pasos para vincular tu dispositivo físico con la nube de GridMind</p>
      </div>

      <div className="support-grid">
        {/* PASO 1 */}
        <div className="card support-card">
          <div className="step-number">01</div>
          <div className="support-icon-box"><Key size={24} color="var(--accent-green)" /></div>
          <h3>Prepara tus Credenciales</h3>
          <p>Antes de conectar el hardware, ve a la sección de <strong>Dispositivos</strong> y copia los siguientes datos de tu equipo registrado:</p>
          <ul className="support-list">
            <li><Zap size={14} /> ESP32 ID (ej: esp32cocina)</li>
            <li><Zap size={14} /> API Key (Código UUID largo)</li>
          </ul>
        </div>

        {/* PASO 2 */}
        <div className="card support-card">
          <div className="step-number">02</div>
          <div className="support-icon-box"><Smartphone size={24} color="var(--accent-blue)" /></div>
          <h3>Conexión Inicial</h3>
          <p>Conecta tu ESP32 a la corriente. Escanea este código QR con tu celular para conectarte a su red de configuración sin necesidad de escribir la contraseña:</p>
          <div className="qr-container">
            <img src="/qr-wifi.png" alt="QR WiFi Configuración" className="qr-image" />
            <div className="qr-overlay">GridMind-Config</div>
          </div>
          <p className="hint text-center">O busca la red WiFi: <strong>GridMind-Config</strong></p>
        </div>

        {/* PASO 3 */}
        <div className="card support-card">
          <div className="step-number">03</div>
          <div className="support-icon-box"><ShieldCheck size={24} color="var(--accent-green)" /></div>
          <h3>Vinculación Web</h3>
          <p>Una vez conectado, se abrirá un portal en tu celular. Ingresa estos datos:</p>
          <div className="form-mockup">
            <div className="form-line"><span>WiFi:</span> Tu red de casa</div>
            <div className="form-line"><span>Password:</span> Tu clave de WiFi</div>
            <div className="form-line highlighted"><span>GridMind ID:</span> esp32cocina</div>
            <div className="form-line highlighted"><span>API Key:</span> 4b9079...</div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 15 }} disabled>Guardar Configuración</button>
        </div>

        {/* PASO 4 */}
        <div className="card support-card">
          <div className="step-number">04</div>
          <div className="support-icon-box"><Cpu size={24} color="#a855f7" /></div>
          <h3>¡Listo para Monitorear!</h3>
          <p>El dispositivo se reiniciará y se conectará a internet. Ve a tu <strong>Dashboard</strong> para empezar a recibir lecturas de energía en tiempo real.</p>
          <div className="success-badge">
            <div className="status-dot"></div> SISTEMA OPERATIVO
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ExternalLink size={20} color="var(--accent-blue)" />
            <h3 style={{ margin: 0 }}>¿Necesitas más ayuda técnica?</h3>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Si el dispositivo no aparece, asegúrate de presionar el botón <strong>BOOT/RESET</strong> durante 3 segundos para reiniciar la configuración de red. Para soporte avanzado, contacta a soporte@gridmind.lat
          </p>
        </div>
      </div>
    </div>
  );
}
