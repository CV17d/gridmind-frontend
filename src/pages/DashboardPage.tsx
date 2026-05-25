import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDailyAnalytics, getDevices, getForecast, getComparison } from '../services/api';
import { Client } from '@stomp/stompjs';
import { Zap, Cpu, Calendar, Satellite, Brain, Info, Lightbulb, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DailyData { date: string; totalKwh: number; }
interface LiveReading { esp32Id: string; consumption: number; voltage?: number; current?: number; power?: number; timestamp: string; }

export default function DashboardPage() {
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [liveReadings, setLiveReadings] = useState<LiveReading[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<{ predicted_next_30_days: number } | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, devicesRes, forecastRes, comparisonRes] = await Promise.all([
          getDailyAnalytics(),
          getDevices(),
          getForecast(),
          getComparison()
        ]);
        setChartData(analyticsRes.data || []);
        setDeviceCount(Array.isArray(devicesRes.data) ? devicesRes.data.length : 0);
        setForecast(forecastRes.data);
        setComparison(comparisonRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://gridmind-backend-production.up.railway.app';
    const wsUrl = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/api/v1/ws';

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsLive(true);
        client.subscribe('/topic/energy', (message) => {
          const data = JSON.parse(message.body) as LiveReading;
          const realTimeData = { ...data, timestamp: new Date().toISOString() };

          setLiveReadings(prev => [realTimeData, ...prev].slice(0, 10));
          setChartData(prevData => {
            const today = new Date().toISOString().split('T')[0];
            const updatedData = [...prevData];
            const todayIndex = updatedData.findIndex(d => d.date === today);
            if (todayIndex !== -1) {
              updatedData[todayIndex] = {
                ...updatedData[todayIndex],
                totalKwh: updatedData[todayIndex].totalKwh + data.consumption
              };
            } else {
              updatedData.push({ date: today, totalKwh: data.consumption });
            }
            return updatedData;
          });
        });

        client.subscribe('/topic/alerts', (message) => {
          try {
            const alertData = JSON.parse(message.body);
            toast.error(alertData.message, {
              duration: 6000,
              icon: '⚡',
              style: { background: '#1a2235', color: '#fff', border: '1px solid var(--accent-green)', fontSize: '14px', fontWeight: '600' }
            });
          } catch (err) { console.error(err); }
        });

        client.subscribe('/topic/forecast', (message) => {
          setForecast(JSON.parse(message.body));
        });
      },
      onDisconnect: () => setIsLive(false),
      onStompError: () => setIsLive(false),
    });

    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); };
  }, []);

  const totalKwh = chartData.reduce((sum, d) => sum + (d.totalKwh || 0), 0);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="dashboard-wrapper">
      <div className="stat-grid">
        <div className="stat-card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.05)' }}>
          <div className="stat-header">
            <div className="stat-icon-box"><Zap size={20} fill="currentColor" /></div>
            <div className="stat-unit">kWh (Kilovatios-hora)</div>
          </div>
          <div className="stat-label">Consumo Total</div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{totalKwh.toFixed(4)} <span style={{ fontSize: '12px', opacity: 0.7 }}>kWh</span></div>
        </div>

        <div className="stat-card" style={{ border: '1px solid rgba(59, 130, 246, 0.4)', boxShadow: '0 0 15px rgba(59, 130, 246, 0.05)' }}>
          <div className="stat-header">
            <div className="stat-icon-box" style={{ color: 'var(--accent-blue)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}><Cpu size={20} /></div>
            <div className="stat-unit">ACTIVOS</div>
          </div>
          <div className="stat-label">Dispositivos</div>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{deviceCount}</div>
        </div>

        <div className="stat-card" style={{ border: '1px solid rgba(20, 184, 166, 0.4)', boxShadow: '0 0 15px rgba(20, 184, 166, 0.05)' }}>
          <div className="stat-header">
            <div className="stat-icon-box" style={{ color: '#14b8a6', backgroundColor: 'rgba(20, 184, 166, 0.1)' }}><Calendar size={20} /></div>
            <div className="stat-unit">ACTIVIDAD</div>
          </div>
          <div className="stat-label">Días Registrados</div>
          <div className="stat-value" style={{ color: '#14b8a6' }}>{chartData.length}</div>
        </div>

        <div className="stat-card" style={{ border: '1px solid rgba(168, 85, 247, 0.5)', boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)' }}>
          <div className="stat-header">
            <div className="stat-icon-box" style={{ color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)' }}><Brain size={20} /></div>
            <div className="stat-unit">IA PREDICCIÓN</div>
          </div>
          <div className="stat-label">Predicción 30 días</div>
          <div className="stat-value" style={{ color: '#a855f7' }}>
            {(forecast?.predicted_next_30_days !== undefined && forecast?.predicted_next_30_days !== null) ? (
              <>{forecast.predicted_next_30_days.toFixed(4)} <span style={{ fontSize: '12px', opacity: 0.7 }}>kWh</span></>
            ) : '--'}
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.2)', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div className="card-header">
            <h3>Consumo Diario [kWh (Kilovatios-hora)]</h3>
            <div className="toggle-group">
              <button className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Día</button>
              <button className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Semana</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={(value) => `${value}kWh`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #10b981', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }} 
                itemStyle={{ color: '#10b981', fontWeight: 800 }} 
              />
              <Area 
                type="monotone" 
                dataKey="totalKwh" 
                stroke="#10b981" 
                strokeWidth={4} 
                fill="url(#colorGreen)" 
                animationDuration={2000} 
                filter="drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ border: '1px solid rgba(59, 130, 246, 0.2)', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div className="card-header">
            <h3>Monitor en Tiempo Real</h3>
            {isLive && <div className="live-badge" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444', borderRadius: '20px', whiteSpace: 'nowrap' }}>EN VIVO</div>}
          </div>
          <div className="pulse-monitor-container">
            <div className="pulse-bars-wrap">
              {(() => {
                const recentReadings = liveReadings.slice(0, 12);
                const maxVal = Math.max(...recentReadings.map(r => r.power || 0), 100); 

                return [...Array(12)].map((_, i) => {
                  const reading = liveReadings[11 - i];
                  const height = reading ? Math.max(((reading.power || 0) / maxVal) * 100, 5) : 5;
                  const isLatest = i === 11;

                  return (
                    <div 
                      key={i} 
                      className={`pulse-bar ${isLatest ? 'latest' : ''}`}
                      style={{ 
                        height: `${height}%`,
                        background: isLatest ? 'linear-gradient(to top, #10b981, #fff)' : 'linear-gradient(to top, #065f46, #10b981)',
                        boxShadow: isLatest ? '0 0 15px rgba(16, 185, 129, 0.8)' : 'none',
                        transition: 'height 0.3s ease'
                      }}
                      title={reading ? `${reading.power} W` : '...'}
                    />
                  );
                });
              })()}
            </div>
            <div className="pulse-current-val">
              <div>
                <span className="pulse-number" style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}>{(liveReadings[0]?.power || 0).toFixed(1)}</span>
                <span className="pulse-unit">VATIOS (W)</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>PICO HOY</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                  {Math.max(...chartData.map(d => d.totalKwh), 0).toFixed(2)} <span style={{ fontSize: '10px', opacity: 0.6 }}>kWh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {comparison && comparison.status === 'SUCCESS' && (
        <div className="card" style={{ marginTop: 24, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}><Lightbulb size={120} color="var(--accent-green)" /></div>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Lightbulb size={20} color="var(--accent-green)" /><div><h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Inteligencia de Ahorro GridMind</h3><p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Basado en tu última factura analizada</p></div></div>
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><TrendingDown size={16} color="var(--accent-green)" /><span style={{ fontSize: '13px', fontWeight: 600 }}>Comparativa de Consumo</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px' }}>Facturado (Compañía):</span><strong>{comparison.billKwh} kWh</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px' }}>Medido (GridMind):</span><strong>{comparison.measuredKwh.toFixed(2)} kWh</strong></div>
                <div style={{ marginTop: 8, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, borderLeft: '3px solid var(--accent-green)' }}>
                  <span style={{ fontSize: '11px' }}>Discrepancia detectada: </span>
                  <strong>{(comparison.billKwh - comparison.measuredKwh).toFixed(2)} kWh</strong>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Info size={16} color="var(--accent-blue)" /><span style={{ fontSize: '13px', fontWeight: 600 }}>Consejo de IA</span></div>
              <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 8, fontSize: '12px', fontStyle: 'italic', lineHeight: '1.5' }}>"{comparison.advice}"</div>
            </div>
          </div>
        </div>
      )}

      <div className="readings-card" style={{ marginTop: 24 }}>
        <div className="readings-header">
          <div className="readings-title"><Satellite size={20} /> Lecturas en Tiempo Real</div>
          <div className="status-badge"><span className="status-dot"></span> CONECTADO</div>
        </div>
        <div className="table-container">
          <table>
            <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.7 }}>Dispositivo</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.7 }}>Voltaje</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.7 }}>Corriente</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.7 }}>Potencia</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.7 }}>Consumo</th>
                  <th style={{ padding: '12px', textAlign: 'left', opacity: 0.7 }}>Hora Local</th>
                </tr>
              </thead>
              <tbody>
                {liveReadings.map((reading, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '12px' }}>{reading.esp32Id}</td>
                    <td style={{ padding: '12px', color: '#a855f7' }}>{reading.voltage?.toFixed(1) || '0.0'} V</td>
                    <td style={{ padding: '12px', color: '#f59e0b' }}>{reading.current?.toFixed(2) || '0.00'} A</td>
                    <td style={{ padding: '12px', color: '#3b82f6', fontWeight: 'bold' }}>{reading.power?.toFixed(1) || '0.0'} W</td>
                    <td style={{ padding: '12px', color: '#10b981' }}>{reading.consumption?.toFixed(4) || '0.0000'} kWh</td>
                    <td style={{ padding: '12px', opacity: 0.8 }}>{new Date(reading.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
