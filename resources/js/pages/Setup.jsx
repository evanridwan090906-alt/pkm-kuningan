import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Setup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await api.get('/check-setup');
        if (!res.data.setup_required) {
          navigate('/login');
        }
      } catch (err) {
        console.error('Failed to check setup status', err);
      } finally {
        setChecking(false);
      }
    };
    checkSetup();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/setup', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const errs = Object.values(err.response.data.errors).flat();
        setError(errs.join(', '));
      } else {
        setError(err.response?.data?.message || 'Setup gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Menyiapkan Inisialisasi...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden relative z-10"
      >
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-12 py-16 text-center text-white relative overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl p-4 transform hover:scale-105 transition-transform duration-500">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReJdTUqqELPRnzLQT_zXmNGSi-iuKwD9CNcA&s" alt="CASPER Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-3">Inisialisasi Sistem.</h2>
            <p className="text-blue-100 font-medium text-lg opacity-90">Konfigurasi akun Super Administrator untuk memulai perjalanan digital Anda.</p>
          </div>
          
          {/* Progress Indicator Step 1 of 1 */}
          <div className="mt-8 flex justify-center gap-1">
             <div className="w-8 h-1.5 rounded-full bg-white"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
          </div>
        </div>

        <div className="p-12">
          {error && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-6 rounded-[28px] text-sm flex items-center gap-4 mb-10 shadow-sm"
            >
              <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
                <AlertCircle size={20} />
              </div>
              <span className="font-bold leading-tight">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap Administrator *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-14 pr-6 py-4.5 bg-gray-50 border-2 border-transparent rounded-[24px] font-bold text-gray-800 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-gray-300 placeholder:font-medium"
                  placeholder="Contoh: Muhammad Raihan"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Surel Resmi Instansi *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <div className="font-black text-xl leading-none">@</div>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-14 pr-6 py-4.5 bg-gray-50 border-2 border-transparent rounded-[24px] font-bold text-gray-800 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-gray-300 placeholder:font-medium"
                  placeholder="admin@smkpertiwi.sch.id"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kunci Akses (Password) *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-6 py-4.5 bg-gray-50 border-2 border-transparent rounded-[24px] font-bold text-gray-800 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-gray-300 placeholder:font-medium"
                  placeholder="Minimal 8 karakter unik"
                  minLength="8"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white py-5 px-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-gray-200 active:scale-[0.97] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    Selesaikan Inisialisasi <ArrowRight size={20} className="ml-1" />
                  </>
              )}
            </button>
          </form>
          
          <div className="mt-12 text-center">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">CASPER SMART LIBRARY CORE ENGINE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
