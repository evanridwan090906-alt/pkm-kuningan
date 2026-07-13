import { useState, useRef } from 'react';
import { Camera, Save, Loader2, User as UserIcon } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

export default function ProfileForm({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user?.profile_photo_path ? `/storage/${user.profile_photo_path}` : null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (formData.phone) data.append('phone', formData.phone);
      if (fileInputRef.current.files[0]) {
        data.append('profile_photo', fileInputRef.current.files[0]);
      }

      const res = await api.post('/settings/profile', data);
      
      // Update local storage and state
      const updatedUser = res.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdate(updatedUser);

      Swal.fire({
        title: 'Berhasil!',
        text: 'Profil Anda telah diperbarui',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal memperbarui profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
          <UserIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Profil Pengguna</h2>
          <p className="text-sm text-gray-500">Informasi personal dan foto profil Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center sm:items-start gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <span className="text-3xl font-black text-gray-300">{formData.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all scale-90 group-hover:scale-100"
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Format: JPG, PNG • Max: 2MB</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Email</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
              placeholder="Contoh: 08123456789"
            />
          </div>
          <div className="space-y-2 opacity-60">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role (Read-only)</label>
            <input
              disabled
              type="text"
              value={user?.role?.toUpperCase()}
              className="w-full h-12 px-4 bg-gray-100 border-2 border-transparent rounded-xl font-bold text-sm"
            />
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="flex items-center justify-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
