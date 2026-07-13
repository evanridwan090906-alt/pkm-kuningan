import { History, ArrowRight, Inbox } from 'lucide-react';
import ActivityItem from './ActivityItem';

export default function ArchiveActivityCard({ activities = [] }) {
  const mapActivity = (archive) => {
    const dateObj = new Date(archive.created_at);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    // Mapping types
    const typeMap = {
      'restock': 'masuk',
      'rusak': 'keluar',
      'hilang': 'keluar',
      'pindah': 'pindah'
    };

    return {
      date: dateObj.getDate().toString(),
      month: months[dateObj.getMonth()],
      type: typeMap[archive.type] || 'update',
      title: archive.book ? archive.book.title : 'Data Buku Dihapus',
      qty: archive.type === 'restock' ? `+${archive.qty}` : `-${archive.qty}`,
      location: archive.description || (archive.book ? `Rak ${archive.book.rack_id || '-'}` : 'Database'),
      time: dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };
  };

  const activityList = activities.map(mapActivity);

  return (
    <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-[32px] shadow-2xl shadow-blue-900/20 text-white flex flex-col relative overflow-hidden h-full border border-white/10">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

      {/* Header */}
      <div className="p-8 pb-4 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <History size={20} className="text-blue-100" />
            </div>
            <div>
                <h3 className="text-lg font-black tracking-tight leading-none">Aktivitas & Arsip</h3>
                <p className="text-[10px] font-bold text-blue-200/60 uppercase tracking-[0.2em] mt-1">Real-time Activity</p>
            </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 px-6 pb-4 overflow-y-auto custom-scrollbar relative z-10 space-y-2 max-h-[420px]">
        {activityList.length > 0 ? (
          activityList.map((activity, index) => (
            <ActivityItem key={index} item={activity} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
            <Inbox size={48} className="mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Belum ada aktivitas</p>
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="p-6 pt-0 relative z-10 mt-auto">
        <button className="w-full py-4 bg-white text-[#1E3A8A] rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group active:scale-95">
          Lihat Riwayat Lengkap
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
