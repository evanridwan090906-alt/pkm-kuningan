import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, Heart, BookMarked, 
  TrendingUp, Download, ArrowRight, Star
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../../api';
import echo from '../../utils/echo';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, delay, to }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
    <Link to={to} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all group block w-full">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${color}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-black text-[#0f172a] tracking-tight leading-none">{value}</h3>
      </div>
    </Link>
  </motion.div>
);

export default function StudentDashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        const res = await api.get('/student/dashboard');
        if (isMounted) setStats(res.data.data);
      } catch (e) {
        console.error("Gagal mengambil data realtime:", e);
      }
    };

    fetchStats(); // Initial fetch
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const channel = echo.channel('library-channel')
      .listen('.LibraryDataUpdated', (e) => {
        if (e.type === 'ebook' || e.type === 'book') {
          // Refresh dashboard stats when library data changes
          const fetchStats = async () => {
            try {
              const res = await api.get('/student/dashboard');
              setStats(res.data.data);
            } catch {}
          };
          fetchStats();
          if (e.type === 'ebook' && !e.data?.deleted) {
             toast('Ada buku digital baru! Cek sekarang.', { icon: '✨' });
          } else if (e.type === 'book' && !e.data?.deleted) {
             toast('Koleksi buku fisik bertambah! Cek di perpustakaan.', { icon: '📚' });
          }
        }
      })
      .listen('.ReturnDateUpdated', (e) => {
         toast.success(e.message || 'Tanggal pengembalian buku diperbarui', { icon: '📅' });
      })
      .listen('.BorrowUpdated', (e) => {
         toast.success(e.message, { icon: '✅' });
      })
      .listen('.BorrowReturned', (e) => {
         toast.success(e.message, { icon: '📚' });
      })
      .listen('.BookCreated', (e) => {
         // Refresh dashboard stats
         const fetchStats = async () => {
           try {
             const res = await api.get('/student/dashboard');
             setStats(res.data.data);
           } catch {}
         };
         fetchStats();
         toast.success(`Buku baru tersedia: ${e.book.title}`, { icon: '📚' });
      })
      .listen('.BookUpdated', (e) => {
         // Just refresh stats
         const fetchStats = async () => {
           try {
             const res = await api.get('/student/dashboard');
             setStats(res.data.data);
           } catch {}
         };
         fetchStats();
      });

    return () => {
      channel.stopListening('.LibraryDataUpdated');
      channel.stopListening('.ReturnDateUpdated');
      channel.stopListening('.BorrowUpdated');
      channel.stopListening('.BorrowReturned');
      channel.stopListening('.BookCreated');
      channel.stopListening('.BookUpdated');
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="bg-slate-200/50 animate-pulse h-28 rounded-3xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
        className="bg-[#0f172a] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-slate-900/10"
      >
        <div className="relative z-20 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Selamat Datang, <span className="text-blue-400">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-300 text-lg font-medium leading-relaxed mb-8 max-w-xl">
            Tingkatkan literasi dan pengetahuanmu. Jelajahi ribuan literatur akademik, pinjam buku fisik, atau akses e-book langsung dari sini.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <Link to="/siswa/ebooks" className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2 transform active:scale-95">
              <BookOpen size={18} /> Baca E-Book
            </Link>
            <Link to="/siswa/borrow" className="px-6 py-3.5 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-black/5 transform active:scale-95">
              <BookMarked size={18} /> Pinjam Buku
            </Link>
          </div>
        </div>

        {/* Decorations */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent z-10" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl z-0" />
        <div className="absolute -top-32 right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl z-0" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0.1} icon={BookMarked} label="Sedang Dipinjam" value={stats.borrow_stats.borrowed} color="bg-blue-50 text-blue-600" to="/siswa/my-history" />
        <StatCard delay={0.2} icon={Clock} label="Menunggu Acc" value={stats.borrow_stats.pending} color="bg-amber-50 text-amber-600" to="/siswa/my-history" />
        <StatCard delay={0.3} icon={BookOpen} label="E-Book Dibaca" value={stats.ebook_stats.reads} color="bg-emerald-50 text-emerald-600" to="/siswa/ebooks" />
        <StatCard delay={0.4} icon={Download} label="E-Book Diunduh" value={stats.ebook_stats.downloads} color="bg-purple-50 text-purple-600" to="/siswa/ebooks" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent E-Books */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" /> E-Book Terakhir Diakses
            </h3>
            <Link to="/siswa/ebooks" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">Lihat Semua <ArrowRight size={16} /></Link>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            {stats.recent_ebooks.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium text-sm">Belum ada aktivitas membaca e-book.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {stats.recent_ebooks.map((item, i) => (
                  <Link to="/siswa/ebooks" key={i} className="block p-4 sm:p-5 flex gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
                      {item.ebook?.cover_url ? (
                        <img src={item.ebook.cover_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen size={20} className="text-slate-300"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{item.ebook?.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.ebook?.author}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-600 uppercase">
                          {item.action === 'read' ? 'Membaca' : 'Mengunduh'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Physical Borrows */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookMarked size={20} className="text-amber-600" /> Peminjaman Fisik Aktif
            </h3>
            <Link to="/siswa/my-history" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">Ke Riwayat <ArrowRight size={16} /></Link>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            {stats.recent_borrows.length === 0 ? (
              <div className="p-8 text-center">
                <BookMarked size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium text-sm">Tidak ada transaksi peminjaman fisik terbaru.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {stats.recent_borrows.slice(0, 4).map((item, i) => (
                  <Link to="/siswa/my-history" key={i} className="block p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="w-14 h-18 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
                      {item.book?.cover_url ? (
                        <img src={item.book.cover_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookMarked size={18} className="text-slate-300"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{item.book?.title}</h4>
                      <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">{item.book?.barcode || '-'}</p>
                      <div className="mt-2">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Reused StatusBadge component
const StatusBadge = ({ status }) => {
  switch (status) {
    case 'pending': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Menunggu Acc</span>;
    case 'borrowed': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Dipinjam</span>;
    case 'overdue': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Terlambat</span>;
    case 'returned': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Dikembalikan</span>;
    case 'rejected': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Ditolak</span>;
    default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
  }
};
