import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, BookOpen, Download, X, ChevronLeft,
  ChevronRight, Loader2, Star, Eye, FileText, ExternalLink, Tag, Wifi
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import echo from '../../utils/echo';

const EbookSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col animate-pulse">
    <div className="aspect-[3/4] bg-slate-200" />
    <div className="p-4 flex-1 flex flex-col gap-2">
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-2/3" />
      <div className="mt-auto flex gap-2 pt-2">
        <div className="h-8 bg-slate-200 rounded-xl flex-1" />
        <div className="h-8 bg-slate-200 rounded-xl flex-1" />
      </div>
    </div>
  </div>
);

const EbookCard = ({ ebook, onRead, onDownload }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
  >
    {/* Cover */}
    <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
      {ebook.cover_url ? (
        <img
          src={ebook.cover_url}
          alt={ebook.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300 p-4 bg-gradient-to-br from-slate-100 to-slate-200">
          <BookOpen size={40} />
        </div>
      )}
      {/* Access badge */}
      <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
        ebook.access === 'public' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
      }`}>
        {ebook.access === 'public' ? 'Publik' : 'Anggota'}
      </div>
    </div>

    {/* Info */}
    <div className="p-4 flex-1 flex flex-col">
      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1 truncate">
        {ebook.category?.name || 'Umum'}
      </p>
      <h3 className="font-bold text-[#0f172a] text-sm leading-snug line-clamp-2 mb-1">
        {ebook.title}
      </h3>
      <p className="text-xs text-slate-500 mb-3 truncate">{ebook.author}</p>
      
      <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 mb-4 mt-auto">
        <span className="flex items-center gap-1"><Eye size={12} /> {ebook.read_count}</span>
        <span className="flex items-center gap-1"><Download size={12} /> {ebook.download_count}</span>
      </div>

      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onRead(ebook)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-md shadow-slate-900/10"
        >
          <BookOpen size={13} /> Baca
        </button>
        <button
          onClick={() => onDownload(ebook)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl transition-colors"
        >
          <Download size={13} /> Unduh
        </button>
      </div>
    </div>
  </motion.div>
);

const PdfViewer = ({ ebook, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-slate-900/95 flex flex-col backdrop-blur-sm"
    >
      {/* Viewer Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0f172a] text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm md:text-base truncate tracking-tight">{ebook.title}</p>
            <p className="text-xs text-blue-300 font-medium">{ebook.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={ebook.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <ExternalLink size={14} /> Fullscreen (Tab Baru)
          </a>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      {/* PDF Iframe */}
      <div className="flex-1 overflow-hidden bg-slate-800">
        <iframe
          src={ebook.file_url + '#toolbar=1&navpanes=1'}
          className="w-full h-full border-0"
          title={ebook.title}
        />
      </div>
    </motion.div>
  </AnimatePresence>
);

export default function Ebooks() {
  const [pulse, setPulse] = useState(false);
  const triggerPulse = () => { setPulse(true); setTimeout(() => setPulse(false), 600); };
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [accessFilter, setAccessFilter] = useState('');
  const [reading, setReading] = useState(null);
  const searchTimeout = useRef(null);

  const metaRef = useRef(meta);
  useEffect(() => { metaRef.current = meta; }, [meta]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadEbooks();

    // Realtime Polling System (setiap 4 detik)
    const interval = setInterval(() => {
      if (isMounted) loadEbooks(true);
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [page, categoryFilter, accessFilter, appliedSearch]);

  useEffect(() => {
    const channel = echo.channel('library-channel')
      .listen('.LibraryDataUpdated', (e) => {
        if (e.type === 'ebook') {
          loadEbooks(true);
          if (!e.data?.deleted) {
            toast('E-book baru ditambahkan: ' + e.data.title, { icon: '📚' });
          }
        }
      });

    return () => channel.stopListening('.LibraryDataUpdated');
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || res.data || []);
    } catch {}
  };

  const loadEbooks = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = { page };
      if (appliedSearch) params.search = appliedSearch;
      if (categoryFilter) params.category_id = categoryFilter;
      if (accessFilter) params.access = accessFilter;

      const res = await api.get('/ebooks', { params });
      const d = res.data.data;
      
      if (silent && metaRef.current.total && d.total > metaRef.current.total) {
        toast('Buku digital baru tersedia!', { icon: '✨', duration: 4000 });
      }

      setEbooks(d.data || []);
      setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    } catch (err) {
      if (!silent) toast.error('Gagal memuat e-book');
    } finally {
      if (!silent) setLoading(false);
      if (silent) triggerPulse();
    }
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setAppliedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleRead = async (ebook) => {
    try {
      await api.get(`/ebooks/${ebook.id}`); // track read
      setReading(ebook);
    } catch {
      setReading(ebook);
    }
  };

  const handleDownload = async (ebook) => {
    try {
      const res = await api.post(`/ebooks/${ebook.id}/download`);
      const url = res.data.file_url;
      const link = document.createElement('a');
      link.href = url;
      link.download = ebook.title + '.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download dimulai!');
    } catch {
      toast.error('Gagal mengunduh e-book');
    }
  };

  return (
    <>
      {reading && <PdfViewer ebook={reading} onClose={() => setReading(null)} />}

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
            Koleksi E-Book
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full transition-all duration-300 ${pulse ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-500'}`}>
                <Wifi size={10} /> {pulse ? 'SYNCING...' : 'LIVE SYNC'}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Akses dan baca ribuan literatur digital secara instan · Sinkronisasi Otomatis</p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari judul e-book, penulis..."
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
          <select
            value={accessFilter}
            onChange={(e) => { setAccessFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 min-w-[150px] cursor-pointer"
          >
            <option value="">Semua Akses</option>
            <option value="public">Publik</option>
            <option value="member">Anggota</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            Ditemukan <span className="text-[#0f172a] font-bold">{meta.total || ebooks.length}</span> koleksi digital
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {loading ? (
             Array.from({length: 10}).map((_, i) => <EbookSkeleton key={i} />)
          ) : ebooks.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100">
              <BookOpen size={48} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">E-book tidak ditemukan.</p>
            </div>
          ) : (
            ebooks.map((ebook) => (
              <EbookCard
                key={ebook.id}
                ebook={ebook}
                onRead={handleRead}
                onDownload={handleDownload}
              />
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
