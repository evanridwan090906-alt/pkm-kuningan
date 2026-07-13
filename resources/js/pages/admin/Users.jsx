import { useState, useEffect } from 'react';
import api from '../../api';
import { Users as UsersIcon, Plus, Edit2, Trash2, Shield, User as UserIcon, Loader2, AlertCircle, X, Search, Mail, Lock } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Users() {
  const { user: currentUser } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('petugas');
  const [nim, setNim] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    fetchUsers();

    const interval = setInterval(() => {
      if (isMounted) fetchUsers(true);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setNim(user.nim || '');
      setJurusan(user.jurusan || '');
      setAngkatan(user.angkatan || '');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setRole('petugas');
      setNim('');
      setJurusan('');
      setAngkatan('');
      setPassword('');
    }
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    const payload = { name, email, role };
    if (password) payload.password = password;
    if (role === 'siswa') {
      payload.nim = nim;
      payload.jurusan = jurusan;
      payload.angkatan = angkatan;
    }

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        Swal.fire({ title: 'Berhasil', text: 'Data pengguna diperbarui', icon: 'success', confirmButtonColor: '#2563EB' });
      } else {
        await api.post('/users', payload);
        Swal.fire({ title: 'Berhasil', text: 'Pengguna baru ditambahkan', icon: 'success', confirmButtonColor: '#2563EB' });
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 422) {
        const errs = Object.values(err.response.data.errors).flat();
        setError(errs.join(', '));
      } else {
        setError('Terjadi kesalahan.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Pengguna?',
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/users/${id}`);
        Swal.fire({ title: 'Terhapus', text: 'Pengguna telah dihapus.', icon: 'success', confirmButtonColor: '#2563EB' });
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Gagal menghapus user', 'error');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = currentUser?.role === 'admin';

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="animate-spin text-[#2563EB]" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Petugas & Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data petugas dan admin sistem perpustakaan</p>
      </div>

      {/* Access Notice for Petugas */}
      {!isAdmin && (
        <div className="flex items-center gap-3 px-5 py-4 mb-2 bg-amber-50 border border-amber-200 rounded-2xl">
          <Shield size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-700">Anda login sebagai <span className="uppercase">Petugas</span>. Hanya Admin yang dapat menambah, mengubah, atau menghapus data pengguna.</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium text-sm placeholder:font-normal border border-transparent focus:border-gray-200"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => openModal()}
              className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-sm flex justify-center items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Plus size={18} /> Tambah Pengguna
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Profil Pengguna</th>
                <th className="px-6 py-4">Kontak / Info</th>
                <th className="px-6 py-4">Hak Akses</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        {u.profile_photo_path ? (
                          <img src={`/storage/${u.profile_photo_path}`} alt={u.name} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white" />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-white ${u.role === 'admin' ? 'bg-gradient-to-br from-blue-500 to-[#2563EB]' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'}`}>
                              {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                            <span className="font-bold text-gray-900 block group-hover:text-[#2563EB] transition-colors">{u.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-medium">UID: {u.id.toString().padStart(4, '0')}</span>
                              <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`} title={u.is_active ? 'Online / Aktif' : 'Offline / Nonaktif'}></span>
                            </div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium flex items-center gap-2 mb-1">
                        <Mail size={14} className="text-gray-400" />
                        {u.email}
                    </span>
                    {u.phone && (
                      <span className="text-gray-500 text-xs font-medium flex items-center gap-2">
                          <span className="text-gray-400">📞</span> {u.phone}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-blue-50 text-[#2563EB] border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {u.role === 'admin' ? <Shield size={14} /> : <UserIcon size={14} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isAdmin ? (
                      <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(u)} className="p-2 text-gray-400 hover:text-[#2563EB] bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors shadow-sm" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        {u.id !== currentUser.id ? (
                          <button onClick={() => handleDelete(u.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 rounded-lg transition-colors shadow-sm" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <div className="w-8 h-8"></div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium italic">Hanya lihat</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                  <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                          <div className="flex flex-col items-center justify-center">
                              <Search size={32} className="text-gray-300 mb-3" />
                              Tidak ada pengguna yang sesuai dengan pencarian.
                          </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                 <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="font-bold">{error}</span>
                  </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input required type="text" value={name} onChange={e=>setName(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium text-sm placeholder:font-normal border border-transparent focus:border-gray-200" 
                        placeholder="Contoh: Budi Santoso" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Alamat Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium text-sm placeholder:font-normal border border-transparent focus:border-gray-200" 
                        placeholder="budi@sekolah.sch.id" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Hak Akses (Role)</label>
                    <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select value={role} onChange={e=>setRole(e.target.value)} 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium text-sm appearance-none cursor-pointer border border-transparent focus:border-gray-200">
                        <option value="petugas">Petugas</option>
                        <option value="admin">Admin</option>
                        </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Kata Sandi
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength="8" required={!editingUser} 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium text-sm placeholder:font-normal border border-transparent focus:border-gray-200" 
                            placeholder={editingUser ? "Kosongkan jika tetap" : "Minimal 8 karakter"} />
                    </div>
                  </div>
              </div>



              <div className="pt-6 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors text-center shadow-sm">
                    Batalkan
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-3.5 bg-[#2563EB] text-white hover:bg-blue-700 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95">
                  {formLoading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
