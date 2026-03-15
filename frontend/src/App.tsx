import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts';
import {
  Users,
  Zap,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  Leaf,
  Lightbulb,
  Wind,
  AlertTriangle,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  occupancy_status: boolean;
  occupancy_count: number;
  energy_consumption: number;
  hvac_status: string;
  lighting_status: string;
}

interface Stats {
  total_consumption: number;
  total_savings: number;
}

interface HistoryEntry {
  timestamp: string;
  classroom_id: string;
  occupancy: number;
  consumption: number;
}

interface Alert {
  message: string;
}

interface Prediction {
  predicted_next_hour: number;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

function App() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<Prediction | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [updateInterval, setUpdateInterval] = useState(30);

  const addNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const fetchData = async () => {
    try {
      const [resClassrooms, resStats, resHistory, resAlerts, resPredictions] = await Promise.all([
        axios.get('http://localhost:8001/classrooms'),
        axios.get('http://localhost:8001/stats'),
        axios.get('http://localhost:8001/analytics/history'),
        axios.get('http://localhost:8001/alerts'),
        axios.get('http://localhost:8001/predictions')
      ]);

      setClassrooms(resClassrooms.data);
      setStats(resStats.data);
      setHistory(resHistory.data.history);

      const newAlerts = resAlerts.data.alerts.map((msg: string) => ({ message: msg }));
      setAlerts(newAlerts);

      setPredictions(resPredictions.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll for updates based on updateInterval
    const interval = setInterval(fetchData, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const handleOverride = async (id: string, type: 'hvac' | 'lighting', value: string) => {
    try {
      await axios.post(`http://localhost:8001/classroom/${id}/override?${type}=${value}`);
      // Only fetch classrooms for faster update
      const resClassrooms = await axios.get('http://localhost:8001/classrooms');
      setClassrooms(resClassrooms.data);
    } catch (err) {
      console.error('Failed to override settings:', err);
    }
  };

  const handleOccupancyUpdate = async (id: string, count: number) => {
    try {
      await axios.post(`http://localhost:8001/occupancy-update/${id}?count=${count}`);
      // Only fetch classrooms for faster update
      const resClassrooms = await axios.get('http://localhost:8001/classrooms');
      setClassrooms(resClassrooms.data);
    } catch (err) {
      console.error('Failed to update occupancy:', err);
    }
  };

  const calculateSustainabilityScore = () => {
    if (!stats) return 0;
    const total = stats.total_consumption + stats.total_savings;
    if (total === 0) return 0;
    return Math.round((stats.total_savings / total) * 100);
  };

  const handleSaveSettings = () => {
    // Basic demonstration of saving settings
    addNotification('Settings updated successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex font-sans overflow-x-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 w-64 bg-emerald-950/90 backdrop-blur-xl border-r border-white/10 text-white p-6 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-50 md:z-auto shadow-2xl`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <Leaf className="text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight">Eco Campus</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-white hover:text-emerald-200"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-4">
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-800' : 'hover:bg-emerald-800'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('occupancy'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'occupancy' ? 'bg-emerald-800' : 'hover:bg-emerald-800'}`}
          >
            <Users size={20} /> Occupancy
          </button>
          <button
            onClick={() => { setActiveTab('energy'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'energy' ? 'bg-emerald-800' : 'hover:bg-emerald-800'}`}
          >
            <Zap size={20} /> Energy
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-emerald-800' : 'hover:bg-emerald-800'}`}
          >
            <Settings size={20} /> Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-600 hover:text-slate-800"
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="flex-1 md:flex-none">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Campus Overview</h2>
            <p className="text-slate-500 text-sm md:text-base">Real-time energy and occupancy monitoring</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-2 rounded-full shadow-sm">
                 <ShieldCheck className="text-emerald-600" />
              </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <Zap className="text-emerald-600" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm">Total Consumption</p>
                <h3 className="text-2xl font-bold text-slate-800">{stats?.total_consumption ?? 0} kWh</h3>
              </div>
              
              <div className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Users className="text-blue-600" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm">Active Students</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {classrooms.reduce((acc, curr) => acc + curr.occupancy_count, 0)}
                </h3>
              </div>

              <div className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <Leaf className="text-amber-600" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm">Energy Saved</p>
                <h3 className="text-2xl font-bold text-slate-800">{stats?.total_savings ?? 0} kWh</h3>
              </div>

              <div className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <ShieldCheck className="text-emerald-600" />
                  </div>
                  <span className="text-emerald-600 font-bold">{calculateSustainabilityScore()}%</span>
                </div>
                <p className="text-slate-500 text-sm">Sustainability Score</p>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
                   <div 
                     className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                     style={{ width: `${calculateSustainabilityScore()}%` }}
                   />
                </div>
              </div>
            </div>

            {/* Classrooms Grid */}
            <h3 className="text-xl font-bold text-slate-800 mb-6">Classroom Status</h3>
            {classrooms.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-500">No classroom data available. Check if backend is running.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {classrooms.map(room => (
                  <div key={room.id} className="glass-card overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-lg text-slate-800">{room.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          room.occupancy_status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {room.occupancy_status ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Occupancy</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOccupancyUpdate(room.id, Math.max(0, room.occupancy_count - 1))}
                              className="w-6 h-6 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="font-medium min-w-[2rem] text-center">{room.occupancy_count}</span>
                            <button
                              onClick={() => handleOccupancyUpdate(room.id, Math.min(50, room.occupancy_count + 1))}
                              className="w-6 h-6 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                            <span className="text-slate-500 ml-1">people</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Consumption</span>
                          <span className="font-medium text-emerald-600">{room.energy_consumption} kWh</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 px-6 py-4 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                          <Wind size={16} className={room.hvac_status === 'ON' ? 'text-blue-500' : 'text-slate-300'} />
                          <span className="text-slate-600">HVAC: {room.hvac_status}</span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleOverride(room.id, 'hvac', 'ON')}
                            className={`px-2 py-1 text-[10px] rounded ${room.hvac_status === 'ON' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                          >
                            ON
                          </button>
                          <button 
                            onClick={() => handleOverride(room.id, 'hvac', 'OFF')}
                            className={`px-2 py-1 text-[10px] rounded ${room.hvac_status === 'OFF' ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                          >
                            OFF
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                          <Lightbulb size={16} className={room.lighting_status !== 'OFF' ? 'text-amber-500' : 'text-slate-300'} />
                          <span className="text-slate-600">Lights: {room.lighting_status}</span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleOverride(room.id, 'lighting', 'ON')}
                            className={`px-2 py-1 text-[10px] rounded ${room.lighting_status === 'ON' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                          >
                            ON
                          </button>
                          <button 
                            onClick={() => handleOverride(room.id, 'lighting', 'DIMMED')}
                            className={`px-2 py-1 text-[10px] rounded ${room.lighting_status === 'DIMMED' ? 'bg-amber-300 text-white' : 'bg-slate-200 text-slate-600'}`}
                          >
                            DIM
                          </button>
                          <button 
                            onClick={() => handleOverride(room.id, 'lighting', 'OFF')}
                            className={`px-2 py-1 text-[10px] rounded ${room.lighting_status === 'OFF' ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                          >
                            OFF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-amber-600" />
                  System Alerts
                </h3>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <AlertTriangle className="text-amber-500 mt-0.5" size={16} />
                      <p className="text-amber-700">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'occupancy' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Occupancy vs Energy Consumption Correlation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={history.slice(-30).map(h => ({
                  time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  occupancy: h.occupancy,
                  consumption: h.consumption
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Occupancy', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'kWh', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="occupancy" fill="#3b82f6" name="Occupancy (People)" />
                  <Line yAxisId="right" type="monotone" dataKey="consumption" stroke="#10b981" strokeWidth={2} name="Consumption (kWh)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Occupancy Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history.slice(-20).map(h => ({
                  time: new Date(h.timestamp).toLocaleTimeString(),
                  occupancy: h.occupancy
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Current Occupancy by Classroom</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={classrooms.map(c => ({ name: c.name, occupancy: c.occupancy_count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="occupancy" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Occupancy Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={classrooms.map(c => ({ name: c.name, value: c.occupancy_count }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {classrooms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'energy' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" />
                  Energy Consumption Trends
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={history.slice(-20).map(h => ({
                    time: new Date(h.timestamp).toLocaleTimeString(),
                    consumption: h.consumption
                  }))}>
                    <defs>
                      <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value: number | undefined) => value !== undefined ? [`${value} kWh`, 'Consumption'] : ['', 'Consumption']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="consumption"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#consumptionGradient)"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Energy Savings</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{stats?.total_savings ?? 0} kWh</div>
                  <p className="text-slate-500">Total energy saved this month</p>
                </div>
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={[
                      { name: 'Consumed', value: stats?.total_consumption ?? 0, color: '#ef4444' },
                      { name: 'Saved', value: stats?.total_savings ?? 0, color: '#10b981' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Next Hour Prediction</h4>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{predictions?.predicted_next_hour?.toFixed(1) ?? 0} kWh</div>
                  <p className="text-slate-500">Predicted energy usage for next hour</p>
                </div>
                <TrendingUp className="text-blue-500" size={48} />
              </div>
            </div>

            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Classroom Energy Usage</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classrooms.map(c => ({ name: c.name, consumption: c.energy_consumption }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consumption" fill="#f59e0b" animationDuration={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">System Settings</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-4">Occupancy Thresholds</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Min Occupancy for HVAC</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        defaultValue="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Max Occupancy Alert</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        defaultValue="50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-4">Energy Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Energy Saving Mode</label>
                      <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option>Automatic</option>
                        <option>Manual</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Alert Threshold (kWh)</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        defaultValue="10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-4">API Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Backend API URL</label>
                      <input
                        type="url"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        defaultValue="http://localhost:8001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Update Interval (seconds)</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={updateInterval}
                        onChange={(e) => setUpdateInterval(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 animate-slide-in-right ${
              n.type === 'success' ? 'bg-emerald-600' : n.type === 'error' ? 'bg-red-600' : 'bg-amber-600'
            }`}
          >
            {n.type === 'success' && <ShieldCheck size={18} />}
            {n.type === 'error' && <X size={18} />}
            {n.type === 'warning' && <AlertTriangle size={18} />}
            <span className="text-sm font-medium">{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
