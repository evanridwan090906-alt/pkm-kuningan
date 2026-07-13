import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, BookOpen, Search, X, Upload, Loader2,
  Eye, EyeOff, Download, ChevronLeft, ChevronRight, FileText,
  Star, AlertTriangle, CheckCircle2, ToggleLeft, ToggleRight,
  Link as LinkIcon, Globe, Sparkles
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', author: '', publisher: '', year: '', isbn: '',
  description: '', access: 'member', category_id: '', is_active: true,
  cover: null, file: null, source_url: '', external_file_url: '', cover_url: '',
};

export default function EbookManagement() {
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchQuery, setFetchQuery] = useState('');
  const searchRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadEbooks(); }, [page]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || res.data || []);
    } catch {}
  };

  const loadEbooks = async (q = search) => {
    setLoading(true);
    try {
      const params = { page };
      if (q) params.search = q;
      const res = await api.get('/ebooks', { params });
      const d = res.data.data;
      setEbooks(d.data || []);
      setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    } catch {
      toast.error('Gagal memuat data e-book');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setCoverPreview(null);
    setFetchQuery('');
    setShowModal(true);
  };

  const openEdit = (ebook) => {
    setEditing(ebook);
    setForm({
      title: ebook.title || '',
      author: ebook.author || '',
      publisher: ebook.publisher || '',
      year: ebook.year || '',
      isbn: ebook.isbn || '',
      description: ebook.description || '',
      access: ebook.access || 'member',
      category_id: ebook.category_id || '',
      is_active: ebook.is_active ?? true,
      source_url: ebook.source_url || '',
      external_file_url: ebook.external_file_url || '',
      cover: null,
      file: null,
    });
    setCoverPreview(ebook.cover_url || null);
    setFetchQuery('');
    setShowModal(true);
  };

  const fetchBookData = async () => {
    if (!fetchQuery) return toast.error('Masukkan Link / ISBN terlebih dahulu');
    setFetchLoading(true);
    try {
      const res = await api.post('/ebooks/import-link', { url: fetchQuery });
      const { data } = res.data;
      
      if (data) {
        setForm(f => ({
          ...f,
          title: data.title || f.title,
          author: data.author || f.author,
          publisher: data.publisher || f.publisher,
          year: data.year || f.year,
          isbn: data.isbn || f.isbn,
          description: data.description || f.description,
          source_url: fetchQuery,
          external_file_url: data.file_url || f.external_file_url,
          cover_url: data.cover || f.cover_url
        }));
        
        if (data.cover) {
            setCoverPreview(data.cover);
            // We don't download the cover to the server yet, 
            // just show it. If it's a URL, the backend will need to handle it.
            // Actually, my backend store method expects a file. 
            // I should modify it to handle cover_url too.
        }
        toast.success('Metadata berhasil diambil!');
      }
    } catch (err) {
      toast.error('Gagal mengambil metadata. Pastikan link valid.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleFileChange = (field, file) => {
    setForm(f => ({ ...f, [field]: file }));
    if (field === 'cover' && file) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (field, e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(field, e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.author) return toast.error('Judul dan penulis wajib diisi');
    if (!editing && !form.file && !form.external_file_url) return toast.error('File PDF/Epub wajib diunggah atau berikan Link PDF langsung');

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          fd.append(k, k === 'is_active' ? (v ? '1' : '0') : v);
        }
      });

      if (editing) {
        await api.post(`/ebooks/${editing.id}/update`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('E-book berhasil diperbarui');
      } else {
        await api.post('/ebooks', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('E-book berhasil ditambahkan');
      }

      setShowModal(false);
      setPage(1);
      loadEbooks();
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) {
        toast.error(Object.values(errs).flat().join(', '));
      } else {
        toast.error(err.response?.data?.message || 'Gagal menyimpan e-book');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/ebooks/${confirmDelete.id}`);
      toast.success('E-book berhasil dihapus');
      setConfirmDelete(null);
      loadEbooks();
    } catch {
      toast.error('Gagal menghapus e-book');
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setPage(1); loadEbooks(val); }, 400);
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white";

  return (
    <>
      {/* Ebook Form Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900">
                  {editing ? 'Edit E-Book' : 'Tambah E-Book Baru'}
                </h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Auto Fetch Section */}
                {!editing && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Search size={14} /> Auto-Isi Data Buku
                      </label>
                      <input 
                        value={fetchQuery} 
                        onChange={e => setFetchQuery(e.target.value)} 
                        placeholder="Masukkan Link Google Books atau ISBN..." 
                        className="w-full px-4 py-2.5 border border-blue-200 bg-white rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={fetchBookData}
                      disabled={fetchLoading}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
                    >
                      {fetchLoading ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                      {fetchLoading ? 'Mencari...' : 'Ambil Data'}
                    </button>
                  </div>
                )}

                {/* Cover + File Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cover */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Cover Buku</label>
                    <label className="relative block cursor-pointer" onDragOver={handleDragOver} onDrop={(e) => handleDrop('cover', e)}>
                      <div className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${coverPreview ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-slate-50'}`}>
                        {coverPreview ? (
                          <img src={coverPreview} alt="Cover" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <>
                            <Upload size={24} className="text-slate-400 mb-2" />
                            <p className="text-xs text-slate-400 font-medium">Klik / Drag & Drop cover</p>
                            <p className="text-[10px] text-slate-300 mt-1">JPG, PNG, WebP</p>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('cover', e.target.files[0])} />
                    </label>
                  </div>

                  {/* PDF File */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                      File PDF/Epub {!editing && <span className="text-red-500">*</span>}
                    </label>
                    <label className="relative block cursor-pointer" onDragOver={handleDragOver} onDrop={(e) => handleDrop('file', e)}>
                      <div className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${form.file ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-green-300 bg-slate-50'}`}>
                        {form.file ? (
                          <>
                            <FileText size={24} className="text-green-500 mb-2" />
                            <p className="text-xs text-green-700 font-bold text-center px-2 truncate max-w-full">{form.file.name}</p>
                            <p className="text-[10px] text-green-500 mt-1">{(form.file.size / 1024 / 1024).toFixed(1)} MB</p>
                          </>
                        ) : (
                          <>
                            <Upload size={24} className="text-slate-400 mb-2" />
                            <p className="text-xs text-slate-400 font-medium">Klik / Drag & Drop PDF/Epub</p>
                            <p className="text-[10px] text-slate-300 mt-1">Maks. 50MB</p>
                          </>
                        )}
                      </div>
                      <input type="file" accept=".pdf,.epub" className="hidden" onChange={(e) => handleFileChange('file', e.target.files[0])} />
                    </label>
                    {editing && <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika tidak ingin mengganti file</p>}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <LinkIcon size={16} />
                    <span className="text-xs font-bold uppercase tracking-wide">Opsi Link Eksternal</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Link Sumber (Source URL)</label>
                    <input value={form.source_url} onChange={e => setForm(f => ({...f, source_url: e.target.value}))} placeholder="https://books.google.com/..." className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Link File PDF Langsung (Direct PDF URL)</label>
                    <input value={form.external_file_url} onChange={e => setForm(f => ({...f, external_file_url: e.target.value}))} placeholder="https://example.com/book.pdf" className={inputClass} />
                    <p className="text-[10px] text-slate-400 mt-1">Jika diisi, tombol baca akan langsung membuka link ini.</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Judul *</label>
                    <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Judul buku" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Penulis *</label>
                    <input value={form.author} onChange={e => setForm(f => ({...f, author: e.target.value}))} placeholder="Nama penulis" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Penerbit</label>
                    <input value={form.publisher} onChange={e => setForm(f => ({...f, publisher: e.target.value}))} placeholder="Nama penerbit" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Tahun</label>
                    <input type="number" value={form.year} onChange={e => setForm(f => ({...f, year: e.target.value}))} placeholder="2024" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">ISBN</label>
                    <input value={form.isbn} onChange={e => setForm(f => ({...f, isbn: e.target.value}))} placeholder="ISBN" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Kategori</label>
                    <select value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))} className={inputClass}>
                      <option value="">Pilih kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Deskripsi</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    rows={3}
                    placeholder="Deskripsi singkat buku..."
                    className={inputClass + ' resize-none'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Akses</label>
                    <select value={form.access} onChange={e => setForm(f => ({...f, access: e.target.value}))} className={inputClass}>
                      <option value="public">Publik (semua orang)</option>
                      <option value="member">Anggota saja</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Status</label>
                    <select value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f => ({...f, is_active: e.target.value === 'active'}))} className={inputClass}>
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">Batal</button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Hapus E-Book?</h3>
              <p className="text-sm text-slate-500 mb-6">
                "<span className="font-bold text-slate-700">{confirmDelete.title}</span>" akan dihapus permanen beserta filenya.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDelete(null)} className="py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-sm">Batal</button>
                <button onClick={handleDelete} disabled={deleting} className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen E-Book</h1>
            <p className="text-sm text-slate-500 mt-1">Upload dan kelola koleksi buku digital</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={18} /> Tambah E-Book
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari judul atau penulis..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Belum ada e-book. Tambahkan yang pertama!</p>
            <button onClick={openCreate} className="mt-4 text-blue-600 font-bold text-sm hover:underline">+ Tambah E-Book</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 font-medium">Total: <span className="text-slate-700 font-bold">{meta.total || 0}</span> e-book</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {ebooks.map((ebook, i) => (
                <motion.div
                  key={ebook.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                >
                  {/* Cover */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100">
                    {ebook.cover_url ? (
                      <img src={ebook.cover_url} alt={ebook.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={36} className="text-blue-200" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ebook.access === 'public' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {ebook.access === 'public' ? '🌐 Publik' : '🔒 Anggota'}
                      </span>
                      {!ebook.is_active && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">Nonaktif</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide mb-1">{ebook.category?.name || '-'}</p>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">{ebook.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{ebook.author}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1"><Eye size={11} /> {ebook.read_count}</span>
                      <span className="flex items-center gap-1"><Download size={11} /> {ebook.download_count}</span>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => openEdit(ebook)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(ebook)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
