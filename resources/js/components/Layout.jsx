import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Book, 
  Layers, 
  ArrowLeftRight, 
  Archive, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun,
  Grid,
  PlusCircle,
  MinusCircle,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  BookMarked,
  GraduationCap
} from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors group relative ${
      active 
        ? 'bg-blue-50/80 text-blue-900 font-bold' 
        : 'text-slate-600 font-medium hover:bg-slate-50'
    }`}
  >
    {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-800 rounded-l" />}
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
      active 
        ? 'bg-blue-100/50 border-blue-200/50 text-blue-800' 
        : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
    }`}>
      <Icon size={16} />
    </div>
    <span>{label}</span>
  </Link>
);

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [system, setSystem] = useState({
    app_name: 'Library Admin',
    school_name: 'Central Archive'
  });

  const fromLogin = location.state?.fromLogin;

  const fetchSystemSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.system) {
        setSystem(res.data.system);
      }
    } catch (err) {
      console.error('Failed to fetch system settings', err);
    }
  };

  useEffect(() => {
    fetchSystemSettings();
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowLogoutConfirm(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const confirmLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/books', icon: Book, label: 'Koleksi Buku' },
    { to: '/dashboard/ebooks', icon: BookOpen, label: 'E-Book Digital' },
    { to: '/dashboard/borrow-management', icon: BookMarked, label: 'Peminjaman' },
    { to: '/dashboard/archives', icon: Archive, label: 'Laporan / Arsip' },
    ...(isAdmin ? [
      { to: '/dashboard/users', icon: Users, label: 'Petugas' },
      { to: '/dashboard/categories', icon: Layers, label: 'Kategori' }
    ] : []),
    { to: '/dashboard/students', icon: GraduationCap, label: 'Siswa / Anggota' },
    { to: '/dashboard/stock-in', icon: PlusCircle, label: 'Buku Masuk' },
    { to: '/dashboard/stock-out', icon: MinusCircle, label: 'Buku Keluar' },
    { to: '/dashboard/racks', icon: Grid, label: 'Lokasi Rak' },
    { to: '/dashboard/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-[#F8FAFC] flex"
    >
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - White Clean */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-[50] transition-transform duration-300 transform lg:translate-x-0 flex flex-col ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-8 pb-6 flex items-center gap-4">
          {system.logo ? (
            <img src={`/storage/${system.logo}`} alt="Logo" className="w-10 h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800 shrink-0">
              <Book size={20} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-[#0f172a] leading-none">{system.app_name}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 whitespace-nowrap">{system.school_name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.to}
                {...item}
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-0.5">

            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-white border-slate-200 text-slate-400 group-hover:border-red-200 group-hover:text-red-500">
                <LogOut size={16} />
              </div>
              <span>Keluar</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:pl-72 min-w-0 pb-20 lg:pb-0 relative">
        {/* Header - Minimalist */}
        <header className="sticky top-0 bg-white border-b border-slate-200 z-30 px-4 md:px-8 py-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 w-1/3">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-[#0f172a] transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="hidden md:flex items-center text-sm">
                <span className="font-bold text-[#0f172a]">{system.app_name}</span>
                <span className="mx-3 text-slate-300">|</span>
                <span className="font-medium text-slate-500">Dashboard Manajemen</span>
            </div>
          </div>

          <div className="lg:hidden flex-1 text-center font-black text-[#0f172a] uppercase tracking-widest text-sm">
            {menuItems.find(m => m.to === location.pathname)?.label || system.app_name}
          </div>

          <div className="flex items-center justify-end gap-4 text-slate-500 w-1/3">
            <button className="hover:text-[#0f172a] transition-colors relative hidden sm:block">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shrink-0">
                <img 
                  src={user?.profile_photo_path ? `/storage/${user?.profile_photo_path}` : `https://ui-avatars.com/api/?name=${user.name || 'Admin'}&background=0D8ABC&color=fff`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet context={{ 
            user, 
            setUser: (u) => { 
              localStorage.setItem('user', JSON.stringify(u)); 
              setUser(u);
            },
            system,
            fetchSystemSettings 
          }} />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-6 py-2 flex justify-between items-center pb-safe">
          {[
            { to: '/dashboard/books', icon: Book, label: 'Catalog' },
            { to: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Circulate' },
            { to: '/dashboard/archives', icon: Archive, label: 'Archive' },
            { to: '/dashboard/settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
            <Link 
              key={item.to} 
              to={item.to}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] ${location.pathname === item.to ? 'text-blue-700' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-xl ${location.pathname === item.to ? 'bg-blue-50' : 'bg-transparent'}`}>
                <item.icon size={22} strokeWidth={location.pathname === item.to ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${location.pathname === item.to ? 'text-blue-700' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center overflow-hidden"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-600" size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses data.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmLogout}
                  className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-200 active:scale-95"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
