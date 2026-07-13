import { useState } from 'react';
import { Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

export default function AccountForm() {
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return Swal.fire('Error', 'Konfirmasi password tidak cocok', 'error');
    }

    setLoading(true);
    try {
      await api.post('/settings/password', formData);
      Swal.fire('Berhasil!', 'Password telah diperbarui', 'success');
      setFormData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal memperbarui password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
          <Lock size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Keamanan Akun</h2>
          <p className="text-sm text-gray-500">Ubah password Anda untuk menjaga keamanan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Saat Ini</label>
          <input
            required
            type={showPassword ? "text" : "password"}
            value={formData.current_password}
            onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
            className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Baru</label>
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
          <input
            required
            type={showPassword ? "text" : "password"}
            value={formData.password_confirmation}
            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
            className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="flex items-center justify-center gap-3 px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Perbarui Password
        </button>
      </form>
    </div>
  );
}
