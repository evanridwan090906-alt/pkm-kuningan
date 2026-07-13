import { useState, useEffect } from 'react';
import api from '../../api';
import { Tags, Plus, Edit2, Trash2, Loader2, X, AlertCircle } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cat = null) => {
    setEditingCat(cat);
    setName(cat?.name || '');
    setDescription(cat?.description || '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, { name, description });
      } else {
        await api.post('/categories', { name, description });
      }
      setModalOpen(false);
      fetchCategories();
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

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini? Buku dengan kategori ini akan kehilangan kategorinya.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori.');
    }
  };

  const COLORS = [
    'bg-blue-100 text-[#2563EB]', 'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
    'bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori Literasi</h1>
          <p className="text-sm text-gray-500 mt-1">Klasifikasi koleksi buku berdasarkan bidang ilmu</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      {/* Grid Section */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="animate-spin text-[#2563EB]" size={40} />
          <p className="text-sm text-gray-500">Memuat data...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 px-6">
          <Tags size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Belum ada kategori</h3>
          <p className="text-gray-500 mt-1 text-sm">Buat kategori pertama untuk mulai mengorganisir koleksi buku Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${COLORS[i % COLORS.length]}`}>
                  {cat.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(cat)} className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{cat.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                    {cat.description || 'Tidak ada deskripsi.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Jumlah Buku</span>
                <span className="text-sm font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                  {cat.books_count ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingCat ? 'Update Kategori' : 'Kategori Baru'}</h3>
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
                <label className="block text-sm font-semibold text-gray-700">Nama Kategori</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                  placeholder="Contoh: Teknologi, Sastra..." />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Deskripsi Singkat</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors resize-none"
                  rows={3} placeholder="Opsional..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2 bg-[#2563EB] text-white hover:bg-blue-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
