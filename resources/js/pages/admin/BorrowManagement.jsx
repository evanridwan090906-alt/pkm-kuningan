import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle2, XCircle, RotateCcw, Clock, BookOpen,
  User, Calendar, AlertTriangle, ChevronLeft, ChevronRight,
  Loader2, Filter, Eye, X, Barcode, Hash, CalendarClock, History, Save
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const statusConfig = {
  pending:  { label: 'Booking', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  approved: { label: 'Disetujui', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  borrowed: { label: 'Dipinjam', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  returned: { label: 'Dikembalikan', color: 'bg-green-100 text-green-700 border-green-200' },
  overdue:  { label: 'Terlambat', color: 'bg-red-100 text-red-700 border-red-200' },
  rejected: { label: 'Ditolak', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const StatBadge = ({ label, value, color }) => (
  <div className={`rounded-xl px-4 py-3 border ${color} text-center`}>
    <p className="text-xl font-black">{value}</p>
    <p className="text-xs font-bold mt-0.5 opacity-80">{label}</p>
  </div>
);

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
  const [editDate, setEditDate] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { 
    loadStats(); 
    api.get('/borrow/overdue-check').catch(() => {});
  }, []);
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

  const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const isOverdue = (b) => b.status === 'borrowed' && b.due_date && new Date(b.due_date) < new Date();

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(window._borrowSearchTimer);
    window._borrowSearchTimer = setTimeout(() => { setPage(1); loadBorrows(val); }, 400);
  };

  const openEditDate = (b) => {
    setEditDate(b);
    setNewDueDate(b.due_date ? new Date(b.due_date).toISOString().split('T')[0] : '');
    setAdminNotes(b.notes || '');
  };

  const extendDays = (days) => {
    const current = editDate.due_date ? new Date(editDate.due_date) : new Date();
    current.setDate(current.getDate() + days);
    setNewDueDate(current.toISOString().split('T')[0]);
  };

  const handleUpdateDate = async () => {
    setProcessing(editDate.id + 'date');
    try {
      await api.put(`/borrow/${editDate.id}/due-date`, { 
        due_date: newDueDate,
        notes: adminNotes 
      });
      toast.success('Tanggal jatuh tempo berhasil diperbarui');
      setEditDate(null);
      loadBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui tanggal');
    } finally {
      setProcessing(null);
    }
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
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                      >
                        {processing === `${detail.id}approve` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        Setujui
                      </button>
                      <button
                        onClick={() => handleAction(detail.id, 'reject')}
                        disabled={!!processing}
                        className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                      >
                        {processing === `${detail.id}reject` ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        Tolak
                      </button>
                    </>
                  )}
                  {['borrowed', 'overdue'].includes(detail.status) && (
                    <button
                      onClick={() => handleAction(detail.id, 'return')}
                      disabled={!!processing}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                    >
                      {processing === `${detail.id}return` ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                      Konfirmasi Pengembalian
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Date Modal */}
      <AnimatePresence>
        {editDate && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditDate(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarClock className="text-blue-600" size={20} />
                  <h2 className="text-lg font-black text-slate-900">Edit Tanggal Pengembalian</h2>
                </div>
                <button onClick={() => setEditDate(null)} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Siswa</p>
                      <p className="text-sm font-bold text-slate-800">{editDate.user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <BookOpen size={14} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Buku</p>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{editDate.book?.title}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
                    <span>Opsi Perpanjangan</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => extendDays(3)} className="py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl text-xs font-bold text-slate-600 transition-all">
                      +3 Hari
                    </button>
                    <button onClick={() => extendDays(7)} className="py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl text-xs font-bold text-slate-600 transition-all">
                      +7 Hari
                    </button>
                    <button onClick={() => extendDays(14)} className="py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl text-xs font-bold text-slate-600 transition-all">
                      +14 Hari
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Jatuh Tempo Baru</label>
                      <input 
                        type="date" 
                        value={newDueDate} 
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Catatan Petugas</label>
                      <textarea 
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Contoh: Perpanjangan karena alasan mendesak..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditDate(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors">
                    Batal
                  </button>
                  <button 
                    onClick={handleUpdateDate}
                    disabled={!!processing || !newDueDate}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {processing === `${editDate.id}date` ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                          {['borrowed', 'overdue'].includes(b.status) && (
                            <button
                              onClick={() => openEditDate(b)}
                              className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg font-bold transition-colors"
                            >
                              <CalendarClock size={13} /> Edit Tanggal
                            </button>
                          )}
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(b.id, 'confirm')}
                                disabled={!!processing}
                                className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg font-bold disabled:opacity-60 transition-colors shadow-sm"
                              >
                                {processing === `${b.id}confirm` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                Konfirmasi Dipinjam
                              </button>
                              <button
                                onClick={() => handleAction(b.id, 'reject')}
                                disabled={!!processing}
                                className="flex items-center gap-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg font-bold disabled:opacity-60 transition-colors"
                              >
                                {processing === `${b.id}reject` ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                                Tolak
                              </button>
                            </>
                          )}
                          {['borrowed', 'overdue'].includes(b.status) && (
                            <button
                              onClick={() => handleAction(b.id, 'return')}
                              disabled={!!processing}
                              className="flex items-center gap-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg font-bold disabled:opacity-60 transition-colors shadow-sm"
                            >
                              {processing === `${b.id}return` ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={13} />}
                              Konfirmasi Dikembalikan
                            </button>
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
