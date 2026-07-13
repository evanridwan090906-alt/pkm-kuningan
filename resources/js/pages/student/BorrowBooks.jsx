import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book as BookIcon, Plus, Edit2, Trash2, Search, Loader2, X, AlertCircle, 
  CheckCircle, ChevronLeft, ChevronRight, Barcode, MapPin, Filter, Upload, Image as ImageIcon,
  BookMarked, Hash, Package, BookOpen, Info, Send, Wifi
} from 'lucide-react';
import api from '../../api';
import echo from '../../utils/echo';
import toast from 'react-hot-toast';

const BookStatusBadge = ({ stock, status }) => {
  if (status === 'unavailable' || status === 'missing' || status === 'damaged' || stock <= 0) {
    return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><AlertCircle size={10} /> Dipinjam / Habis</span>;
  }
  return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><CheckCircle size={10} /> Tersedia</span>;
};

const BookSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col animate-pulse">
    <div className="aspect-[3/4] bg-slate-200" />
    <div className="p-4 flex-1 flex flex-col gap-2">
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-2/3" />
      <div className="mt-auto h-8 bg-slate-200 rounded-xl w-full" />
    </div>
  </div>
);

const BorrowModal = ({ book, onClose, onConfirm, loading }) => (
  <AnimatePresence>
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 overflow-hidden">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookMarked className="text-blue-600" size={28} />
        </div>
        <h3 className="text-xl font-black text-slate-900 text-center mb-1">Booking Buku Fisik</h3>
        <p className="text-sm text-slate-500 text-center mb-5">
          Permintaan peminjaman akan dikirim ke petugas perpustakaan.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 flex gap-4 items-center">
          <div className="w-12 h-16 bg-slate-200 rounded-md overflow-hidden shrink-0">
            {book?.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" /> : <BookOpen className="m-auto h-full text-slate-400" size={20} />}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">{book?.title}</p>
            <p className="text-xs text-slate-500 mt-1">{book?.author}</p>
          </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-6">
          <div className="flex items-start gap-2 text-blue-800">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p className="text-xs font-medium">
              Harap ambil buku fisik di <span className="font-bold">{book?.rack?.name || 'Meja Petugas'}</span> maksimal 1x24 jam setelah disetujui.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-500/30">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Booking
          </button>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);

export default function BorrowBooks() {
  const [pulse, setPulse] = useState(false);
  const triggerPulse = () => { setPulse(true); setTimeout(() => setPulse(false), 600); };
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [selected, setSelected] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  const metaRef = useRef(meta);
  useEffect(() => { metaRef.current = meta; }, [meta]);

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => {
    loadBooks();

    const channel = echo.channel('library-channel')
      .listen('.BookCreated', (e) => {
        loadBooks(true);
        toast.success(`Buku baru tersedia: ${e.book.title}`, {
          icon: '✨',
          duration: 4000
        });
      })
      .listen('.BookUpdated', (e) => {
        loadBooks(true);
      });

    return () => {
      channel.stopListening('.BookCreated');
      channel.stopListening('.BookUpdated');
    };
  }, [page, categoryFilter, appliedSearch]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || res.data || []);
    } catch { }
  };

  const loadBooks = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = { page, paginate: true };
      if (appliedSearch) params.search = appliedSearch;
      if (categoryFilter) params.category_id = categoryFilter;

      const res = await api.get('/books/catalog', { params });
      const d = res.data;
      if (d.data?.data) {
        if (silent && metaRef.current.total && d.data.total > metaRef.current.total) {
          toast('Buku baru tersedia di koleksi!', { icon: '✨', duration: 4000 });
        }
        setBooks(d.data.data);
        setMeta({ current_page: d.data.current_page, last_page: d.data.last_page, total: d.data.total });
      } else if (Array.isArray(d.data)) {
        setBooks(d.data);
        setMeta({});
      } else {
        setBooks([]);
      }
    } catch {
      if (!silent) toast.error('Gagal memuat buku');
    } finally {
      if (!silent) setLoading(false);
      if (silent) triggerPulse();
    }
  };

  const handleBorrow = async () => {
    if (!selected) return;
    setBorrowing(true);
    try {
      await api.post('/borrow', { book_id: selected.id });
      toast.success('Permintaan booking berhasil dikirim!');
      setSelected(null);
      loadBooks(true); // silent reload
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setBorrowing(false);
    }
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  return (
    <>
      {selected && <BorrowModal book={selected} onClose={() => setSelected(null)} onConfirm={handleBorrow} loading={borrowing} />}

      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
              Koleksi Buku Fisik
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full transition-all duration-300 ${pulse ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-500'}`}>
                <Wifi size={10} /> {pulse ? 'SYNCING...' : 'LIVE SYNC'}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Cari dan booking buku dari perpustakaan kampus · Realtime update</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari berdasarkan judul, penulis, atau ISBN..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 min-w-[160px] cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#0f172a] hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Search size={16} /> Cari
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            Ditemukan <span className="text-[#0f172a] font-bold">{meta.total || books.length}</span> koleksi
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => <BookSkeleton key={i} />)
          ) : books.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100">
              <BookOpen size={48} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">Buku yang dicari tidak ditemukan.</p>
            </div>
          ) : (
            books.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
              >
                <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"><BookOpen className="text-slate-300" size={32} /></div>
                  )}
                  <div className="absolute top-3 left-3">
                    <BookStatusBadge stock={book.stock} status={book.status} />
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button
                      onClick={() => setSelected(book)}
                      disabled={book.stock <= 0 || book.status !== 'available'}
                      className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all disabled:opacity-50 shadow-xl flex items-center gap-2"
                    >
                      <BookMarked size={16} /> Booking Buku
                    </button>
                    <button
                      className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all delay-75 shadow-xl flex items-center gap-2"
                    >
                      <Info size={16} /> Detail Buku
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1 truncate">{book.category?.name || 'Umum'}</p>
                  <h3 className="font-bold text-[#0f172a] text-sm leading-snug line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-xs text-slate-500 mb-3 truncate">{book.author}</p>

                  <div className="mt-auto space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md w-max">
                      <Hash size={10} /> ID: {book.barcode || 'N/A'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-white bg-slate-50 text-slate-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-slate-600 px-3">{page} / {meta.last_page}</span>
            <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-white bg-slate-50 text-slate-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
