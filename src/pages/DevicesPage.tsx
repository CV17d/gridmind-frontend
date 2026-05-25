import { useState, useEffect } from 'react';
import { getDevices, createDevice } from '../services/api';
import { Plus, Cpu, Zap, Activity, Info, Key, X } from 'lucide-react';

interface Device {
  id: number;
  name: string;
  type: string;
  powerRating: number;
  esp32Id: string;
  apiKey: string;
  createdAt: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'OUTLET', powerRating: 1000, esp32Id: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await getDevices();
      setDevices(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDevices(); }, []);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await createDevice(form);
      setShowModal(false);
      setForm({ name: '', type: 'OUTLET', powerRating: 1000, esp32Id: '' });
      await fetchDevices();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Dispositivos</h2>
        <p>Gestiona tus enchufes y sensores inteligentes</p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Nuevo Dispositivo
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔌</div>
            <h3>No tienes dispositivos registrados</h3>
            <p>Agrega tu primer enchufe inteligente para empezar a monitorear.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Potencia (W)</th>
                  <th>ESP32 ID</th>
                  <th>API Key</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Activity size={14} color="var(--accent-green)" />
                        {d.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={14} style={{ opacity: 0.6 }} />
                        {d.type}
                      </div>
                    </td>
                    <td>{d.powerRating}W</td>
                    <td style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{d.esp32Id}</td>
                    <td
                      style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace', cursor: 'pointer' }}
                      title="Clic para copiar"
                      onClick={() => { navigator.clipboard.writeText(d.apiKey); alert('✅ API Key copiada!'); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Key size={12} />
                        {d.apiKey}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SIDE DRAWER: NUEVO DISPOSITIVO */}
      {showModal && (
        <div className="drawer-overlay" onClick={() => setShowModal(false)}>
          <div className="side-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Nuevo Dispositivo</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Configura una nueva unidad en tu red</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="drawer-content">
              <div className="drawer-section">
                <div className="drawer-section-title">
                  <Info size={14} /> Información Básica
                </div>
                
                <div className="form-group">
                  <label className="form-label">Nombre del Dispositivo</label>
                  <input 
                    className="form-input" 
                    placeholder="Ej: Enchufe Sala Principal" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Hardware</label>
                  <select 
                    className="form-input" 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    <option value="OUTLET">🔌 Enchufe Inteligente</option>
                    <option value="LIGHT">💡 Sistema de Iluminación</option>
                    <option value="SENSOR">📡 Sensor de Telemetría</option>
                  </select>
                </div>
              </div>

              <div className="drawer-section">
                <div className="drawer-section-title">
                  <Cpu size={14} /> Parámetros Técnicos
                </div>

                <div className="form-group">
                  <label className="form-label">Potencia Nominal (Watts)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={form.powerRating} 
                    onChange={e => setForm({...form, powerRating: Number(e.target.value)})} 
                    max="10000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Identificador de Red (ESP32 ID)</label>
                  <input 
                    className="form-input" 
                    placeholder="Ej: GRID-NODE-001" 
                    value={form.esp32Id} 
                    onChange={e => setForm({...form, esp32Id: e.target.value})} 
                    maxLength={20}
                  />
                </div>
              </div>

              <div style={{ marginTop: 'auto', padding: '24px 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCreate} disabled={submitting}>
                    {submitting ? 'Procesando...' : 'Registrar Dispositivo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
