import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Pastikan path import ini benar

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: { access_type: 'offline', prompt: 'consent' },
          redirectTo: window.location.origin
        },
      });
      if (error) throw error;
    } catch (error) {
      alert('Gagal Login: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
          <Users className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">HR Pro SaaS</h1>
        <p className="text-gray-600 mb-8">Platform Manajemen HR Strategis</p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          {loading ? 'Mengalihkan...' : 'Masuk dengan Google'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;