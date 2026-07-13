import { useState, useEffect } from 'react';
import api from '../../api';
import { 
  Book as BookIcon, Plus, Edit2, Trash2, Search, Loader2, X, AlertCircle, 
  ChevronRight, Barcode, MapPin, Filter, Upload, Image 
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Books() {
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRack, setFilterRack] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', barcode: '', category_id: '', rack_id: '', publisher: '',
    year: '', stock: 1, cover_image: null, status: 'available', description: '',
    ebook_file: null, ebook_link: ''
  });
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [search, filterRack, filterCategory]);

  useEffect(() => {
    fetchCategories();
    fetchRacks();
    
    // Check if redirected from StockIn via navigate with state
    if (location.state?.openModal) {
      openModal();
      if (location.state.barcode) {
        setForm(f => ({ ...f, barcode: location.state.barcode }));
      }
    }
    
    // Support for query params (search, id, new_isbn)
    const params = new URLSearchParams(location.search);
    const qSearch = params.get('search');
    const qId = params.get('id');
    const newIsbn = params.get('new_isbn');

    if (qSearch) {
      setSearch(qSearch);
    }

    if (newIsbn) {
      setForm(f => ({ ...f, isbn: newIsbn }));
      setModalOpen(true);
    }
  }, [location.search, location.state]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', {
        params: {
          search: search,
          rack_id: filterRack,
          category_id: filterCategory
        }
      });
      setBooks(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRacks = async () => {
    try {
      const res = await api.get('/racks');
      setRacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (book = null) => {
    setEditingBook(book);
    if (book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        barcode: book.barcode || '',
        category_id: book.category_id || '',
        rack_id: book.rack_id || '',
        publisher: book.publisher || '',
        year: book.year || '',
        stock: book.stock ?? 1,
        status: book.status || 'available',
        description: book.description || '',
        ebook_link: book.ebook_link || '',
        cover_image: null,
        ebook_file: null,
      });
      setCoverPreview(book.cover_url || null);
    } else {
      setForm({ 
        title: '', author: '', isbn: '', barcode: '', category_id: '', rack_id: '', 
        publisher: '', year: new Date().getFullYear(), stock: 0, 
        cover_image: null, status: 'available', description: '',
        ebook_file: null, ebook_link: ''
      });
      setCoverPreview(null);
    }
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          fd.append(k, v);
        }
      });
      
      if (editingBook) {
        // Laravel doesn't support Multipart PUT/PATCH easily, use POST with _method
        fd.append('_method', 'PUT');
        await api.post(`/books/${editingBook.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModalOpen(false);
      fetchBooks();
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

  const handleFileChange = (field, file) => {
    setForm(f => ({ ...f, [field]: file }));
    if (field === 'cover_image' && file) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus buku ini?')) return;
    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus buku.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Koleksi Buku</h1>
          <p className="text-sm font-medium text-slate-500">Manajemen inventaris buku perpustakaan</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-[#1d58d8] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Buku Baru
        </button>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, pengarang, ISBN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-[#1d58d8] transition-all placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 w-full sm:w-auto bg-white transition-all hover:border-slate-300">
                <Filter size={16} className="text-slate-400" />
                <select 
                    value={filterCategory} 
                    onChange={e => setFilterCategory(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer min-w-[140px] border-none appearance-none pr-4"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 w-full sm:w-auto bg-white transition-all hover:border-slate-300">
                <MapPin size={16} className="text-slate-400" />
                <select 
                    value={filterRack} 
                    onChange={e => setFilterRack(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer min-w-[120px] border-none appearance-none pr-4"
                >
                    <option value="">Semua Rak</option>
                    {racks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>
            
            {(search || filterCategory || filterRack) && (
                <button 
                    onClick={() => {setSearch(''); setFilterCategory(''); setFilterRack('');}}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                    title="Hapus Filter"
                >
                    <X size={18} />
                </button>
            )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden min-h-[400px] flex flex-col relative">
        {loading && books.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full flex-1 gap-4">
            <Loader2 className="animate-spin text-[#1d58d8]" size={40} />
            <p className="text-sm font-bold text-slate-500">Memuat data...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-20 border-4 border-slate-200 rounded-lg mb-6 flex flex-col relative">
              <div className="h-4 border-b-4 border-slate-200"></div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Buku tidak ditemukan</h3>
            <p className="text-slate-500 font-medium mb-6">Tidak ada buku yang sesuai dengan pencarian Anda.</p>
            <button onClick={() => {setSearch(''); setFilterCategory(''); setFilterRack('');}} className="px-6 py-3 bg-[#e0e7ff] text-[#1d58d8] rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
                Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Informasi Buku</th>
                  <th className="px-6 py-3">Kategori & Lokasi</th>
                  <th className="px-6 py-3">Identitas</th>
                  <th className="px-6 py-3 text-center">Stok</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
                          {book.cover_url ? (
                            <img src={book.cover_url} className="w-full h-full object-cover" alt="" />
                          ) : <BookIcon size={24} className="opacity-50" />}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 line-clamp-2">{book.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{book.author} • {book.year}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{book.publisher}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          {book.category?.name || 'Umum'}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                           <MapPin size={14} className="text-[#2563EB]" />
                           <span>{book.rack?.name || 'Tanpa Rak'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-xs">
                            <span className="text-gray-500 mr-2">ISBN</span>
                            <span className="font-medium text-gray-800">{book.isbn || '—'}</span>
                        </div>
                        <div className="text-xs">
                            <span className="text-gray-500 mr-2">CODE</span>
                            <span className="font-medium text-gray-800">{book.barcode || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                            book.stock > 5 ? 'bg-emerald-100 text-emerald-700'
                            : book.stock > 0 ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                            {book.stock}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(book)} className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(book.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full shadow-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{editingBook ? 'Edit Data Buku' : 'Tambah Buku Baru'}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  <AlertCircle size={16} />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">COVER / FOTO BUKU</label>
                    <label className="relative block group cursor-pointer group">
                      <div className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${coverPreview ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                        {coverPreview ? (
                          <div className="relative w-full h-full group">
                            <img src={coverPreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-xs font-bold flex items-center gap-2"><Upload size={14} /> Ganti Foto</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-slate-400 p-6 text-center">
                             <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Image size={24} className="text-blue-500" />
                             </div>
                             <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Upload Cover</span>
                             <p className="text-[10px] text-slate-400 mt-2">JPG, PNG, WEBP (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange('cover_image', e.target.files[0])} />
                    </label>
                  </div>
                </div>
                <div className="md:col-span-1 space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">JUDUL <span className="text-red-500">*</span></label>
                    <input required type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                      placeholder="Judul buku" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">PENULIS <span className="text-red-500">*</span></label>
                    <input required type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                      placeholder="Nama penulis" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">PENERBIT <span className="text-red-500">*</span></label>
                    <input required type="text" value={form.publisher} onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                      placeholder="Nama penerbit" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">TAHUN <span className="text-red-500">*</span></label>
                      <input required type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                        placeholder="2024" min="1900" max={new Date().getFullYear() + 5} />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">STOK <span className="text-red-500">*</span></label>
                      <input required type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                        placeholder="0" min="0" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">ISBN <span className="text-red-500">*</span></label>
                    <input required type="text" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                      placeholder="ISBN" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">KATEGORI <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors appearance-none">
                        <option value="">Pilih kategori</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Barcode size={14} className="text-gray-400" /> Kode / Barcode <span className="text-red-500">*</span>
                    </label>
                    <input required type="text" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                      placeholder="Input manual atau gunakan scanner" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" /> Lokasi Rak
                  </label>
                  <div className="relative">
                    <select value={form.rack_id} onChange={e => setForm(f => ({ ...f, rack_id: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors appearance-none">
                      <option value="">Pilih Rak (Opsional)</option>
                      {racks.map(r => <option key={r.id} value={r.id}>{r.name} - {r.description}</option>)}
                    </select>
                    <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Digital E-Book (Opsional)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">File Ebook (PDF/EPUB)</label>
                      <input type="file" accept=".pdf,.epub" onChange={e => setForm(f => ({ ...f, ebook_file: e.target.files[0] }))}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-700">Link Ebook External</label>
                      <input type="url" value={form.ebook_link} onChange={e => setForm(f => ({ ...f, ebook_link: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                        placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">DESKRIPSI</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors resize-none"
                    placeholder="Deskripsi singkat buku..." />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Status Ketersediaan</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors appearance-none">
                    <option value="available">Tersedia</option>
                    <option value="unavailable">Tidak Tersedia</option>
                    <option value="missing">Hilang</option>
                    <option value="damaged">Rusak</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSubmit} disabled={formLoading} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    <BookIcon size={16} />
                    {editingBook ? 'Simpan Perubahan' : 'Tambah Buku'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
