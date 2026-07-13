import { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../context/SystemContext';
import { useTransition } from '../context/TransitionContext';

export default function LoginAdmin() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate  = useNavigate();
  const { system } = useSystem();
  const { setTransition } = useTransition();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', { identifier: email, password, role: 'admin' });
      const { access_token, user } = res.data.data;

      if (user.role !== 'admin') {
        toast.error('Akses ditolak. Anda bukan Admin.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Otentikasi Berhasil', { icon: '🛡️' });
      setTransition('admin'); // trigger split-screen exit

      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal, periksa kredensial Anda');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">

      {/* Left hero — exits left on login */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-110%' }}
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            className="hidden lg:flex w-1/2 relative bg-[#020617] items-center justify-center p-12 overflow-hidden"
          >
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://smkpertiwikng.sch.id/wp-content/uploads/2023/05/DSCF8207-scaled.jpg")' }} />
            <div className="absolute inset-0 z-10 bg-black/40" />
            {/* Premium glow effect */}
            <div className="absolute inset-0 z-[5] bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/20" />

            <div className="relative z-20 max-w-md text-center lg:text-left drop-shadow-lg">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-8 bg-black/20 p-4 rounded-xl backdrop-blur-sm w-fit mx-auto lg:mx-0">
                  <div className="flex items-center gap-3">
                    {system.logo ? (
                      <img src={`/storage/${system.logo}`} alt="Logo" className="h-16 w-auto rounded-lg shadow-lg object-contain bg-white/10 p-1" />
                    ) : (
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReJdTUqqELPRnzLQT_zXmNGSi-iuKwD9CNcA&s" alt="School Logo" className="h-16 w-auto rounded-lg shadow-lg" />
                    )}
                    <div className="w-px h-10 bg-white/20 mx-1" />
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6wcAr6g49kkZIQaQ2K9gFq-FpbHMpRGbMiw&s" alt="Secondary Logo" className="h-14 w-auto rounded-lg shadow-lg object-contain bg-white/10 p-1" />
                  </div>
                </div>
                <h1 className="text-4xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-md">{system.app_name}</h1>
                {system.school_name && <p className="text-xl text-blue-400 font-bold mb-4">{system.school_name}</p>}
                <p className="text-lg text-white font-medium leading-relaxed drop-shadow-md">Kelola inventaris, pantau peminjaman, dan hasil laporan komprehensif dalam satu platform cerdas.</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right form — exits right on login (split effect) */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 lg:bg-white relative"
        animate={loading ? { x: '6%', opacity: 0.7, scale: 0.97 } : { x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-700">Mengautentikasi...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-4 mb-8">
              {system.logo ? (
                <img src={`/storage/${system.logo}`} alt="School Logo" className="h-14 w-auto rounded-lg object-contain" />
              ) : (
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReJdTUqqELPRnzLQT_zXmNGSi-iuKwD9CNcA&s" alt="School Logo" className="h-14 w-auto rounded-lg" />
              )}
              <div className="w-px h-8 bg-slate-200 mx-1" />
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6wcAr6g49kkZIQaQ2K9gFq-FpbHMpRGbMiw&s" alt="Secondary Logo" className="h-12 w-auto rounded-lg" />
            </div>

            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Selamat Datang Admin</h2>
            <p className="text-slate-500 font-medium">Masuk untuk mengelola {system.app_name}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Administrator</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white lg:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-sm"
                    placeholder="admin@system.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white lg:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-sm"
                    placeholder="••••••••" />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01, boxShadow: '0 8px 30px rgba(15,23,42,0.2)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full py-4 bg-[#0f172a] hover:bg-blue-600 text-white rounded-2xl font-black text-sm transition-colors flex items-center justify-center gap-2 mt-4 shadow-xl shadow-slate-900/10 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">Masuk Sekarang <ArrowRight size={18} /></span>
              )}
            </motion.button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              @ 2026 STMIK IKMI CIREBON & CASPER Smart Library.<br />All right reserved
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
