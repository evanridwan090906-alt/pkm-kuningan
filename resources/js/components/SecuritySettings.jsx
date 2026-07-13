import { useState, useEffect } from 'react';
import { Shield, Save, Loader2, LogOut, Clock, History, Monitor, Smartphone } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

export default function SecuritySettings({ system, onUpdate }) {
  const [formData, setFormData] = useState({
    auto_logout_minutes: system?.auto_logout_minutes || 30,
  });
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [fetchingSessions, setFetchingSessions] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/settings/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setFetchingSessions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/settings/security', formData);
      onUpdate(res.data.system);
      Swal.fire('Berhasil!', 'Pengaturan keamanan diperbarui', 'success');
    } catch (err) {
      Swal.fire('Error', 'Gagal memperbarui keamanan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOthers = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Seluruh perangkat lain akan segera dikeluarkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Keluarkan!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.post('/settings/sessions/logout-others');
        Swal.fire('Berhasil', 'Seluruh perangkat lain telah dikeluarkan', 'success');
        fetchSessions();
      } catch (err) {
        Swal.fire('Error', 'Gagal mengeluarkan perangkat lain', 'error');
      }
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
          <Shield size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Keamanan Sistem</h2>
          <p className="text-sm font-medium text-gray-500">Kontrol akses dan sesi pengguna aktif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Auto Logout Sesi</label>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <select
                value={formData.auto_logout_minutes}
                onChange={(e) => setFormData({ ...formData, auto_logout_minutes: parseInt(e.target.value) })}
                className="w-full h-14 pl-12 pr-10 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 appearance-none shadow-sm"
              >
                <option value="5">Setelah 5 Menit Inaktif</option>
                <option value="10">Setelah 10 Menit Inaktif</option>
                <option value="30">Setelah 30 Menit Inaktif</option>
                <option value="60">Setelah 1 Jam Inaktif</option>
                <option value="0">Jangan Pernah Logout</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                 <Loader2 size={16} className={loading ? "animate-spin" : "hidden"} />
              </div>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p className="text-xs font-bold text-blue-700 leading-relaxed flex items-start gap-2">
                   <Clock size={14} className="mt-0.5 shrink-0" />
                   Sesi Anda akan otomatis diakhiri jika sistem mendeteksi tidak ada aktivitas dalam durasi yang dipilih. Ini melindungi data Anda saat meninggalkan perangkat.
                </p>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="flex items-center justify-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Terapkan Keamanan
          </button>
        </form>

        <div className="lg:col-span-2 space-y-6">
           <div className="p-6 bg-gray-50/50 rounded-[32px] border border-gray-100 shadow-inner">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History size={14} className="text-blue-600" /> Sesi Terakhir
                 </h4>
                 {fetchingSessions && <Loader2 size={12} className="animate-spin text-gray-400" />}
              </div>
              
              <div className="space-y-5">
                 {sessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.status === 'Online' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                             {session.device.toLowerCase().includes('mobile') ? <Smartphone size={18} /> : <Monitor size={18} />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{session.device}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{session.time}</span>
                                {session.is_current && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                                {session.is_current && <span className="text-[10px] font-black text-blue-600 uppercase">Sekarang</span>}
                             </div>
                          </div>
                       </div>
                       <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${session.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                          {session.status}
                       </span>
                    </div>
                 ))}
                 {!fetchingSessions && sessions.length === 0 && (
                    <p className="text-xs font-bold text-gray-400 text-center py-4 uppercase tracking-widest">Tidak ada data sesi</p>
                 )}
              </div>
           </div>

           <button 
             onClick={handleLogoutOthers}
             className="w-full flex items-center justify-center gap-2 py-4 text-red-600 font-black text-[10px] uppercase tracking-[0.15em] hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 active:scale-95"
           >
              <LogOut size={16} /> Keluar dari Semua Perangkat
           </button>
        </div>
      </div>
    </div>
  );
}
