import { useState, useRef } from 'react';
import { uploadBill, getMyBills, getBillImage } from '../services/api';
import { useEffect } from 'react';

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

  useEffect(() => {
    getMyBills().then(res => setBills(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadBill(selectedFile);
      setResult(res.data);
      setSelectedFile(null);
      const billsRes = await getMyBills();
      setBills(billsRes.data || []);
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
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
                  <th>Fecha</th>
                  <th>kWh</th>
                  <th>Monto</th>
                  <th>Recomendación</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id} onClick={() => handleBillClick(b)} className="clickable-row" style={{ cursor: 'pointer' }}>
                    <td>{new Date(b.uploadedAt).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{b.totalKwh} kWh</td>
                    <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>${b.totalAmount?.toLocaleString()}</td>
                    <td style={{ maxWidth: 300, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {b.aiRecommendations?.substring(0, 100)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EXPANSIVO DE FACTURA */}
      {selectedBill && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content bill-modal split-layout" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <div className="modal-left">
              {imageLoading ? (
                <div className="loading-spinner"><div className="spinner" style={{ borderColor: 'var(--bg-card)' }}></div></div>
              ) : selectedBillImage ? (
                <img src={selectedBillImage} alt="Factura escaneada" className="bill-detail-image" />
              ) : (
                <div className="error-placeholder" style={{ color: 'var(--text-muted)' }}>No se pudo recuperar la imagen original</div>
              )}
            </div>

            <div className="modal-right">
              <h3 style={{ marginBottom: 20 }}>Análisis de Factura</h3>
              <div className="stat-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card green">
                  <div className="stat-label">Consumo Detectado</div>
                  <div className="stat-value">{selectedBill.totalKwh} kWh</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-label">Monto a Pagar</div>
                  <div className="stat-value">${selectedBill.totalAmount?.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="advice full-advice">
                <strong>💡 Recomendación Completa de la IA:</strong>
                <p style={{ marginTop: 12, whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {selectedBill.aiRecommendations}
                </p>
              </div>
              <p style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Escaneada el: {new Date(selectedBill.uploadedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
