import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit2, Trash2, Search, MapPin, Loader2, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Racks() {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRack, setEditingRack] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchRacks();
  }, []);

  const fetchRacks = async () => {
    try {
      const response = await api.get('/racks');
      setRacks(response.data);
    } catch (error) {
      console.error('Error fetching racks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingRack) {
        await api.put(`/racks/${editingRack.id}`, formData);
        Swal.fire('Berhasil', 'Rak berhasil diperbarui', 'success');
      } else {
        await api.post('/racks', formData);
        Swal.fire('Berhasil', 'Rak berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      setEditingRack(null);
      fetchRacks();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (rack) => {
    setEditingRack(rack);
    setFormData({
      name: rack.name,
      description: rack.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Data rak akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/racks/${id}`);
        Swal.fire('Dihapus!', 'Rak berhasil dihapus.', 'success');
        fetchRacks();
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus rak', 'error');
      }
    }
  };

  const filteredRacks = racks.filter(rack => 
    rack.name.toLowerCase().includes(search.toLowerCase()) ||
    (rack.description && rack.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lokasi Rak Fisik</h1>
          <p className="text-sm text-gray-500 mt-1">Manajemen penempatan koleksi buku di area perpustakaan</p>
        </div>
        <button
          onClick={() => {
            setEditingRack(null);
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Rak
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau deskripsi rak..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
            />
          </div>
          <div className="px-3 py-1.5 bg-blue-50 text-[#2563EB] rounded-lg border border-blue-100 text-sm font-semibold">
             Total: {filteredRacks.length} Rak
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Nama Rak</th>
                <th className="px-6 py-3">Deskripsi Lokasi</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-[#2563EB]" size={32} />
                        <span className="text-sm text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRacks.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center text-gray-500">
                    <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Belum Ada Data Rak</h3>
                    <p className="text-sm mt-1">Daftarkan rak fisik untuk mempermudah pencarian koleksi.</p>
                  </td>
                </tr>
              ) : (
                filteredRacks.map((rack) => (
                  <tr key={rack.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563EB]">
                          <MapPin size={20} />
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900 block">{rack.name}</span>
                            <span className="text-xs text-gray-500 block mt-0.5">ID: {rack.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 line-clamp-2">
                         {rack.description || <span className="italic text-gray-400">Tidak ada deskripsi</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(rack)}
                          className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(rack.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                  {editingRack ? 'Update Rak' : 'Tambah Rak Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Nama Rak</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rak A-01"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Deskripsi Lokasi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Opsional..."
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors resize-none"
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-[#2563EB] text-white hover:bg-blue-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
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
