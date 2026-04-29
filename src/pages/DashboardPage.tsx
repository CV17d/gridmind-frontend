import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDailyAnalytics, getUnreadCount, getDevices } from '../services/api';
import { Client } from '@stomp/stompjs';
import { Zap, Cpu, Calendar, Bell, Satellite, Wifi, Activity } from 'lucide-react';

interface DailyData { date: string; totalKwh: number; }
interface LiveReading { esp32Id: string; consumption: number; timestamp: string; }

export default function DashboardPage() {
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const [unread, setUnread] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [liveReadings, setLiveReadings] = useState<LiveReading[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, unreadRes, devicesRes] = await Promise.all([
          getDailyAnalytics(),
          getUnreadCount(),
          getDevices()
        ]);
        setChartData(analyticsRes.data || []);
        setUnread(unreadRes.data?.unreadAlerts || 0);
        setDeviceCount(Array.isArray(devicesRes.data) ? devicesRes.data.length : 0);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://gridmind-backend.onrender.com';
    const wsUrl = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/api/v1/ws';
    
    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsLive(true);
        client.subscribe('/topic/energy', (message) => {
          const data = JSON.parse(message.body) as LiveReading;
          
          // Forzar la hora local del sistema para que sea 100% real-time
          const realTimeData = {
            ...data,
            timestamp: new Date().toISOString()
          };

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
      },
      onDisconnect: () => setIsLive(false),
      onStompError: () => setIsLive(false),
    });

    client.activate();
    return () => { client.deactivate(); };
  }, []);

  const totalKwh = chartData.reduce((sum, d) => sum + (d.totalKwh || 0), 0);
  const lastConsumption = liveReadings[0]?.consumption || 0;

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="dashboard-wrapper">
      {/* Top Stat Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="stat-unit">KWH</div>
          </div>
          <div className="stat-label">Consumo Total</div>
          <div className="stat-value">{totalKwh.toFixed(1)}</div>
          <div className="stat-subtext">Active load</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box" style={{ color: 'var(--accent-blue)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Cpu size={20} />
            </div>
            <div className="stat-unit">ASSETS</div>
          </div>
          <div className="stat-label">Dispositivos</div>
          <div className="stat-value">{deviceCount}</div>
          <div className="stat-subtext">Active nodes</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Calendar size={20} />
            </div>
            <div className="stat-unit">UPTIME</div>
          </div>
          <div className="stat-label">Días Registrados</div>
          <div className="stat-value">{chartData.length}</div>
          <div className="stat-subtext">Since initialization</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-box">
              <Bell size={20} />
            </div>
            <div className="stat-unit">QUEUE</div>
          </div>
          <div className="stat-label">Alertas Sin Leer</div>
          <div className="stat-value">{unread}</div>
          <div className="stat-subtext">Priority actions</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="dashboard-row">
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h3>Consumo Diario (kWh)</h3>
              <p>Historical performance metrics across all connected units</p>
            </div>
            <div className="toggle-group">
              <button 
                className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickFormatter={(value) => `${value}kWh`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}
                itemStyle={{ color: 'var(--accent-green)', fontWeight: 700 }}
              />
              <Area 
                type="monotone" 
                dataKey="totalKwh" 
                stroke="var(--accent-green)" 
                strokeWidth={3}
                fill="url(#colorGreen)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h3>Monitor en Tiempo Real</h3>
            </div>
            {isLive && <div className="live-badge">EN VIVO</div>}
          </div>

          <div className="pulse-monitor-container">
            <div className="pulse-bars-wrap">
              {(() => {
                const recentReadings = liveReadings.slice(0, 12);
                const maxVal = Math.max(...recentReadings.map(r => r.consumption), 1); // Evitar división por cero

                return [...Array(12)].map((_, i) => {
                  const reading = liveReadings[11 - i];
                  // Escalado dinámico relativo al máximo actual
                  const height = reading ? Math.max((reading.consumption / maxVal) * 100, 5) : 5;
                  const isLatest = i === 11;

                  return (
                    <div 
                      key={i} 
                      className={`pulse-bar ${isLatest ? 'latest' : ''}`}
                      style={{ height: `${height}%` }}
                      title={reading ? `${reading.consumption} W` : 'Esperando data...'}
                    />
                  );
                });
              })()}
            </div>

            <div className="pulse-current-val">
              <div>
                <span className="pulse-number">{lastConsumption.toFixed(1)}</span>
                <span className="pulse-unit">WATTS</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>PEAK TODAY</div>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
                  {Math.max(...chartData.map(d => d.totalKwh), 0).toFixed(2)} kWh
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Readings (ESP32) */}
      <div className="readings-card">
        <div className="readings-header">
          <div className="readings-title">
            <Satellite size={20} />
            Lecturas en Tiempo Real
          </div>
          <div className="status-badge">
            <span className="status-dot"></span>
            Conectado
          </div>
        </div>

        {liveReadings.length === 0 ? (
          <div className="empty-readings">
            <div className="pulse-icon">
              <Wifi size={32} />
            </div>
            <h4>Esperando datos del ESP32...</h4>
            <p>
              Iniciando protocolo de recepción. Asegúrese de que el hardware esté correctamente alimentado y configurado en la red local para comenzar la transmisión de telemetría.
            </p>
            <div className="stats-row">
              <div className="mini-stat">
                <div className="mini-label">Packet Loss</div>
                <div className="mini-value">0.0%</div>
              </div>
              <div className="mini-stat">
                <div className="mini-label">Latency</div>
                <div className="mini-value">-- ms</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>DISPOSITIVO</th>
                  <th>ESTADO</th>
                  <th>CONSUMO</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {liveReadings.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Activity size={14} color="var(--accent-green)" />
                        {r.esp32Id}
                      </div>
                    </td>
                    <td><span className="live-badge">ACTIVE</span></td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{r.consumption.toFixed(3)} kWh</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
