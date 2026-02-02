import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Calculator, Calendar, HelpCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import HRISAnalytics from './HRISAnalytics'; 

const MetricDetail = ({ metricType, onBack }) => {
  // === BAGIAN INI MENANGANI SIMPAN DATA DARI TOOLS ANALYTICS ===
  if (metricType === 'productivity') {
    const handleSaveAnalysis = async (analyticsData) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('kpi_logs').insert([{
          user_id: user.id,
          metric_type: 'productivity', // Disimpan sebagai productivity
          // FIX: Simpan Attendance Rate (sesuai request) ke database
          value: parseFloat(analyticsData.attendanceRate), 
          period_date: new Date(),
          notes: JSON.stringify(analyticsData) 
        }]);
        alert("✅ Data Productivity (Attendance Rate) Berhasil Disimpan!");
        onBack(); // Kembali ke dashboard akan memicu refresh data
      } catch (error) {
        alert("Gagal simpan: " + error.message);
      }
    };

    return <HRISAnalytics onBack={onBack} onSaveToDB={handleSaveAnalysis} />;
  }

  // === BAGIAN KALKULATOR MANUAL (TIDAK BERUBAH) ===
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState({});
  const [calculatedValue, setCalculatedValue] = useState(0);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const metricConfig = {
    'turnover': {
      title: 'Kalkulator Turnover Rate',
      desc: 'Menghitung persentase karyawan yang keluar.',
      unit: '%',
      color: 'text-red-600',
      fields: [
        { key: 'awal', label: 'Jml Karyawan Awal', type: 'number' },
        { key: 'akhir', label: 'Jml Karyawan Akhir', type: 'number' },
        { key: 'keluar', label: 'Jml Keluar', type: 'number' }
      ],
      calculate: (d) => {
        const avg = (Number(d.awal) + Number(d.akhir)) / 2;
        return avg === 0 ? 0 : ((Number(d.keluar) / avg) * 100).toFixed(2);
      }
    },
    'training': {
      title: 'Training Completion',
      desc: 'Persentase penyelesaian pelatihan.',
      unit: '%',
      color: 'text-purple-600',
      fields: [
        { key: 'target', label: 'Target Peserta', type: 'number' },
        { key: 'actual', label: 'Peserta Hadir', type: 'number' }
      ],
      calculate: (d) => {
        return Number(d.target) === 0 ? 0 : ((Number(d.actual) / Number(d.target)) * 100).toFixed(2);
      }
    },
    'satisfaction': {
      title: 'Employee Satisfaction',
      desc: 'Skor rata-rata kepuasan.',
      unit: 'Score',
      color: 'text-green-600',
      fields: [
        { key: 'score', label: 'Rata-rata Skor Survey (1-100)', type: 'number' }
      ],
      calculate: (d) => Number(d.score) || 0
    }
  };

  const config = metricConfig[metricType] || metricConfig['turnover'];

  useEffect(() => {
    setCalculatedValue(config.calculate(inputs));
  }, [inputs, config]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('kpi_logs').select('*').eq('user_id', user.id).eq('metric_type', metricType).order('period_date', { ascending: false });
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, [metricType]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('kpi_logs').insert([{
      user_id: user.id,
      metric_type: metricType,
      value: calculatedValue,
      period_date: newDate,
      notes: notes
    }]);
    alert("Data tersimpan!");
    setInputs({});
    setNotes('');
    const { data } = await supabase.from('kpi_logs').select('*').eq('user_id', user.id).eq('metric_type', metricType).order('period_date', { ascending: false });
    setLogs(data || []);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
      </button>

      <div className="flex gap-4 mb-8">
        <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
          <Calculator className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-500">{config.desc}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500 h-fit">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Periode</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            {config.fields.map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-gray-700">{f.label}</label>
                <input type="number" onChange={e => setInputs({...inputs, [f.key]: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="0" />
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Hasil:</span>
                <span className={`text-2xl font-bold ${config.color}`}>{calculatedValue} {config.unit}</span>
              </div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 text-sm border rounded-lg mb-4" placeholder="Catatan..." rows="2"></textarea>
              <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600" /> Riwayat</h3>
          {loading ? <p>Loading...</p> : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50"><tr><th className="p-3">Tanggal</th><th className="p-3">Nilai</th><th className="p-3">Catatan</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b">
                    <td className="p-3">{new Date(log.period_date).toLocaleDateString()}</td>
                    <td className="p-3 font-bold">{log.value} {config.unit}</td>
                    <td className="p-3 text-gray-500">{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricDetail;