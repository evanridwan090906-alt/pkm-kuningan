import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Book, ArrowLeftRight, Archive, Users, 
  LogOut, Menu, ScanBarcode, CheckCircle, Clock, Search, GraduationCap,
  BookOpen, Settings, BarChart2, AlertTriangle
} from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../context/SystemContext';

const SidebarItem = ({ to, icon: Icon, label, active, onClick }) => (
  <Link to={to} onClick={onClick} className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors group relative ${active ? 'bg-emerald-50/80 text-emerald-900 font-bold' : 'text-slate-600 font-medium hover:bg-slate-50'}`}>
    {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-l" />}
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${active ? 'bg-emerald-100/50 border-emerald-200/50 text-emerald-800' : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'}`}>
      <Icon size={16} />
    </div>
    <span>{label}</span>
  </Link>
);

export default function PetugasLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const { system, refreshSystem } = useSystem();
  const fetchSystemSettings = refreshSystem;

  useEffect(() => {
    // no-op: system is managed by SystemProvider global context
  }, []);

  const confirmLogout = async () => {
    try { await api.post('/logout'); } catch (err) {} 
    finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login/petugas');
    }
  };

  const menuItems = [
    { to: '/petugas/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/petugas/transactions', icon: ArrowLeftRight, label: 'Peminjaman & Kembali' },
    { to: '/petugas/scan', icon: ScanBarcode, label: 'Scan Barcode' },
    { to: '/petugas/books', icon: Book, label: 'Data Buku Fisik' },
    { to: '/petugas/ebooks', icon: BookOpen, label: 'Buku Digital' },
    { to: '/petugas/students', icon: GraduationCap, label: 'Data Siswa' },
    { to: '/petugas/reports', icon: BarChart2, label: 'Laporan Perpustakaan' },
    { to: '/petugas/archives', icon: Archive, label: 'Riwayat Operasional' },
    { to: '/petugas/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-[50] transition-transform duration-300 transform lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pb-6 flex items-center gap-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0 overflow-hidden">
            {system.logo ? <img src={`/storage/${system.logo}`} className="w-full h-full object-cover" alt="Logo" /> : <Book size={20} />}
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-none truncate max-w-[180px]">{system.app_name}</h1>
            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider mt-1.5 truncate max-w-[180px]">{system.school_name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <SidebarItem key={item.to} {...item} active={location.pathname === item.to} onClick={() => setIsSidebarOpen(false)} />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
            <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center justify-center gap-3 w-full px-4 py-3 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-500/10 active:scale-95">
              <LogOut size={16} /> Keluar
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col lg:pl-72 min-w-0 pb-20 lg:pb-0 relative">
        <header className="sticky top-0 bg-white border-b border-slate-200 z-30 px-4 md:px-8 py-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <h2 className="font-bold text-slate-900 hidden sm:block">Sistem Petugas Perpustakaan</h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden"><img src={user.profile_photo_path ? `/storage/${user.profile_photo_path}` : `https://ui-avatars.com/api/?name=${user.name || 'Petugas'}&background=10B981&color=fff`} className="w-full h-full object-cover" /></div>
             <span className="text-sm font-bold text-slate-700 hidden sm:block">{user.name}</span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet context={{ user, setUser, system, fetchSystemSettings }} />
        </div>
      </main>
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center overflow-hidden">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-600" size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">Apakah Anda yakin ingin keluar dari sistem Petugas?</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowLogoutConfirm(false)} className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all">Batal</button>
                <button onClick={confirmLogout} className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-500/20">Ya, Keluar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
