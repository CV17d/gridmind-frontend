import { useState, useRef, useEffect } from 'react';
import { uploadBill, getMyBills, getBillImage } from '../services/api';
import { X, Info, Zap, Activity, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Bill {
  id: number;
  fileUrl: string;
  totalKwh: number;
  totalAmount: number;
  aiRecommendations: string;
  uploadedAt: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Bill | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Modal
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedBillImage, setSelectedBillImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    getMyBills().then(res => setBills(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setResult(null);
    const loadingToast = toast.loading("🤖 La IA está analizando tu factura...");
    try {
      const res = await uploadBill(selectedFile);
      setResult(res.data);
      setSelectedFile(null);
      const billsRes = await getMyBills();
      setBills(billsRes.data || []);
      toast.success("¡Análisis completado con éxito!", { id: loadingToast });
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.status === 413 
        ? "La foto es demasiado pesada. Intenta reducir la calidad o tomarla más lejos." 
        : "Error al conectar con la IA. Verifica tu conexión.";
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleBillClick = async (bill: Bill) => {
    setSelectedBill(bill);
    setSelectedBillImage(null);
    setImageLoading(true);
    try {
      const res = await getBillImage(bill.id);
      const imageUrl = URL.createObjectURL(res.data);
      setSelectedBillImage(imageUrl);
    } catch (err) {
      console.error("Error cargando la foto", err);
    } finally {
      setImageLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedBill(null);
    if (selectedBillImage) {
      URL.revokeObjectURL(selectedBillImage);
      setSelectedBillImage(null);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Asesor de Facturas</h2>
        <p>Sube una foto de tu factura de luz y la IA te dará recomendaciones</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div
          className="upload-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📸</div>
          <p>{selectedFile ? `📄 ${selectedFile.name}` : 'Haz clic para seleccionar la foto de tu factura'}</p>
          <p style={{ fontSize: '0.8rem', marginTop: 8, color: 'var(--text-muted)' }}>JPG, PNG o PDF</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        {selectedFile && (
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? '🤖 La IA está analizando tu factura...' : '🧠 Analizar con IA'}
            </button>
            <button className="btn btn-secondary" onClick={() => setSelectedFile(null)}>Cancelar</button>
          </div>
        )}
      </div>

      {result && (
        <div className="bill-result">
          <h3>🤖 Resultados del Análisis</h3>
          <div className="stat-grid">
            <div className="stat-card green">
              <div className="stat-label">Consumo Detectado</div>
              <div className="stat-value">{result.totalKwh} kWh</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-label">Monto de la Factura</div>
              <div className="stat-value">${result.totalAmount?.toLocaleString()}</div>
            </div>
          </div>
          <div className="advice">
            <strong>💡 Consejo del Asesor GridMind:</strong>
            <p style={{ marginTop: 8 }}>{result.aiRecommendations}</p>
          </div>
        </div>
      )}

      {bills.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <span className="card-title">📋 Historial de Facturas</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="col-date">Fecha</th>
                  <th className="col-kwh">kWh</th>
                  <th className="col-amount">Monto</th>
                  <th className="col-advice">Recomendación GridMind</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id} onClick={() => handleBillClick(b)} className="clickable-row">
                    <td>{new Date(b.uploadedAt).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{b.totalKwh} kWh</td>
                    <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>${b.totalAmount?.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {b.aiRecommendations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISOR DE IMAGEN A PANTALLA COMPLETA */}
      {fullScreenImage && (
        <div 
          className="drawer-overlay" 
          style={{ zIndex: 10000, justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' }}
          onClick={() => setFullScreenImage(null)}
        >
          <img 
            src={fullScreenImage} 
            alt="Factura Full" 
            style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }} 
          />
          <button 
            onClick={() => setFullScreenImage(null)}
            style={{ position: 'absolute', top: 30, right: 30, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* SIDE DRAWER DE FACTURA */}
      {selectedBill && (
        <div className="drawer-overlay" onClick={closeModal}>
          <div className="side-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Detalle de Factura</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ID: #{selectedBill.id} • {new Date(selectedBill.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="drawer-content">
              {/* Imagen de la factura */}
              <div 
                className="drawer-image-container" 
                style={{ cursor: 'zoom-in', position: 'relative' }}
                onClick={() => selectedBillImage && setFullScreenImage(selectedBillImage)}
              >
                {imageLoading ? (
                  <div className="spinner" style={{ width: '30px', height: '30px' }} />
                ) : selectedBillImage ? (
                  <>
                    <img src={selectedBillImage} alt="Factura" />
                    <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 6, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px' }}>
                      <Maximize2 size={12} />
                      CLIC PARA AGRANDAR
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Error al cargar imagen</p>
                )}
              </div>

              {/* Estadísticas rápidas */}
              <div className="drawer-section">
                <div className="drawer-section-title">
                  <Info size={14} /> Resumen de Análisis
                </div>
                <div className="drawer-stats">
                  <div className="mini-card">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={10} color="var(--accent-green)" />
                      Consumo
                    </label>
                    <span>{selectedBill.totalKwh} kWh</span>
                  </div>
                  <div className="mini-card">
                    <label>Monto</label>
                    <span>${selectedBill.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Recomendación de IA */}
              <div className="drawer-section">
                <div className="drawer-section-title">
                  <Activity size={14} /> Recomendación IA
                </div>
                <div className="advice-box">
                  {selectedBill.aiRecommendations}
                </div>
              </div>

              <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--border-color)' }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={closeModal}>
                  Cerrar Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
