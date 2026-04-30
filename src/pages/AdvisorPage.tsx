import { useState } from 'react';
import { compareModels } from '../services/api';
import { Brain, Zap, Clock, Send, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModelResult {
  answer: string;
  timeMs: number;
}

export default function AdvisorPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ gemini?: ModelResult; grok?: ModelResult } | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    const loadingToast = toast.loading("Consultando a los expertos...");
    
    try {
      const res = await compareModels(question);
      setResults(res.data);
      toast.success("Análisis completado", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Error al consultar las IAs", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advisor-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="advisor-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '8px 20px', borderRadius: '30px', color: '#3b82f6', fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>
          <Brain size={18} />
          DUELO DE TITANES IA
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>Asesor de Facturación</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Analiza tu historial de consumo comparando la precisión y velocidad de Gemini y Grok.</p>
      </div>

      <div className="question-box" style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <form onSubmit={handleAsk} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <MessageSquare style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Ej: ¿Por qué mi factura de marzo fue más alta que la de febrero?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 50px', borderRadius: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '16px' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="energy-report-btn"
            style={{ padding: '0 30px', margin: 0, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {loading ? 'Pensando...' : <>Preguntar <Send size={18} /></>}
          </button>
        </form>
      </div>

      <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Panel Gemini */}
        <div className={`model-card ${results?.gemini ? 'active' : ''}`} style={{ backgroundColor: '#1a1d2d', borderRadius: '24px', border: '1px solid rgba(66, 133, 244, 0.3)', overflow: 'hidden', opacity: results || loading ? 1 : 0.5 }}>
          <div style={{ backgroundColor: '#4285f4', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: 800 }}>
              <Sparkles size={20} /> GEMINI 1.5 FLASH
            </div>
            {results?.gemini && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '14px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px' }}>
                <Clock size={14} /> {results.gemini.timeMs}ms
              </div>
            )}
          </div>
          <div style={{ padding: '24px', minHeight: '300px', fontSize: '15px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
            {loading && !results ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="loading-dots">
                <Zap className="animate-pulse" color="#4285f4" />
              </div>
            ) : results?.gemini ? (
              results.gemini.answer
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>Esperando consulta...</div>
            )}
          </div>
        </div>

        {/* Panel Grok */}
        <div className={`model-card ${results?.grok ? 'active' : ''}`} style={{ backgroundColor: '#000', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden', opacity: results || loading ? 1 : 0.5 }}>
          <div style={{ backgroundColor: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000', fontWeight: 900 }}>
              <Zap size={20} /> GROK BETA
            </div>
            {results?.grok && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000', fontSize: '14px', backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
                <Clock size={14} /> {results.grok.timeMs}ms
              </div>
            )}
          </div>
          <div style={{ padding: '24px', minHeight: '300px', fontSize: '15px', lineHeight: '1.6', color: '#fff', fontFamily: 'monospace' }}>
            {loading && !results ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="loading-dots">
                <Zap className="animate-pulse" color="#000" />
              </div>
            ) : results?.grok ? (
              results.grok.answer
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>Esperando consulta...</div>
            )}
          </div>
        </div>
      </div>

      {results && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px 24px', borderRadius: '12px', border: '1px solid #10b981', color: '#10b981', fontWeight: 700 }}>
            🏆 Ganador por velocidad: {results.gemini!.timeMs < results.grok!.timeMs ? 'Gemini 1.5 Flash' : 'Grok Beta'}
          </div>
        </div>
      )}
    </div>
  );
}
