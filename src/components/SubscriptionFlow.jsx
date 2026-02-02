import React, { useState } from 'react';
import { CheckCircle, Crown, Calendar, MessageCircle } from 'lucide-react';

const SubscriptionFlow = ({ user, setCurrentPage }) => {
  const [subStep, setSubStep] = useState('pricing'); // pricing, payment, success
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  // KONFIGURASI HARGA & REKENING
  const CONFIG = {
    whatsappNumber: "6285888129115", // Ganti No WA
    bank: { name: "JAGO", number: "1015 9621 4484", holder: "A.N. ARI RAMADHAN" },
    prices: { monthly: 29000, yearly: 299000 }
  };

  const plans = {
    monthly: { price: CONFIG.prices.monthly, name: 'Paket Bulanan', label: '/bulan' },
    yearly: { price: CONFIG.prices.yearly, name: 'Paket Tahunan', label: '/tahun', savings: 'Hemat 2 Bulan' }
  };

  // 1. Tampilan Pricing
  if (subStep === 'pricing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setCurrentPage('dashboard')} className="mb-6 text-gray-500 hover:text-gray-800">← Kembali ke Dashboard</button>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Pilih Paket Berlangganan</h1>
            <p className="text-gray-600">Investasi kecil untuk produktivitas besar</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Monthly */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-500 transition-all">
              <div className="text-center mb-6">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h2 className="text-2xl font-bold mb-2">Paket Bulanan</h2>
                <div className="text-4xl font-bold text-blue-600 mb-2">Rp {plans.monthly.price.toLocaleString('id-ID')}<span className="text-lg text-gray-500">/bulan</span></div>
              </div>
              <ul className="space-y-3 mb-8">{['Akses semua fitur HR', 'Dashboard analytics', 'Manajemen karyawan unlimited', 'HR metrics & KPI', 'Support email'].map((f, i) => (<li key={i} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span className="text-gray-700">{f}</span></li>))}</ul>
              <button onClick={() => { setSelectedPlan('monthly'); setSubStep('payment'); }} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors">Pilih Paket Bulanan</button>
            </div>
            {/* Yearly */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 border-2 border-indigo-600 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><Crown className="w-4 h-4" /> {plans.yearly.savings}</div>
              <div className="text-center mb-6 text-white">
                <Calendar className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Paket Tahunan</h2>
                <div className="text-4xl font-bold mb-2">Rp {plans.yearly.price.toLocaleString('id-ID')}<span className="text-lg opacity-90">/tahun</span></div>
              </div>
              <ul className="space-y-3 mb-8 text-white">{['Semua fitur Bulanan', 'Priority support 24/7', 'Konsultasi HR gratis', 'Custom reports'].map((f, i) => (<li key={i} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{f}</span></li>))}</ul>
              <button onClick={() => { setSelectedPlan('yearly'); setSubStep('payment'); }} className="w-full bg-white hover:bg-gray-100 text-indigo-600 py-3 rounded-lg font-semibold transition-colors">Pilih Paket Tahunan</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Tampilan Payment
  if (subStep === 'payment') {
    const activePlan = plans[selectedPlan];
    const message = `Halo Admin, saya ingin upgrade ke *${activePlan.name}* seharga Rp ${activePlan.price.toLocaleString('id-ID')}.\n\nEmail Akun: ${user?.email}`;
    const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setSubStep('pricing')} className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-semibold">← Kembali ke Pilihan Paket</button>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h1 className="text-3xl font-bold mb-6">Instruksi Pembayaran</h1>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6"><p className="text-sm text-yellow-700">Silakan gunakan <strong>Transfer Manual</strong> di bawah ini.</p></div>
              <div className="mb-8">
                <div className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-4 mb-2"><span className="text-3xl">🏦</span><div><p className="font-bold text-gray-800">BANK {CONFIG.bank.name}</p><p className="text-sm text-gray-600 uppercase">{CONFIG.bank.holder}</p></div></div>
                  <p className="text-2xl font-mono font-bold text-indigo-700 tracking-wider">{CONFIG.bank.number}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Cara Konfirmasi:</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700"><li>Transfer <strong>Rp {activePlan.price.toLocaleString('id-ID')}</strong>.</li><li>Simpan bukti transfer.</li><li>Klik tombol <strong>Konfirmasi WhatsApp</strong>.</li></ol>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-8">
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between"><span className="text-gray-600">Paket</span><span className="font-semibold">{activePlan.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Harga</span><span className="font-semibold">Rp {activePlan.price.toLocaleString('id-ID')}</span></div>
                <div className="border-t pt-3"><div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-indigo-600">Rp {activePlan.price.toLocaleString('id-ID')}</span></div></div>
              </div>
              <a href={waLink} target="_blank" rel="noreferrer" onClick={() => setSubStep('success')} className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"><MessageCircle size={20} /> Konfirmasi WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tampilan Success
  if (subStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"><CheckCircle className="w-12 h-12 text-green-600" /></div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Menunggu Verifikasi</h1>
          <p className="text-gray-600 mb-8">Jangan lupa kirimkan bukti transfer Anda di WhatsApp agar Admin bisa segera mengaktifkan paket Anda.</p>
          <button onClick={() => setCurrentPage('dashboard')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }
};

export default SubscriptionFlow;