import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle2, XCircle, RotateCcw, Clock, BookOpen,
  User, Calendar, AlertTriangle, ChevronLeft, ChevronRight,
  Loader2, Filter, Eye, X, Barcode, Hash, Save, CalendarClock
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const statusConfig = {
  pending:  { label: 'Booking', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved: { label: 'Disetujui', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  borrowed: { label: 'Dipinjam', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  returned: { label: 'Dikembalikan', color: 'bg-green-100 text-green-700 border-green-200' },
  overdue:  { label: 'Terlambat', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  rejected: { label: 'Ditolak', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const StatBadge = ({ label, value, color }) => (
  <div className={`rounded-xl px-4 py-3 border ${color} text-center`}>
    <p className="text-xl font-black">{value}</p>
    <p className="text-xs font-bold mt-0.5 opacity-80">{label}</p>
  </div>
);

const EditDateModal = ({ transaction, onClose, onSave, loading }) => {
  const [newDate, setNewDate] = useState(transaction?.due_date ? transaction.due_date.split('T')[0] : '');
  const [notes, setNotes] = useState('');

  const addDays = (days) => {
    const date = new Date(newDate || transaction?.due_date || new Date());
    date.setDate(date.getDate() + days);
    setNewDate(date.toISOString().split('T')[0]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden">
          
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-900">Edit Tanggal Pengembalian</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <User size={18} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Siswa</p>
                  <p className="font-black text-slate-900 truncate uppercase">{transaction?.user?.name}</p>
                </div>
              </div>
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Buku</p>
                  <p className="font-black text-slate-900 truncate leading-tight">{transaction?.book?.title}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Opsi Perpanjangan</p>
              <div className="grid grid-cols-3 gap-3">
                {[3, 7, 14].map(days => (
                  <button key={days} onClick={() => addDays(days)} className="py-2.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-sm font-bold transition-all text-slate-600">
                    +{days} Hari
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Jatuh Tempo Baru</p>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>

            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Catatan Petugas</p>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contoh: Perpanjangan karena alasan mendesak..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all min-h-[80px] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button onClick={onClose} className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all">
                Batal
              </button>
              <button onClick={() => onSave(newDate, notes)} disabled={loading || !newDate}
                className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function BorrowManagement() {
  const [borrows, setBorrows] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [processing, setProcessing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadBorrows(); }, [page, statusFilter]);

  const loadStats = async () => {
    try {
      const res = await api.get('/borrow/stats');
      setStats(res.data.data);
    } catch {}
  };

  const loadBorrows = async (q = search) => {
    setLoading(true);
    try {
      const params = { page };
      if (q) params.search = q;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/borrow', { params });
      const d = res.data.data;
      if (d.data) {
        setBorrows(d.data);
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      }
    } catch {
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setProcessing(id + action);
    try {
      await api.put(`/borrow/${id}/${action}`);
      const labels = { approve: 'disetujui', reject: 'ditolak', return: 'dikembalikan' };
      toast.success(`Peminjaman berhasil ${labels[action]}`);
      loadBorrows();
      loadStats();
      if (detail?.id === id) setDetail(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses peminjaman');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateDate = async (newDate, notes) => {
    if (!editModal) return;
    setProcessing(editModal.id + 'update');
    try {
      await api.put(`/borrow/${editModal.id}/due-date`, { due_date: newDate, notes });
      toast.success('Tanggal jatuh tempo berhasil diperbarui');
      setEditModal(null);
      loadBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui tanggal');
    } finally {
      setProcessing(null);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const isOverdue = (b) => b.status === 'borrowed' && b.due_date && new Date(b.due_date) < new Date();

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(window._borrowSearchTimer);
    window._borrowSearchTimer = setTimeout(() => { setPage(1); loadBorrows(val); }, 400);
  };

  return (
    <>
      {/* Detail Modal */}
      <AnimatePresence>
        {detail && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetail(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900">Detail Peminjaman</h2>
                <button onClick={() => setDetail(null)} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Peminjam */}
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Peminjam</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <User size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{detail.user?.name}</p>
                      <p className="text-xs text-slate-500">{detail.user?.email}</p>
                      {detail.user?.nim && <p className="text-xs text-blue-500 font-medium">NIM: {detail.user.nim}</p>}
                    </div>
                  </div>
                </div>

                {/* Buku */}
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Buku</p>
                  <p className="font-bold text-slate-900">{detail.book?.title}</p>
                  <p className="text-sm text-slate-500">{detail.book?.author}</p>
                  {detail.book?.rack?.name && (
                    <p className="text-xs text-blue-500 mt-1">📍 Rak: {detail.book.rack.name}</p>
                  )}
                  {detail.book?.barcode && (
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Hash size={10} /> {detail.book.barcode}
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Tgl Pinjam', value: fmt(detail.borrow_date) },
                    { label: 'Jatuh Tempo', value: fmt(detail.due_date) },
                    { label: 'Tgl Kembali', value: fmt(detail.return_date) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${statusConfig[isOverdue(detail) ? 'overdue' : detail.status]?.color}`}>
                      {statusConfig[isOverdue(detail) ? 'overdue' : detail.status]?.label}
                    </span>
                  </div>
                  {detail.petugas_name && (
                    <p className="text-xs text-slate-400">Oleh: <span className="font-medium text-slate-600">{detail.petugas_name}</span></p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {detail.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(detail.id, 'approve')}
                        disabled={!!processing}
                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/20"
                      >
                        {processing === `${detail.id}approve` ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        Konfirmasi Dipinjam
                      </button>
                      <button
                        onClick={() => handleAction(detail.id, 'reject')}
                        disabled={!!processing}
                        className="flex-1 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                      >
                        {processing === `${detail.id}reject` ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                        Tolak
                      </button>
                    </>
                  )}
                  {['borrowed', 'overdue'].includes(detail.status) && (
                    <>
                      <button
                        onClick={() => setEditModal(detail)}
                        className="flex-1 py-4 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <CalendarClock size={18} />
                        Edit Tanggal
                      </button>
                      <button
                        onClick={() => handleAction(detail.id, 'return')}
                        disabled={!!processing}
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        {processing === `${detail.id}return` ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                        Konfirmasi Dikembalikan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Date Modal */}
      {editModal && <EditDateModal transaction={editModal} onClose={() => setEditModal(null)} onSave={handleUpdateDate} loading={processing === `${editModal.id}update`} />}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Peminjaman</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola permintaan dan pengembalian buku fisik</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatBadge label="Total" value={stats.total || 0} color="bg-slate-50 border-slate-200 text-slate-700" />
          <StatBadge label="Menunggu" value={stats.pending || 0} color="bg-amber-50 border-amber-200 text-amber-700" />
          <StatBadge label="Dipinjam" value={stats.borrowed || 0} color="bg-indigo-50 border-indigo-200 text-indigo-700" />
          <StatBadge label="Terlambat" value={stats.overdue || 0} color="bg-red-50 border-red-200 text-red-700" />
          <StatBadge label="Dikembalikan" value={stats.returned || 0} color="bg-green-50 border-green-200 text-green-700" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari nama siswa, NIM, atau judul buku..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 min-w-[150px]"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="borrowed">Dipinjam</option>
            <option value="overdue">Terlambat</option>
            <option value="returned">Dikembalikan</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : borrows.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">Tidak ada data peminjaman</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400">Total: <span className="text-slate-700 font-bold">{meta.total || 0}</span> transaksi</p>
            
            <div className="space-y-3">
              {borrows.map((b, i) => {
                const overdue = isOverdue(b);
                const sc = statusConfig[overdue ? 'overdue' : b.status] || {};
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <User size={20} className="text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900">{b.user?.name}</span>
                            {b.user?.nim && <span className="text-xs text-slate-400">NIM: {b.user.nim}</span>}
                          </div>
                          <p className="text-sm text-blue-700 font-medium truncate">{b.book?.title}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} /> Pinjam: {fmt(b.borrow_date)}
                            </span>
                            <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-bold' : ''}`}>
                              <Clock size={11} /> Jatuh Tempo: {fmt(b.due_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${sc.color}`}>{sc.label}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDetail(b)}
                            className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg font-bold transition-colors"
                          >
                            <Eye size={13} /> Detail
                          </button>
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(b.id, 'approve')}
                                disabled={!!processing}
                                className="flex items-center gap-2 text-xs text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-black disabled:opacity-60 transition-all shadow-md shadow-blue-500/20"
                              >
                                {processing === `${b.id}approve` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                Konfirmasi Dipinjam
                              </button>
                              <button
                                onClick={() => handleAction(b.id, 'reject')}
                                disabled={!!processing}
                                className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-4 py-2 rounded-xl font-black disabled:opacity-60 transition-all"
                              >
                                {processing === `${b.id}reject` ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                Tolak
                              </button>
                            </>
                          )}
                          {['borrowed', 'overdue'].includes(b.status) && (
                            <>
                              <button
                                onClick={() => setEditModal(b)}
                                className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 px-4 py-2 rounded-xl font-black transition-all"
                              >
                                <CalendarClock size={14} />
                                Edit Tanggal
                              </button>
                              <button
                                onClick={() => handleAction(b.id, 'return')}
                                disabled={!!processing}
                                className="flex items-center gap-2 text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl font-black disabled:opacity-60 transition-all shadow-md shadow-emerald-500/20"
                              >
                                {processing === `${b.id}return` ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                                Konfirmasi Dikembalikan
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-bold text-slate-600">{page} / {meta.last_page}</span>
                <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
