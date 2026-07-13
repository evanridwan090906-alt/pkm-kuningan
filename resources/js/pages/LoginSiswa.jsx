import { useState } from 'react';
import { Lock, ArrowRight, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../context/SystemContext';
import { useTransition } from '../context/TransitionContext';

export default function LoginSiswa() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const navigate  = useNavigate();
  const { system } = useSystem();
  const { setTransition } = useTransition();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorShake(false);
    try {
      const res = await api.post('/login', { identifier, password, role: 'siswa' });
      const { access_token, user } = res.data.data;

      if (user.role !== 'siswa') {
        toast.error('Gunakan halaman login yang sesuai dengan peran Anda.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login berhasil! Mengalihkan...', { icon: '🎓' });
      setTransition('siswa'); // trigger left-slide

      setTimeout(() => navigate('/siswa/dashboard'), 900);
    } catch (err) {
      setErrorShake(true);
      toast.error(err.response?.data?.message || 'Login gagal, periksa kembali data Anda');
      setTimeout(() => setErrorShake(false), 500);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">

      {/* Left panel — hero image */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -120 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="hidden lg:flex w-1/2 relative bg-[#0f172a] items-center justify-center p-12 overflow-hidden"
          >
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://smkpertiwikng.sch.id/wp-content/uploads/2023/05/DSCF8207-scaled.jpg")' }} />
            <div className="absolute inset-0 z-10 bg-black/40" />
            <div className="relative z-20 max-w-lg text-white drop-shadow-lg">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-8 bg-black/20 p-4 rounded-xl backdrop-blur-sm w-fit">
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
                <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight drop-shadow-md">{system.app_name}</h1>
                {system.school_name && <p className="text-xl text-blue-300 font-bold mb-4">{system.school_name}</p>}
                <p className="text-lg text-white font-medium leading-relaxed drop-shadow-md">Akses ribuan koleksi buku digital dan literatur akademik secara langsung dari ujung jari Anda.</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right panel — form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative"
        animate={loading ? { scale: 0.98, filter: 'blur(1px)' } : { scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.3 }}
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-600">Memverifikasi...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <div className="lg:hidden flex items-center justify-center gap-4 mb-6">
              {system.logo ? (
                <img src={`/storage/${system.logo}`} alt="School Logo" className="h-14 w-auto rounded-lg object-contain" />
              ) : (
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReJdTUqqELPRnzLQT_zXmNGSi-iuKwD9CNcA&s" alt="School Logo" className="h-14 w-auto rounded-lg" />
              )}
              <div className="w-px h-8 bg-slate-200 mx-1" />
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6wcAr6g49kkZIQaQ2K9gFq-FpbHMpRGbMiw&s" alt="Secondary Logo" className="h-12 w-auto rounded-lg" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{system.app_name}</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang 👋</h2>
            <p className="text-slate-500 mt-2 font-medium">Akses koleksi buku digital menggunakan akun sekolah Anda.</p>
          </div>

          <motion.form
            onSubmit={handleLogin}
            className="space-y-6"
            animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#0f172a] mb-2">NISN / NIM</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-sm" placeholder="Masukkan NISN atau NIM Anda" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0f172a] mb-2">Kata Sandi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-sm" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-[#0f172a] peer-checked:border-[#0f172a] transition-colors" />
                  <svg className="absolute w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-sm font-medium text-slate-600 select-none group-hover:text-slate-900 transition-colors">Ingat saya</span>
              </label>
              <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Lupa Password?</button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#0f172a] hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all overflow-hidden shadow-lg shadow-slate-900/20 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">Masuk ke Perpustakaan Digital <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
              )}
            </motion.button>
          </motion.form>

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
