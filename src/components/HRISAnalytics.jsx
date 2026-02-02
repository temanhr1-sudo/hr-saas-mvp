import React, { useState, useMemo } from 'react';
import { Upload, Download, Users, Clock, TrendingUp, AlertCircle, CheckCircle, Briefcase, Activity, Calendar, ArrowLeft, Save } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import * as XLSX from 'xlsx';
import { calculateAnalytics } from '../utils/analytics'; // Gunakan logic pusat

const HRISAnalytics = ({ onBack, onSaveToDB }) => {
  const [data, setData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const analytics = useMemo(() => {
    return calculateAnalytics(data);
  }, [data]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });
        setData(jsonData);
      } catch (err) {
        alert('Gagal baca file: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [{ 'Emp No.': '001', 'Nama': 'Contoh', 'Tanggal': '01/01/2026', 'Jam Masuk': '08:00', 'Jam Pulang': '17:00', 'Scan Masuk': '07:55', 'Scan Pulang': '17:05', 'Pengecualian': '' }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Absensi.xlsx");
  };

  if (!analytics) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="mb-4 text-gray-500 hover:text-indigo-600 font-medium">← Kembali</button>
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
            <div className="mb-6 inline-block p-4 bg-blue-50 rounded-full">
                <Users className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">HRIS Analytics Pro</h1>
            <p className="text-lg text-gray-600 mb-8">Upload data absensi untuk analisis otomatis</p>
            <div className="flex flex-col gap-4 items-center max-w-md mx-auto">
                <label className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl cursor-pointer hover:bg-indigo-700 transition font-bold shadow-lg hover:shadow-xl flex justify-center items-center gap-3">
                  <Upload className="w-6 h-6"/>
                  {isProcessing ? 'Memproses...' : 'Pilih File Excel'}
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
                </label>
                <button onClick={downloadTemplate} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1">
                  <Download className="w-4 h-4"/> Download Template Excel
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600"/> Hasil Analisis
          </h2>
          <p className="text-sm text-gray-500">{analytics.totalRecords} hari kerja efektif diproses</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setData([])} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 text-sm">Upload Ulang</button>
          <button onClick={() => onSaveToDB(analytics)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md text-sm flex items-center gap-2">
            <Save className="w-4 h-4"/> Simpan ke Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-1 opacity-90">Tingkat Kehadiran</h3>
            <p className="text-4xl font-bold mb-2">{analytics.attendanceRate}%</p>
            <p className="text-xs opacity-80 mb-3">Hadir / Hari Kerja Wajib</p>
          </div>
          <CheckCircle className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-10" />
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-1 opacity-90">Tingkat Ketepatan</h3>
            <p className="text-4xl font-bold mb-2">{analytics.punctualityRate}%</p>
            <p className="text-xs opacity-80 mb-3">Tepat Waktu / Total Hadir</p>
          </div>
          <Clock className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-10" />
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-1 opacity-90">Rate Terlambat</h3>
            <p className="text-4xl font-bold mb-2">{analytics.lateRate}%</p>
            <p className="text-xs opacity-80 mb-3">Terlambat / Total Hadir</p>
          </div>
          <AlertCircle className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-10" />
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-1 opacity-90">Compliance Score</h3>
            <p className="text-4xl font-bold mb-2">{analytics.complianceScore}%</p>
            <p className="text-xs opacity-80 mb-3">Bobot: (Hadir 60%) + (Tepat 40%)</p>
          </div>
          <TrendingUp className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-10" />
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-1 opacity-90">Jam Kerja Efektif</h3>
            <p className="text-4xl font-bold mb-2">{analytics.effectiveWorkHours}%</p>
            <p className="text-xs opacity-80 mb-3">Rasio pemenuhan jam kerja</p>
          </div>
          <Briefcase className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-10" />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-gray-800 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Ringkasan Angka</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span>Total Karyawan</span>
              <span className="font-bold">{analytics.totalEmployees} Org</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Total Jam Terlambat</span>
              <span className="font-bold text-red-500">{analytics.totalLateHours} Jam</span>
            </div>
            
            {/* FIX: MENGGANTI TOTAL LEMBUR DENGAN JAM KERJA EFEKTIF */}
            <div className="flex justify-between">
              <span>Jam Kerja Efektif</span>
              <span className="font-bold text-indigo-600">{analytics.effectiveWorkHours}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600"/> Visualisasi KPI Matrix
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics.radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Performa" dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HRISAnalytics;