import { useState, useEffect } from 'react';
import { getDevices, createDevice, getRelayState, setRelayState } from '../services/api';
import { Plus, Cpu, Zap, Activity, Info, Key, X, Power, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Device {
  id: number;
  name: string;
  type: string;
  powerRating: number;
  esp32Id: string;
  apiKey: string;
  createdAt: string;
}

interface RelayStates {
  [deviceId: number]: boolean;
}

interface LoadingStates {
  [deviceId: number]: boolean;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'OUTLET', powerRating: 1000, esp32Id: '' });
  const [submitting, setSubmitting] = useState(false);

  // Estados del Relé por dispositivo
  const [relayStates, setRelayStates] = useState<RelayStates>({});
  const [relayLoading, setRelayLoading] = useState<LoadingStates>({});

  const fetchDevices = async () => {
    try {
      const res = await getDevices();
      const list: Device[] = Array.isArray(res.data) ? res.data : [];
      setDevices(list);

      // Cargar el estado del relé de cada dispositivo en paralelo
      const statePromises = list.map(async (d) => {
        try {
          const relayRes = await getRelayState(d.id);
          return { id: d.id, state: relayRes.data?.relayState ?? false };
        } catch {
          return { id: d.id, state: false };
        }
      });

      const results = await Promise.all(statePromises);
      const stateMap: RelayStates = {};
      results.forEach(r => { stateMap[r.id] = r.state; });
      setRelayStates(stateMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await createDevice(form);
      setShowModal(false);
      setForm({ name: '', type: 'OUTLET', powerRating: 1000, esp32Id: '' });
      await fetchDevices();
      toast.success('Dispositivo registrado correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar el dispositivo.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Envía el comando de encendido/apagado del relé al backend.
   * El backend actualiza el estado en memoria y el ESP32 lo lee en su próximo ciclo de 5 segundos.
   */
  const handleRelayToggle = async (device: Device) => {
    const currentState = relayStates[device.id] ?? false;
    const newState = !currentState;

    // Marcar este dispositivo como cargando para deshabilitar el botón
    setRelayLoading(prev => ({ ...prev, [device.id]: true }));

    try {
      await setRelayState(device.id, newState);

      // Actualizar el estado local inmediatamente para feedback visual instantáneo
      setRelayStates(prev => ({ ...prev, [device.id]: newState }));

      toast.success(
        newState
          ? `⚡ Relé de "${device.name}" ENCENDIDO. El ESP32 lo aplicará en segundos.`
          : `🔴 Relé de "${device.name}" APAGADO. El ESP32 lo aplicará en segundos.`,
        { duration: 4000 }
      );
    } catch (err) {
      console.error(err);
      toast.error(`Error al enviar el comando al dispositivo "${device.name}".`);
    } finally {
      setRelayLoading(prev => ({ ...prev, [device.id]: false }));
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Dispositivos</h2>
        <p>Gestiona tus enchufes y sensores inteligentes — controla el relé remotamente desde aquí.</p>
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
                  <th style={{ textAlign: 'center' }}>Control Relé</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(d => {
                  const isOn = relayStates[d.id] ?? false;
                  const isLoading = relayLoading[d.id] ?? false;

                  return (
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
                        onClick={() => {
                          navigator.clipboard.writeText(d.apiKey);
                          toast.success('✅ API Key copiada!');
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Key size={12} />
                          {d.apiKey.substring(0, 8)}...
                        </div>
                      </td>

                      {/* BOTÓN DE CONTROL DEL RELÉ */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          disabled={isLoading}
                          onClick={() => handleRelayToggle(d)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 18px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                            fontSize: 12,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            transition: 'all 0.25s ease',
                            background: isOn
                              ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                              : 'rgba(255,255,255,0.03)',
                            color: isOn ? 'var(--accent-green)' : 'var(--text-muted)',
                            border: isOn
                              ? '1px solid rgba(16, 185, 129, 0.5)'
                              : '1px solid var(--border-color)',
                            boxShadow: isOn ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none',
                            opacity: isLoading ? 0.6 : 1,
                          }}
                          title={isOn ? 'Clic para APAGAR el relé' : 'Clic para ENCENDER el relé'}
                        >
                          {isLoading ? (
                            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Power size={14} />
                          )}
                          {isLoading ? 'Enviando...' : isOn ? 'Encendido' : 'Apagado'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PANEL LATERAL: NUEVO DISPOSITIVO */}
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
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Hardware</label>
                  <select
                    className="form-input"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
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
                    onChange={e => setForm({ ...form, powerRating: Number(e.target.value) })}
                    max="10000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Identificador de Red (ESP32 ID)</label>
                  <input
                    className="form-input"
                    placeholder="Ej: GRID-NODE-001"
                    value={form.esp32Id}
                    onChange={e => setForm({ ...form, esp32Id: e.target.value })}
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

      {/* Animación del spinner de carga */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
