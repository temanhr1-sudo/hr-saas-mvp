import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, TrendingUp, FileText, Settings, 
  Menu, X, LogOut, Clock, Crown, CheckCircle, Target, PieChart,
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { supabase } from './supabaseClient'; 

// --- IMPORT SEMUA KOMPONEN FITUR ---
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import HRStrategy from './components/HRStrategy';
import ReportsAnalytics from './components/ReportsAnalytics';
import SettingsPage from './components/SettingsPage';
import MetricDetail from './components/MetricDetail';
import SubscriptionFlow from './components/SubscriptionFlow'; // <--- KOMPONEN BARU

const HRSaaSApp = () => {
  // ============================================
  // 1. STATE MANAGEMENT
  // ============================================
  
  // Auth & User Data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // Subscription Status
  const [subscriptionType, setSubscriptionType] = useState('trial'); 
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);
  
  // UI & Navigation
  const [currentPage, setCurrentPage] = useState('login');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data Bisnis Global
  const [employees, setEmployees] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null);

  // ============================================
  // 2. BACKEND LOGIC (SUPABASE)
  // ============================================

  useEffect(() => {
    // Cek sesi login saat aplikasi dibuka
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleLoginSuccess(session.user);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    
    try {
      // 1. Cek profil di database
      let { data, error } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', userData.id)
        .single();

      // 2. Jika belum ada (Login pertama), buat profil default
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: userData.id, 
              tier: 'free', 
              email: userData.email,
              full_name: userData.user_metadata?.full_name || ''
            }
          ])
          .select()
          .single();
          
        if (!insertError) data = newProfile;
      }

      // 3. Set state aplikasi
      if (data) {
        setSubscriptionType(data.tier === 'pro' ? 'monthly' : 'trial');
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    }

    fetchEmployees(); 
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Gagal mengambil data karyawan:', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setEmployees([]);
    setSubscriptionType('trial');
    setCurrentPage('login');
  };

  // ============================================
  // 3. HANDLERS
  // ============================================

  // Navigasi drill-down (Dashboard -> Detail Matriks)
  const handleMetricSelect = (metricType) => {
    setSelectedMetric(metricType);
    setCurrentPage('metric-detail');
  };

  // ============================================
  // 4. RENDER PAGE ROUTING
  // ============================================

  if (!isLoggedIn) return <LoginPage />;

  // --- RENDER HALAMAN SUBSCRIPTION FLOW (FULL SCREEN) ---
  if (currentPage === 'subscription') {
    return (
      <SubscriptionFlow 
        user={user} 
        setCurrentPage={setCurrentPage} 
      />
    );
  }

  // ============================================
  // 5. MAIN LAYOUT (Sidebar + Content)
  // ============================================
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <div 
        className={`
          bg-indigo-900 text-white fixed md:relative h-screen z-20 transition-all duration-300 ease-in-out flex flex-col
          ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
        `}
      >
        {/* Header Sidebar */}
        <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
          {!isSidebarCollapsed && <h1 className="text-2xl font-bold whitespace-nowrap tracking-tight">HR Pro</h1>}
          <button 
            onClick={() => window.innerWidth < 768 ? setShowMobileMenu(false) : setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="p-1.5 rounded-lg hover:bg-indigo-800 text-indigo-200 transition-colors"
          >
            {window.innerWidth < 768 ? <X size={24} /> : (isSidebarCollapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>)}
          </button>
        </div>
        
        {/* User Profile Widget */}
        <div className={`mx-3 mb-6 bg-indigo-800/50 rounded-xl border border-indigo-700/50 transition-all duration-300 ${isSidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <img 
              src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-indigo-400 flex-shrink-0" 
            />
            
            {!isSidebarCollapsed && (
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-bold truncate text-white">
                  {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
                </p>
                
                <div className="flex items-center gap-1.5 text-xs text-indigo-200 mt-0.5">
                  {subscriptionType === 'trial' ? (
                    <Clock size={12} className="text-orange-400" />
                  ) : (
                    <Crown size={12} className="text-yellow-400 fill-yellow-400" />
                  )}
                  <span className="capitalize truncate">
                    {subscriptionType === 'trial' ? `Trial (${trialDaysLeft} hari)` : 'PRO Member'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'employees', label: 'Karyawan', icon: Users },
            { id: 'strategy', label: 'Strategi HR', icon: Target },
            { id: 'reports', label: 'Laporan', icon: PieChart },
            { id: 'settings', label: 'Pengaturan', icon: Settings },
          ].map((item) => {
            const isActive = currentPage === item.id || (currentPage === 'metric-detail' && item.id === 'dashboard');
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setShowMobileMenu(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'}
                  ${isSidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`} />
                
                {!isSidebarCollapsed && (
                  <span className="whitespace-nowrap font-medium text-sm">{item.label}</span>
                )}

                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-indigo-800 mt-auto">
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-300 text-indigo-300 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title="Keluar Aplikasi"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Keluar</span>}
          </button>
        </div>
      </div>

      {/* OVERLAY MOBILE */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto h-screen bg-gray-50 relative w-full">
        {/* Mobile Header Toggle */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden sticky top-0 z-30">
          <button onClick={() => setShowMobileMenu(true)} className="p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-800">HR Pro</span>
          <img src={user?.user_metadata?.avatar_url} alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
        </div>

        {/* Dynamic Page Content */}
        {currentPage === 'dashboard' && (
          <Dashboard 
            tier={subscriptionType} 
            employeesCount={employees.length} 
            employees={employees} 
            setCurrentPage={setCurrentPage} 
            onSelectMetric={handleMetricSelect} 
          />
        )}
        
        {currentPage === 'metric-detail' && (
          <MetricDetail 
            metricType={selectedMetric} 
            onBack={() => setCurrentPage('dashboard')} 
          />
        )}

        {currentPage === 'employees' && (
          <EmployeeManagement 
            tier={subscriptionType} 
            employees={employees} 
            setEmployees={setEmployees} 
            setCurrentPage={setCurrentPage} 
          />
        )}

        {currentPage === 'strategy' && <HRStrategy />}
        
        {currentPage === 'reports' && <ReportsAnalytics />}
        
        {currentPage === 'settings' && (
          <SettingsPage 
            user={user} 
            subscriptionType={subscriptionType} 
            trialDaysLeft={trialDaysLeft} 
            // FUNGSI INI YANG MENGHUBUNGKAN TOMBOL UPGRADE KE HALAMAN SUBSCRIPTION
            onUpgrade={() => setCurrentPage('subscription')} 
            onLogout={handleLogout} 
          />
        )}
      </div>
    </div>
  );
};

export default HRSaaSApp;