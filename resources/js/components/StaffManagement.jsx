import { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Mail, 
  Clock, 
  Globe, 
  Smartphone, 
  Monitor, 
  Power, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  Activity,
  History
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState({ open: false, user: null, password: '' });
  const [activityModal, setActivityModal] = useState({ open: false, user: null });

  const fetchStaff = async () => {
    try {
      const res = await api.get('/petugas');
      setStaff(res.data);
    } catch (err) {
      console.error('Failed to fetch staff', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    const interval = setInterval(fetchStaff, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (user) => {
    try {
      const res = await api.put(`/users/${user.id}/status`, { is_active: !user.is_active });
      toast.success(`Akun ${user.name} ${res.data.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchStaff();
    } catch (err) {
      toast.error('Gagal memperbarui status akun');
    }
  };

  const handleForceLogout = async (user) => {
    if (!window.confirm(`Keluarkan ${user.name} dari semua perangkat?`)) return;
    try {
      await api.post(`/users/${user.id}/force-logout`);
      toast.success(`${user.name} telah dikeluarkan dari semua perangkat`);
      fetchStaff();
    } catch (err) {
      toast.error('Gagal melakukan force logout');
    }
  };

  const handleResetPassword = async () => {
    if (resetModal.password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }
    try {
      await api.post(`/users/${resetModal.user.id}/reset-password`, { password: resetModal.password });
      toast.success(`Password ${resetModal.user.name} berhasil direset`);
      setResetModal({ open: false, user: null, password: '' });
    } catch (err) {
      toast.error('Gagal mereset password');
    }
  };

  const handleViewActivities = async (user) => {
    try {
      setActivityModal({ open: true, user, loading: true, data: [] });
      const res = await api.get(`/users/${user.id}/activities`);
      setActivityModal({ open: true, user, loading: false, data: res.data });
    } catch (err) {
      toast.error('Gagal mengambil riwayat aktivitas');
      setActivityModal({ open: false, user: null });
    }
  };

  const getStatusBadge = (user) => {
    const isOnline = user.last_seen && (new Date() - new Date(user.last_seen)) < 300000; // 5 minutes
    if (!user.is_active) return <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase">Nonaktif</span>;
    if (isOnline) return <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online</span>;
    return <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">Offline</span>;
  };

  const formatDevice = (ua) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return <span className="flex items-center gap-1"><Smartphone size={12} /> Mobile</span>;
    return <span className="flex items-center gap-1"><Monitor size={12} /> Desktop</span>;
  };

  const getTimeAgo = (user) => {
    const date = user.last_seen || user.last_login_at || user.created_at;
    if (!date) return 'Tidak diketahui';
    
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    return `${dateStr} - ${timeStr} WIB`;
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Shield className="text-blue-600" size={24} />
              Manajemen & Keamanan Petugas
            </h3>
            <p className="text-sm font-medium text-slate-500">Pantau aktivitas dan kelola hak akses petugas perpustakaan</p>
          </div>
          <button onClick={fetchStaff} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-slate-100">
             <RotateCcw size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Petugas</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Status & Akses</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Aktivitas Terakhir</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden shrink-0">
                        <img 
                           src={user.profile_photo_path ? `/storage/${user.profile_photo_path}` : `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} 
                           alt="" className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(user)}
                        {user.login_attempts > 3 && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                            <AlertCircle size={10} /> Suspicious
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleStatus(user)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${user.is_active ? 'text-emerald-600 hover:text-emerald-700' : 'text-rose-600 hover:text-rose-700'}`}
                        >
                          {user.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Clock size={12} className="text-blue-500" /> {getTimeAgo(user)}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
                        <span className="flex items-center gap-1"><Globe size={10} /> {user.last_ip || 'No IP'}</span>
                        <span>{formatDevice(user.last_device)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleViewActivities(user)}
                        title="Riwayat Aktivitas"
                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <History size={18} />
                      </button>
                      <button 
                        onClick={() => setResetModal({ open: true, user, password: '' })}
                        title="Reset Password"
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button 
                        onClick={() => handleForceLogout(user)}
                        title="Force Logout"
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <LogOut size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setResetModal({ open: false, user: null, password: '' })}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
             >
               <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                 <RotateCcw className="text-blue-600" size={32} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h3>
               <p className="text-slate-500 font-medium mb-8">Masukkan password baru untuk <b>{resetModal.user?.name}</b>. Minimal 8 karakter.</p>
               
               <input 
                 type="password"
                 value={resetModal.password}
                 onChange={(e) => setResetModal(prev => ({ ...prev, password: e.target.value }))}
                 className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-slate-800 mb-6"
                 placeholder="Password Baru"
                 autoFocus
               />

               <div className="flex gap-4">
                 <button 
                   onClick={() => setResetModal({ open: false, user: null, password: '' })}
                   className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={handleResetPassword}
                   className="flex-1 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200"
                 >
                   Simpan
                 </button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Activity Modal */}
      <AnimatePresence>
        {activityModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setActivityModal({ open: false, user: null })}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
             >
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                     <History className="text-emerald-600" size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Riwayat Aktivitas</h3>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{activityModal.user?.name}</p>
                   </div>
                 </div>
                 <button onClick={() => setActivityModal({ open: false, user: null })} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                    <LogOut size={18} className="rotate-180" />
                 </button>
               </div>

               <div className="p-8 max-h-[400px] overflow-y-auto">
                 {activityModal.loading ? (
                   <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-600" /></div>
                 ) : activityModal.data.length === 0 ? (
                   <div className="text-center p-12 text-slate-400 font-bold">Belum ada aktivitas yang tercatat</div>
                 ) : (
                   <div className="space-y-6">
                     {activityModal.data.map((log) => (
                       <div key={log.id} className="flex gap-4 items-start group">
                         <div className="flex flex-col items-center">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                             log.type === 'masuk' ? 'bg-green-50 text-green-600' : 
                             log.type === 'keluar' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                           }`}>
                             <Activity size={14} />
                           </div>
                           <div className="w-px h-full bg-slate-100 mt-2 min-h-[20px]"></div>
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-bold text-slate-800">
                             {log.type === 'masuk' ? 'Restock Buku' : log.type === 'keluar' ? 'Penyusutan' : log.type.toUpperCase()}
                             <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500">{log.quantity} Pcs</span>
                           </p>
                           <p className="text-xs font-medium text-slate-500 mt-0.5">{log.book?.title || 'Unknown Book'}</p>
                           <p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-tighter">
                             {new Date(log.created_at).toLocaleString('id-ID')}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
