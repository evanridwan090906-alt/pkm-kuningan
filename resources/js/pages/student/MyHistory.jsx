import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, BookMarked, Download, BookOpen, Calendar,
  ChevronLeft, ChevronRight, Loader2, ArrowLeft, CalendarClock
} from 'lucide-react';
import echo from '../../utils/echo';
import toast from 'react-hot-toast';
import api from '../../api';

const statusConfig = {
  pending:  { label: 'Menunggu', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  approved: { label: 'Disetujui', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  borrowed: { label: 'Dipinjam', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  returned: { label: 'Dikembalikan', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  overdue:  { label: 'Terlambat', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  rejected: { label: 'Ditolak', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

const Tab = ({ id, label, icon: Icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
    }`}
  >
    <Icon size={16} /> {label}
  </button>
);

export default function MyHistory() {
  const [activeTab, setActiveTab] = useState('borrows');
  const [borrowData, setBorrowData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [ebookData, setEbookData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [borrowPage, setBorrowPage] = useState(1);
  const [ebookPage, setEbookPage] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [borrowPage, ebookPage]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/history', {
        params: { borrow_page: borrowPage, ebook_page: ebookPage }
      });
      const d = res.data.data;
      setBorrowData(d.borrows);
      setEbookData(d.ebooks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const channel = echo.channel('library-channel')
      .listen('.BorrowUpdated', (e) => {
        loadHistory();
        toast.success(e.message, { icon: '✅' });
      })
      .listen('.DueDateUpdated', (e) => {
        loadHistory();
        toast.success(e.message, { icon: '📅' });
      })
      .listen('.BorrowReturned', (e) => {
        loadHistory();
        toast.success(e.message, { icon: '📚' });
      });

    return () => {
      channel.stopListening('.BorrowUpdated');
      channel.stopListening('.DueDateUpdated');
      channel.stopListening('.BorrowReturned');
    };
  }, []);

  const fmt = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isOverdue = (b) => {
    if (b.status === 'borrowed' && b.due_date) {
      return new Date(b.due_date) < new Date();
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Riwayat Aktivitas</h1>
        <p className="text-sm text-slate-500 mt-1">Riwayat peminjaman dan aktivitas e-book Anda</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        <Tab id="borrows"  label={`Peminjaman Buku (${borrowData.total})`} icon={BookMarked} active={activeTab === 'borrows'}  onClick={setActiveTab} />
        <Tab id="ebooks"   label={`Aktivitas E-Book (${ebookData.total})`} icon={BookOpen}   active={activeTab === 'ebooks'}   onClick={setActiveTab} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Borrows Tab */}
          {activeTab === 'borrows' && (
            <div className="space-y-3">
              {borrowData.data.length === 0 ? (
                <div className="text-center py-20">
                  <BookMarked size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 font-medium">Belum ada riwayat peminjaman</p>
                </div>
              ) : (
                borrowData.data.map((b, i) => {
                  const sc = statusConfig[isOverdue(b) ? 'overdue' : b.status] || {};
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                            <BookOpen size={20} className="text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 leading-tight truncate">{b.book?.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{b.book?.author}</p>
                            {b.book?.rack?.name && (
                              <p className="text-xs text-blue-500 mt-1">📍 Rak: {b.book.rack.name}</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {[
                          { label: 'Tanggal Pinjam', value: fmt(b.borrow_date) },
                          { label: 'Jatuh Tempo', value: fmt(b.due_date) },
                          { label: 'Tanggal Kembali', value: fmt(b.return_date) },
                          { label: 'Diproses Oleh', value: b.petugas_name || '-' },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">{label}</p>
                            <p className="text-sm font-bold text-slate-800">{value}</p>
                          </div>
                        ))}
                      </div>

                      {b.notes && (
                        <p className="text-xs text-slate-500 mt-3 bg-slate-50 rounded-xl px-3 py-2">
                          📝 {b.notes}
                        </p>
                      )}
                    </motion.div>
                  );
                })
              )}

              {/* Pagination */}
              {borrowData.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button disabled={borrowPage <= 1} onClick={() => setBorrowPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-bold text-slate-600">{borrowPage} / {borrowData.last_page}</span>
                  <button disabled={borrowPage >= borrowData.last_page} onClick={() => setBorrowPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* E-Books Tab */}
          {activeTab === 'ebooks' && (
            <div className="space-y-3">
              {ebookData.data.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 font-medium">Belum ada aktivitas e-book</p>
                </div>
              ) : (
                ebookData.data.map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      e.action === 'download' ? 'bg-purple-50' : 'bg-blue-50'
                    }`}>
                      {e.action === 'download'
                        ? <Download size={20} className="text-purple-500" />
                        : <BookOpen size={20} className="text-blue-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 leading-tight truncate">{e.ebook?.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{e.ebook?.author}</p>
                      {e.ebook?.category?.name && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                          {e.ebook.category.name}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        e.action === 'download' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {e.action === 'download' ? '⬇ Download' : '👁 Baca'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        <Calendar size={10} className="inline mr-0.5" />
                        {new Date(e.downloaded_at || e.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}

              {ebookData.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button disabled={ebookPage <= 1} onClick={() => setEbookPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-bold text-slate-600">{ebookPage} / {ebookData.last_page}</span>
                  <button disabled={ebookPage >= ebookData.last_page} onClick={() => setEbookPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
