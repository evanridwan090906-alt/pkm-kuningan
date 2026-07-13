import { useState } from 'react';
import { Lock, ArrowRight, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorShake(false);
    try {
      const res = await api.post('/login', { identifier, password });
      const { access_token, user } = res.data.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      setIsTransitioning(true);
      toast.success('Login berhasil! Mengalihkan...', { icon: '🎓' });

      // Trigger transition animation
      setTimeout(() => {
        if (user.role === 'siswa') {
          navigate('/student');
        } else {
          navigate('/dashboard');
        }
      }, 1200);

    } catch (err) {
      setErrorShake(true);
      toast.error(err.response?.data?.message || 'Login gagal, periksa kembali data Anda');
      setTimeout(() => setErrorShake(false), 500);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      {/* Left Panel - Image/Brand */}
      <AnimatePresence>
        {!isTransitioning && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hidden lg:flex w-1/2 relative bg-[#0f172a] items-center justify-center p-12 overflow-hidden"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
              style={{ backgroundImage: 'url("https://smkpertiwikng.sch.id/wp-content/uploads/2023/05/DSCF8207-scaled.jpg")' }}
            />
            
            {/* Dark Blue Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#0a192f]/90 to-[#112240]/80 mix-blend-multiply" />
            
            {/* Content */}
            <div className="relative z-20 max-w-lg text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                  <BookOpenIcon />
                </div>
                <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">Lumina Archive</h1>
                <p className="text-lg text-blue-100/80 font-medium leading-relaxed">
                  Akses ribuan koleksi buku digital dan literatur akademik secara langsung dari ujung jari Anda.
                </p>
              </motion.div>
            </div>
            
            {/* Abstract Decorative Element */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl z-10" />
            <div className="absolute top-1/4 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl z-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative"
      >
        <div className="w-full max-w-md">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <BookOpenIcon className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lumina Archive</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang 👋</h2>
            <p className="text-slate-500 mt-2 font-medium">Silakan masuk menggunakan akun akademik Anda</p>
          </div>

          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-6"
            animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">NISN / NIM / Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-sm"
                    placeholder="Masukkan NISN atau Email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kata Sandi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors" />
                  <svg className="absolute w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-sm font-medium text-slate-600 select-none group-hover:text-slate-900 transition-colors">Ingat saya</span>
              </label>

              <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                Lupa Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || isTransitioning}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#0f172a] hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all overflow-hidden shadow-lg shadow-slate-900/20 disabled:opacity-80"
            >
              {loading || isTransitioning ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Masuk Sekarang
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </motion.form>

          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            Butuh bantuan? <button className="font-bold text-blue-600 hover:text-blue-800">Hubungi Petugas Perpustakaan</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Icon for the background
const BookOpenIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);
