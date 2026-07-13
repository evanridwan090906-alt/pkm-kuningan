import { useState } from 'react';
import { Bell, Save, Loader2 } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

export default function NotificationSettings({ system, onUpdate }) {
  const [formData, setFormData] = useState({
    notif_loan: !!system?.notif_loan,
    notif_late: !!system?.notif_late,
    notif_email: !!system?.notif_email,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/settings/notifications', formData);
      onUpdate(res.data.system);
      Swal.fire('Berhasil!', 'Preferensi notifikasi diperbarui', 'success');
    } catch (err) {
      Swal.fire('Error', 'Gagal memperbarui notifikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all cursor-pointer" onClick={onChange}>
      <div className="pr-8">
        <p className="text-sm font-black text-gray-900">{label}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? 'left-7' : 'left-1'}`}></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
          <Bell size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Pusat Notifikasi</h2>
          <p className="text-sm text-gray-500">Atur bagaimana sistem memberi tahu Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div className="space-y-3">
          <Toggle 
            checked={formData.notif_loan} 
            onChange={() => setFormData({...formData, notif_loan: !formData.notif_loan})} 
            label="Notifikasi Peminjaman" 
            desc="Kirim notifikasi saat buku berhasil dipinjamkan."
          />
          <Toggle 
            checked={formData.notif_late} 
            onChange={() => setFormData({...formData, notif_late: !formData.notif_late})} 
            label="Notifikasi Keterlambatan" 
            desc="Peringatan otomatis saat buku melewati batas waktu."
          />
          <Toggle 
            checked={formData.notif_email} 
            onChange={() => setFormData({...formData, notif_email: !formData.notif_email})} 
            label="Email Notifikasi" 
            desc="Kirim salinan notifikasi ke email terdaftar."
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="flex items-center justify-center gap-3 px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan Preferensi
        </button>
      </form>
    </div>
  );
}
