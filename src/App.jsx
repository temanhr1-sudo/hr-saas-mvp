import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, DollarSign, Award, BarChart3, FileText, Settings, Menu, X, Crown, CheckCircle, LogOut, Clock, Database } from 'lucide-react';
import { supabase } from './supabaseClient'; 

const HRSaaSApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Data Metric Dummy (Nanti bisa diganti real juga)
  const [metrics, setMetrics] = useState({
    employeeTurnover: 12.5,
    timeToHire: 45,
    employeeSatisfaction: 78,
    trainingCompletion: 85,
    absenteeism: 3.2,
    costPerHire: 15000000
  });

  // --- LOGIC BACKEND ---

  useEffect(() => {
    // Cek apakah user sudah login sebelumnya (Session Check)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleLoginSuccess(session.user);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setSubscriptionType('trial');
    setCurrentPage('dashboard');
    fetchEmployees(); // Ambil data dari database
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setEmployees([]);
    setCurrentPage('login');
  };

  // --- HALAMAN-HALAMAN ---

  const LoginPage = () => {
    const handleGoogleLogin = async () => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) throw error;
      } catch (error) {
        alert('Gagal Login: ' + (error.error_description || error.message));
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
              <Users className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">HR Pro SaaS</h1>
            <p className="text-gray-600">Platform Manajemen HR Strategis</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-md"
            >
              {/* Icon Google SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Mengalihkan...' : 'Masuk dengan Google'}
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              Aman & Terenkripsi via Google Cloud
            </p>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard HR Strategis</h1>
        <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-green-700 text-sm font-medium">
          <Database size={16} /> Database Connected
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Total Karyawan</p>
          <p className="text-3xl font-bold">{employees.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Satisfaction Score</p>
          <p className="text-3xl font-bold">{metrics.employeeSatisfaction}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <Award className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Training Completion</p>
          <p className="text-3xl font-bold">{metrics.trainingCompletion}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-2">👋 Selamat Datang, {user?.user_metadata?.full_name || user?.email}</h3>
        <p className="text-gray-600 text-sm">
          Anda sekarang terhubung ke database cloud. Setiap karyawan yang Anda tambahkan di menu 'Karyawan' akan tersimpan permanen dan aman.
        </p>
      </div>
    </div>
  );

  const EmployeeManagement = () => {
    const [newEmployee, setNewEmployee] = useState({ nama: '', departemen: '', posisi: '', status: 'Aktif' });
    const [isSaving, setIsSaving] = useState(false);

    const addEmployee = async () => {
      if (newEmployee.nama && newEmployee.departemen && newEmployee.posisi) {
        setIsSaving(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          const { data, error } = await supabase
            .from('employees')
            .insert([
              { ...newEmployee, user_id: user.id }
            ])
            .select();

          if (error) throw error;

          setEmployees([data[0], ...employees]);
          setNewEmployee({ nama: '', departemen: '', posisi: '', status: 'Aktif' });
        } catch (error) {
          alert('Error: ' + error.message);
        } finally {
          setIsSaving(false);
        }
      }
    };

    const deleteEmployee = async (id) => {
      if(window.confirm("Yakin hapus data ini?")) {
        try {
          const { error } = await supabase.from('employees').delete().eq('id', id);
          if (error) throw error;
          setEmployees(employees.filter(e => e.id !== id));
        } catch (error) {
          alert('Gagal hapus: ' + error.message);
        }
      }
    }

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Manajemen Karyawan</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Tambah Karyawan Baru</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={newEmployee.nama}
              onChange={(e) => setNewEmployee({...newEmployee, nama: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Departemen"
              value={newEmployee.departemen}
              onChange={(e) => setNewEmployee({...newEmployee, departemen: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Posisi"
              value={newEmployee.posisi}
              onChange={(e) => setNewEmployee({...newEmployee, posisi: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addEmployee}
              disabled={isSaving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data database...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Departemen</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Posisi</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.length === 0 ? (
                   <tr><td colSpan="5" className="p-6 text-center text-gray-400">Belum ada data.</td></tr>
                ) : employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{emp.nama}</td>
                    <td className="px-6 py-4">{emp.departemen}</td>
                    <td className="px-6 py-4">{emp.posisi}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{emp.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteEmployee(emp.id)} className="text-red-500 hover:text-red-700">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  if (!isLoggedIn) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${showMenu ? 'block' : 'hidden'} md:block w-64 bg-indigo-900 text-white fixed md:relative h-screen z-20 overflow-y-auto`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">HR Pro</h1>
          <div className="mb-6 p-3 bg-indigo-800 rounded-lg flex items-center gap-3">
             {/* Foto Profil dari Google */}
             {user?.user_metadata?.avatar_url && (
               <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full border border-indigo-400" alt="Avatar"/>
             )}
             <div className="overflow-hidden">
               <p className="text-sm font-bold truncate">{user?.user_metadata?.full_name}</p>
               <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
             </div>
          </div>
          <nav className="space-y-2">
            {['dashboard', 'employees'].map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg capitalize ${currentPage === page ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}
              >
                {page === 'dashboard' ? <BarChart3 size={20} /> : <Users size={20} />} {page}
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors mt-6 text-red-300">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          <button onClick={() => setShowMenu(!showMenu)}><Menu /></button>
          <span className="font-bold">HR Pro</span>
        </div>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'employees' && <EmployeeManagement />}
      </div>
    </div>
  );
};

export default HRSaaSApp;