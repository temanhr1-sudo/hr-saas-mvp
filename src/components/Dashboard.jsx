import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Award, BarChart3, Clock, AlertTriangle, 
  CheckCircle, ArrowUp, Target, Bell, FileText, Plus, Activity, Zap, RefreshCw, Crown, Calendar
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const Dashboard = ({ tier, employeesCount, employees, setCurrentPage, onSelectMetric }) => {
  
  // State untuk Date Range
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Awal bulan ini
    end: new Date().toISOString().split('T')[0] // Hari ini
  });

  // State untuk Data Dinamis
  const [alerts, setAlerts] = useState([]);
  const [kpiStats, setKpiStats] = useState({
    satisfaction: 0,
    training: 0,
    productivity: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- LOGIKA ALERT & KPI OTOMATIS ---
  useEffect(() => {
    calculateDashboardData();
  }, [employees, dateRange]); // Hitung ulang jika karyawan atau tanggal berubah

  const calculateDashboardData = async () => {
    // 1. Hitung Alert Turnover dari data karyawan asli
    const resignCount = employees.filter(e => e.status === 'Resign' || e.status === 'Keluar').length;
    const total = employees.length;
    const turnoverRate = total === 0 ? 0 : Math.round((resignCount / total) * 100);

    const generatedAlerts = [];

    // Logika Alert 1: Turnover Tinggi
    if (turnoverRate > 10) {
      generatedAlerts.push({
        id: 'alert-turnover',
        type: 'warning',
        title: 'Turnover Rate Tinggi!',
        desc: `Turnover saat ini ${turnoverRate}%. Target maksimal 10%. Segera lakukan evaluasi retensi.`,
        priority: 'high'
      });
    }

    // Logika Alert 2: Karyawan Baru
    const newHires = employees.filter(e => {
        // Asumsi created_at ada, jika tidak pakai ID (logic sederhana)
        return e.status === 'Aktif'; 
    }).length; // Di real app, filter berdasarkan created_at vs dateRange

    if (newHires > 0) {
      generatedAlerts.push({
        id: 'alert-hiring',
        type: 'success',
        title: 'Pertumbuhan Karyawan',
        desc: `${newHires} karyawan aktif tercatat dalam sistem.`,
        priority: 'low'
      });
    }

    // Ambil data KPI terakhir dari tabel kpi_logs
    try {
        const { data: latestKPI } = await supabase
            .from('kpi_logs')
            .select('*')
            .order('period_date', { ascending: false });
        
        // Ambil nilai terbaru untuk masing-masing tipe
        const getLatest = (type) => {
            const found = latestKPI?.find(k => k.metric_type === type);
            return found ? Number(found.value) : 0; // Default 0 jika belum ada data
        };

        setKpiStats({
            satisfaction: getLatest('satisfaction'),
            training: getLatest('training'),
            productivity: getLatest('productivity')
        });

    } catch (err) {
        console.error("Gagal ambil KPI", err);
    }

    setAlerts(generatedAlerts);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await calculateDashboardData(); // Recalculate
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Trial Banner */}
      {tier === 'free' && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 mb-6 flex items-center justify-between text-white shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <div>
              <p className="font-semibold">Mode Gratis (Terbatas)</p>
              <p className="text-sm opacity-90">Upgrade untuk akses unlimited dan fitur premium.</p>
            </div>
          </div>
          <button onClick={() => setCurrentPage('subscription')} className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Upgrade Sekarang</button>
        </div>
      )}

      {/* Header with Date Range & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard HR</h1>
            {/* LAMBANG MAHKOTA SUBSCRIPTION */}
            {tier === 'pro' && <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" title="Pro Member" />}
          </div>
          <p className="text-gray-600">Ringkasan performa perusahaan Anda</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 px-2 border-r border-gray-200 pr-4">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-semibold uppercase">Periode:</span>
          </div>
          
          {/* DATE PICKER RANGE (Bukan Dropdown lagi) */}
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-indigo-500"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-indigo-500"
          />

          <button onClick={handleRefreshData} className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors" title="Refresh Data">
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Notifications (Dinamic) */}
      <div className="mb-8">
        {alerts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-orange-500">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-800">Alerts & Insight</h3>
            </div>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                  <div>
                    <p className="font-medium text-gray-800">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3 text-green-800 border border-green-200">
            <CheckCircle className="w-5 h-5" />
            <p>Semua indikator HR dalam kondisi optimal! Tidak ada alert.</p>
          </div>
        )}
      </div>

      {/* Main Metrics Cards - CLICKABLE to Open Detail Page */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => setCurrentPage('employees')} // Klik ke halaman karyawan
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Karyawan</p>
          <p className="text-3xl font-bold mt-2">{employeesCount}</p>
          <p className="text-xs mt-1 opacity-75">Kelola data karyawan &rarr;</p>
        </div>
        
        {/* KPI CARDS (Klik untuk buka MetricDetail) */}
        <div 
          onClick={() => onSelectMetric('satisfaction')} 
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Satisfaction</p>
          <p className="text-3xl font-bold mt-2">{kpiStats.satisfaction}%</p>
          <p className="text-xs mt-1 opacity-75">Klik untuk update data &rarr;</p>
        </div>
        
        <div 
          onClick={() => onSelectMetric('training')} 
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Award className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Training</p>
          <p className="text-3xl font-bold mt-2">{kpiStats.training}%</p>
          <p className="text-xs mt-1 opacity-75">Klik untuk update data &rarr;</p>
        </div>

        <div 
          onClick={() => onSelectMetric('productivity')} 
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Zap className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Productivity</p>
          <p className="text-3xl font-bold mt-2">{kpiStats.productivity}</p>
          <p className="text-xs mt-1 opacity-75">Klik untuk update data &rarr;</p>
        </div>
      </div>

      {/* Strategic Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Target className="w-6 h-6 text-indigo-600" /> Strategic Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button onClick={() => setCurrentPage('strategy')} className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left">
            <div className="p-3 bg-indigo-100 rounded-lg"><Users className="w-6 h-6 text-indigo-600" /></div>
            <div><h3 className="font-semibold text-gray-800">Recruitment Strategy</h3><p className="text-sm text-gray-600">Kelola pipeline rekrutmen</p></div>
          </button>
          <button onClick={() => setCurrentPage('strategy')} className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left">
            <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="w-6 h-6 text-green-600" /></div>
            <div><h3 className="font-semibold text-gray-800">Retention Program</h3><p className="text-sm text-gray-600">Strategi mempertahankan talenta</p></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;