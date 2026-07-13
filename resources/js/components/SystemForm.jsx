import { useState, useRef } from 'react';
import { Settings, Save, Loader2, Image as ImageIcon, Upload, X, Globe, MapPin, Palette, RefreshCw } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function SystemForm({ system, onUpdate }) {
  const [formData, setFormData] = useState({
    app_name: system?.app_name || '',
    school_name: system?.school_name || '',
    address: system?.address || '',
    primary_color: system?.primary_color || '#2563EB',
    date_format: system?.date_format || 'd/m/Y',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(system?.logo ? `/storage/${system.logo}` : null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const logoFile = useRef(null);

  const handleImageSelect = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, SVG, atau WebP.');
      return;
    }
    logoFile.current = file;
    setPreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleImageSelect(e.dataTransfer.files[0]);
  };

  const clearLogo = (e) => {
    e.stopPropagation();
    setPreview(null);
    logoFile.current = null;
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.app_name.trim()) return toast.error('Nama aplikasi tidak boleh kosong');
    if (!formData.school_name.trim()) return toast.error('Nama instansi tidak boleh kosong');

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (logoFile.current) fd.append('logo', logoFile.current);

      const res = await api.post('/settings/system', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onUpdate(res.data.system);
      toast.success('✅ Pengaturan sistem berhasil diperbarui! Sidebar & halaman login telah diupdate.');
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) {
        toast.error(Object.values(errs).flat().join(', '));
      } else {
        toast.error(err.response?.data?.message || 'Gagal memperbarui pengaturan sistem');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-12 px-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-sm text-slate-800 placeholder:text-slate-400";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 md:p-8 border-b border-slate-100">
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Konfigurasi Sistem</h2>
          <p className="text-sm text-slate-500 mt-0.5">Identitas perpustakaan & tampilan global</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

        {/* Logo Upload */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">
            Logo Perpustakaan
          </label>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative w-36 h-36 shrink-0 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
                ${dragOver ? 'border-indigo-400 bg-indigo-50 scale-105' : preview ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50'}`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Logo Preview" className="w-full h-full object-contain p-3" />
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <>
                  <ImageIcon size={28} className="text-slate-300 mb-2" />
                  <p className="text-[10px] text-slate-400 font-bold text-center px-2">Klik atau drag logo</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files[0])}
            />

            <div className="flex-1 space-y-3">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Upload logo yang akan tampil di <span className="font-bold text-slate-800">sidebar, halaman login,</span> dan semua portal sistem.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>Format: JPG, PNG, SVG, WebP</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>Ukuran maks: 2 MB</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>Rekomendasi: rasio 1:1 (persegi)</li>
              </ul>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200"
              >
                <Upload size={14} /> Pilih File Logo
              </button>
            </div>
          </div>
        </div>

        {/* Identity Fields */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
            <Globe size={12} /> Identitas Perpustakaan
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Nama Aplikasi / Perpustakaan *</label>
              <input
                required
                type="text"
                value={formData.app_name}
                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                className={inputClass}
                placeholder="CASPER Smart Library"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Nama Instansi / Sekolah *</label>
              <input
                required
                type="text"
                value={formData.school_name}
                onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                className={inputClass}
                placeholder="SMK Teknologi Nusantara"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
            <MapPin size={12} /> Alamat
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            placeholder="Jl. Pendidikan No. 1, Kota Cirebon, Jawa Barat"
            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-sm text-slate-800 placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Color + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
              <Palette size={12} /> Warna Utama Tema
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200 p-0.5 bg-white"
                />
              </div>
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="flex-1 h-12 px-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm font-mono"
                placeholder="#2563EB"
              />
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {['#2563EB', '#059669', '#DC2626', '#7C3AED', '#0891B2', '#EA580C', '#0F172A'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, primary_color: c })}
                  className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${formData.primary_color === c ? 'border-slate-600 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Format Tanggal</label>
            <select
              value={formData.date_format}
              onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="d/m/Y">DD/MM/YYYY — 31/12/2024</option>
              <option value="Y-m-d">YYYY-MM-DD — 2024-12-31</option>
              <option value="d M Y">DD MMM YYYY — 31 Des 2024</option>
              <option value="D, d M Y">Hari, DD MMM YYYY</option>
            </select>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <RefreshCw size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Setelah menyimpan, <strong>logo & nama perpustakaan</strong> akan langsung berubah di <strong>sidebar, navbar, dan semua halaman login</strong> tanpa perlu refresh manual.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400 font-medium">* Wajib diisi</p>
          <button
            disabled={loading}
            type="submit"
            className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
