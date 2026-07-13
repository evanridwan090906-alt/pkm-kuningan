import { useState, useEffect } from 'react';
import api from '../../api';
import { ArrowLeftRight, Plus, Search, Loader2, X, AlertCircle, CheckCircle2, Clock, ChevronRight, FileDown, FileSpreadsheet, Filter, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MAP = {
  dipinjam: { label: 'Dipinjam', classes: 'bg-blue-100 text-blue-700' },
  dikembalikan: { label: 'Dikembalikan', classes: 'bg-emerald-100 text-emerald-700' },
  terlambat: { label: 'Terlambat', classes: 'bg-red-100 text-red-700' },
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState({ pdf: false, excel: false });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { students, loading: studentsLoading } = useStudents();
  const [studentSearch, setStudentSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const dueDateStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    book_id: '', borrower_name: '',
    borrow_date: todayStr,
    return_date: dueDateStr,
    notes: ''
  });

  const location = useLocation();

  useEffect(() => { fetchTransactions(); }, []);
  useEffect(() => { fetchBooks(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qSearch = params.get('search');
    if (qSearch) {
      setSearch(qSearch);
    }
  }, [location.search]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async (type) => {
    setExportLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await api.get(`/export/transactions/${type}`, {
        params: { status: filterStatus },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-transaksi-${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Gagal mengekspor laporan.');
    } finally {
      setExportLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.post('/transactions', form);
      setModalOpen(false);
      fetchTransactions();
      setForm({ book_id: '', borrower_name: '', borrow_date: todayStr, return_date: dueDateStr, notes: '' });
    } catch (err) {
      if (err.response?.status === 422) {
        setError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Konfirmasi pengembalian buku ini?')) return;
    try {
      await api.put(`/transactions/${id}`, {
        status: 'dikembalikan',
        actual_return_date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses pengembalian.');
    }
  };

  // Client-side filter
  const filtered = transactions.filter(trx => {
    const matchSearch = !search ||
      trx.borrower_name?.toLowerCase().includes(search.toLowerCase()) ||
      trx.book?.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || trx.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Sirkulasi Buku</h1>
          <p className="text-sm font-medium text-slate-500">Manajemen peminjaman dan pengembalian koleksi</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
                onClick={() => handleExport('excel')}
                disabled={exportLoading.excel}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                title="Ekspor Excel"
            >
                {exportLoading.excel ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
            </button>
            <button
                onClick={() => handleExport('pdf')}
                disabled={exportLoading.pdf}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                title="Ekspor PDF"
            >
                {exportLoading.pdf ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            </button>
          </div>
          <button
            onClick={() => { setError(''); setModalOpen(true); }}
            className="px-5 py-2.5 bg-[#1d58d8] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Catat Peminjaman
          </button>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <div key={key} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center justify-between hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
            <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{val.label}</p>
                <h3 className="text-3xl font-black text-slate-900">
                    {transactions.filter(t => t.status === key).length}
                </h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${val.classes.replace('border', '').trim()}`}>
                {key === 'dipinjam' ? <Clock size={28} /> : key === 'dikembalikan' ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Card */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" 
            placeholder="Cari nama peminjam atau judul buku..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-[#1d58d8] transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 bg-white transition-all hover:border-slate-300 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer border-none appearance-none pr-4 min-w-[120px]"
            >
                <option value="">Semua Status</option>
                <option value="dipinjam">Dipinjam</option>
                <option value="dikembalikan">Dikembalikan</option>
                <option value="terlambat">Terlambat</option>
            </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden min-h-[400px] flex flex-col relative">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full flex-1 gap-4">
            <Loader2 className="animate-spin text-[#1d58d8]" size={40} />
            <p className="text-sm font-bold text-slate-500">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-20 border-4 border-slate-200 rounded-lg mb-6 flex flex-col relative items-center justify-center">
              <ArrowLeftRight size={24} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Tidak ada data</h3>
            <p className="text-slate-500 font-medium mb-6">Tidak ditemukan peminjaman dengan filter tersebut.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Peminjam</th>
                  <th className="px-6 py-3">Buku</th>
                  <th className="px-6 py-3">Tanggal Pinjam</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                            {trx.borrower_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{trx.borrower_name}</p>
                            <p className="text-xs text-gray-500">TRX-{trx.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">{trx.book?.title}</p>
                      <p className="text-xs text-gray-500">ISBN: {trx.book?.isbn || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">{new Date(trx.borrow_date).toLocaleDateString('id-ID')}</p>
                        <p className="text-xs text-gray-500">Batas: {new Date(trx.return_date).toLocaleDateString('id-ID')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${STATUS_MAP[trx.status]?.classes}`}>
                        {STATUS_MAP[trx.status]?.label || trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {trx.status === 'dipinjam' || trx.status === 'terlambat' ? (
                        <button
                          onClick={() => handleReturn(trx.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Selesai
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Catat Peminjaman</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  <AlertCircle size={16} />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Koleksi Buku</label>
                <div className="relative">
                    <select required value={form.book_id} onChange={e => setForm(f => ({ ...f, book_id: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors appearance-none">
                    <option value="">-- Pilih Buku --</option>
                    {books.filter(b => b.stock > 0).map(b => (
                        <option key={b.id} value={b.id}>{b.title} (Sisa: {b.stock})</option>
                    ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Pilih Siswa (Anggota) *</label>
                <div className="relative">
                  <select 
                    required 
                    value={form.borrower_name} 
                    onChange={e => setForm(f => ({ ...f, borrower_name: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors appearance-none"
                  >
                    <option value="">-- Pilih Nama Siswa --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.nisn})</option>
                    ))}
                  </select>
                  <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Sinkron Realtime dengan Admin</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Tgl Pinjam</label>
                  <input required type="date" value={form.borrow_date} onChange={e => setForm(f => ({ ...f, borrow_date: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Batas Kembali</label>
                  <input required type="date" value={form.return_date} onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Catatan Tambahan</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors resize-none"
                  rows={2} placeholder="Opsional..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2 bg-[#2563EB] text-white hover:bg-blue-700 rounded-lg font-medium text-sm transition-colors flex justify-center items-center gap-2">
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
