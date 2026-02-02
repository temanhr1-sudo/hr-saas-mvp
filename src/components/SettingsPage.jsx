import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, CreditCard, Building, Globe, Clock, Crown, LogOut, Loader2, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SettingsPage = ({ 
  user,
  subscriptionType = 'trial',
  trialDaysLeft = 14,
  onUpgrade,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'success' | 'error' | ''

  // --- 1. STATE FORM (Diisi data asli dari Supabase saat load) ---
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    company: user?.user_metadata?.company || '',
    industry: user?.user_metadata?.industry || 'Teknologi',
    employeesSize: user?.user_metadata?.employees_size || '1-50',
    address: user?.user_metadata?.address || ''
  });

  // Notifikasi (Mockup UI, belum ada tabel DB-nya)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    monthly: true
  });

  const displayEmail = user?.email || 'email@example.com';
  const displayPicture = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${formData.fullName}&background=4F46E5&color=fff`;

  // --- 2. LOGIKA UPDATE KE SUPABASE ---
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveStatus('');

    try {
      // Update metadata user di Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.fullName,
          phone: formData.phone,
          company: formData.company,
          industry: formData.industry,
          employees_size: formData.employeesSize,
          address: formData.address
        }
      });

      if (error) throw error;
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000); // Hilangkan pesan sukses setelah 3 detik
    } catch (error) {
      alert('Gagal menyimpan: ' + error.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 3. KOMPONEN UI TABS ---

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'company', label: 'Perusahaan', icon: Building },
    { id: 'subscription', label: 'Langganan', icon: CreditCard },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Lock },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-6">
        <img 
          src={displayPicture} 
          alt="Profile" 
          className="w-24 h-24 rounded-full border-4 border-indigo-100 shadow-sm"
        />
        <div>
          <h3 className="font-bold text-lg text-gray-800">{formData.fullName || 'User'}</h3>
          <p className="text-gray-500 text-sm mb-2">{displayEmail}</p>
          <button className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 font-medium">
            Ubah Foto (Via Google)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
          <input 
            type="text" 
            name="fullName"
            value={formData.fullName} 
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            value={displayEmail} 
            disabled 
            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Posisi</label>
          <input 
            type="text" 
            value="Admin / HR Manager" 
            disabled
            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">No. WhatsApp</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0812..." 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <button 
          onClick={handleSaveChanges}
          disabled={isSaving}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            saveStatus === 'success' ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : saveStatus === 'success' ? <CheckCircle className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
          {isSaving ? 'Menyimpan...' : saveStatus === 'success' ? 'Tersimpan!' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );

  const renderCompanyTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
          <input 
            type="text" 
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Cth: PT Maju Mundur"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industri</label>
          <select 
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option>Teknologi</option>
            <option>Manufaktur</option>
            <option>Retail</option>
            <option>Jasa</option>
            <option>Lainnya</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Karyawan</label>
          <select 
            name="employeesSize"
            value={formData.employeesSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option>1-50</option>
            <option>51-200</option>
            <option>201-500</option>
            <option>500+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Negara</label>
          <input 
            type="text" 
            defaultValue="Indonesia" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            disabled
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Kantor</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Alamat lengkap perusahaan..."
        ></textarea>
      </div>

      <div className="pt-4 border-t">
        <button 
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
          Simpan Data Perusahaan
        </button>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className={`rounded-lg p-6 text-white shadow-md ${
        subscriptionType === 'trial' ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {subscriptionType === 'trial' ? (
              <>
                <div className="p-2 bg-white/20 rounded-full"><Clock className="w-8 h-8" /></div>
                <div><h3 className="text-xl font-bold">Free Trial</h3><p className="text-sm opacity-90">{trialDaysLeft} hari tersisa</p></div>
              </>
            ) : (
              <>
                <div className="p-2 bg-white/20 rounded-full"><Crown className="w-8 h-8" /></div>
                <div><h3 className="text-xl font-bold">{subscriptionType === 'monthly' ? 'Paket Bulanan' : 'Paket Tahunan'}</h3><p className="text-sm opacity-90">Status: Aktif</p></div>
              </>
            )}
          </div>
          {subscriptionType === 'trial' && (
            <button onClick={onUpgrade} className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold shadow hover:bg-gray-50 transition-colors">Upgrade</button>
          )}
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Fitur Paket Anda</h3>
        <ul className="space-y-2">
          {['Dashboard Analytics', 'Employee Management', 'HR Strategy Tools', 'Reports & Analytics'].map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-5 h-5 text-green-500"/> {feature}</li>
          ))}
          {subscriptionType === 'trial' && (
            <li className="flex items-center gap-2 text-orange-600 font-medium"><Clock className="w-5 h-5"/> Limit: Max 3 Karyawan</li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Preferensi Notifikasi</h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Terima notifikasi via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Notifikasi push browser' },
            { key: 'weekly', label: 'Weekly Summary', desc: 'Ringkasan mingguan HR metrics' },
            { key: 'monthly', label: 'Monthly Report', desc: 'Laporan bulanan otomatis' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div><p className="font-medium text-gray-800">{item.label}</p><p className="text-sm text-gray-600">{item.desc}</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications[item.key]} onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pengaturan</h1>
        <p className="text-gray-600">Kelola profil dan preferensi aplikasi</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4 sticky top-6">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" /> {tab.label}
                  </button>
                );
              })}
              <hr className="my-4" />
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-5 h-5" /> Keluar
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'company' && renderCompanyTab()}
            {activeTab === 'subscription' && renderSubscriptionTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'security' && <div className="text-center py-10 text-gray-500"><Lock className="w-12 h-12 mx-auto mb-2 opacity-50"/>Keamanan dikelola oleh Google Authentication.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;