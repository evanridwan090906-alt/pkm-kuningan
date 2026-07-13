import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, BookOpen, BookMarked, Clock, 
  Heart, Settings, LogOut, Menu, Bell, User as UserIcon,
  ChevronLeft, ChevronRight, BookOpen as BookOpenIcon, AlertTriangle
} from 'lucide-react';
import api from '../api';
import { useSystem } from '../context/SystemContext';

const SidebarItem = ({ to, icon: Icon, label, active, onClick, collapsed }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative mb-1 ${
      active 
        ? 'bg-blue-600/10 text-blue-700 font-bold' 
        : 'text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900'
    }`}
  >
    <div className={`flex items-center justify-center shrink-0 ${active ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    </div>
    
    {!collapsed && <span className="truncate">{label}</span>}

    {collapsed && (
      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

export default function StudentLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const { system } = useSystem();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login/siswa');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const menuItems = [
    { to: '/siswa/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/siswa/borrow', icon: Search, label: 'Cari Buku' },
    { to: '/siswa/ebooks', icon: BookOpen, label: 'Buku Digital' },
    { to: '/siswa/my-history', icon: Clock, label: 'Peminjaman Saya' },
    { to: '/siswa/history-full', icon: Clock, label: 'Riwayat' },
    { to: '/siswa/favorites', icon: Heart, label: 'Favorit' },
    { to: '/siswa/settings', icon: UserIcon, label: 'Profil' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-[50] flex flex-col transition-all duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'w-20' : 'w-72'}`}>
        
        {/* Brand */}
        <div className={`h-20 flex items-center border-b border-slate-100 ${isCollapsed ? 'justify-center px-0' : 'px-8 gap-3'}`}>
          <div className="w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden">
            {system.logo ? (
              <img src={`/storage/${system.logo}`} alt="Logo" className="w-full h-full object-cover rounded-md" />
            ) : (
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReJdTUqqELPRnzLQT_zXmNGSi-iuKwD9CNcA&s" alt="Logo" className="w-full h-auto rounded-md" />
            )}
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-black text-[#0f172a] tracking-tight truncate max-w-[180px]">{system.app_name}</h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate max-w-[180px]">{system.school_name}</p>
            </div>
          )}
        </div>

        {/* User Info (Visible if not collapsed) */}
        {!isCollapsed && (
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-slate-100 p-0.5 shrink-0 overflow-hidden bg-slate-50">
                <img 
                  src={user.profile_photo_url || `https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=fff`} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-500 font-medium truncate">{user.nim} • {user.jurusan}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? 'MENU' : 'MENU UTAMA'}
          </p>
          <div className="space-y-1">
            {menuItems.map(item => (
              <SidebarItem 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to} 
                onClick={() => setIsMobileOpen(false)}
                collapsed={isCollapsed}
              />
            ))}
          </div>
        </div>

        {/* Collapse Toggle & Logout */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={confirmLogout}
            className={`flex items-center justify-center gap-3 w-full py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-sm ${isCollapsed ? 'px-0' : 'px-4'}`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Keluar Sistem</span>}
          </button>
        </div>

        {/* Desktop Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-24 w-7 h-7 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main Content Wrapper */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        
        {/* Topbar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 h-20 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 rounded-lg" onClick={() => setIsMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="hidden sm:block text-lg font-black text-[#0f172a] capitalize tracking-tight">
              {menuItems.find(m => m.to === location.pathname)?.label || 'Portal Akademik'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Quick Search */}
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Cari Koleksi Cepat..." 
                className="w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Mobile Profile Avatar */}
            <div className="lg:hidden w-9 h-9 rounded-full overflow-hidden border border-slate-200">
               <img src={user.profile_photo_url || `https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=fff`} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 overflow-x-hidden">
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40 px-6 py-2 flex justify-between items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[
          { to: '/siswa/dashboard', icon: LayoutDashboard, label: 'Home' },
          { to: '/siswa/borrow', icon: Search, label: 'Fisik' },
          { to: '/siswa/ebooks', icon: BookOpen, label: 'Digital' },
          { to: '/siswa/my-history', icon: Clock, label: 'Riwayat' }
        ].map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-1 p-2 w-16 ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-100/50' : 'bg-transparent'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center overflow-hidden">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-600" size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">Apakah Anda yakin ingin keluar dari sistem Siswa?</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowLogoutConfirm(false)} className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all">Batal</button>
                <button onClick={handleLogout} className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-500/20">Ya, Keluar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
