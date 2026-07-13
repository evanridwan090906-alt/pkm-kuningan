import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Edit2, Trash2, Upload, Download,
  Loader2, X, Camera, CheckCircle2, Lock, XCircle, RefreshCw,
  Wifi, WifiOff, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useStudents } from '../../context/StudentContext';

const EMPTY_FORM = {
  name: '', nisn: '', email: '', jurusan: '', angkatan: '',
  kelas: '', password: '', is_active: true, photo: null
};

export default function AdminStudents() {
  const { students, meta, loading, params, setParams, refreshStudents, jurusanList, angkatanList } = useStudents();

  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pulse, setPulse] = useState(false);
  const searchRef = useRef(null);

  const triggerPulse = () => { setPulse(true); setTimeout(() => setPulse(false), 600); };

  const handleSearch = (val) => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setParams(p => ({ ...p, search: val, page: 1 })), 400);
  };

  const openForm = (student = null) => {
    setEditingStudent(student);
    if (student) {
      setForm({ name: student.name, nisn: student.nisn, email: student.email,
        jurusan: student.jurusan || '', angkatan: student.angkatan || '',
        kelas: student.kelas || '', password: '', is_active: student.is_active ?? true, photo: null });
      setPhotoPreview(student.profile_photo_url || null);
    } else {
      setForm(EMPTY_FORM);
      setPhotoPreview(null);
    }
    setModalOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, photo: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, k === 'is_active' ? (v ? '1' : '0') : v);
      });
      if (editingStudent) {
        fd.append('_method', 'PUT');
        await api.post(`/students/${editingStudent.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('✅ Data siswa diperbarui — semua portal sinkron!');
      } else {
        await api.post('/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('✅ Siswa baru didaftarkan — petugas akan melihat secara realtime!');
      }
      setModalOpen(false);
      triggerPulse();
      refreshStudents();
    } catch (err) {
      const errs = err.response?.data?.errors;
      toast.error(errs ? Object.values(errs).flat().join(', ') : err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Hapus siswa "${student.name}"? Riwayat peminjaman mungkin terdampak.`)) return;
    try {
      await api.delete(`/students/${student.id}`);
      toast.success('Data siswa dihapus');
      triggerPulse();
      refreshStudents();
    } catch {
      toast.error('Gagal menghapus siswa');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return toast.error('Pilih file terlebih dahulu');
    setFormLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/students/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      setImportModalOpen(false);
      refreshStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengimpor data');
    } finally {
      setFormLoading(false);
    }
  };

  const inp = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all";

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            Data Siswa / Anggota
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${pulse ? 'bg-green-200 text-green-800 scale-110' : 'bg-green-100 text-green-700'}`}>
              <Wifi size={10} /> LIVE
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sinkron realtime dengan portal petugas · Update setiap 8 detik
          </p>
        </div>
        <button onClick={refreshStudents} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              defaultValue={params.search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Cari nama, NISN, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <select value={params.jurusan} onChange={e => setParams(p => ({ ...p, jurusan: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
            <option value="">Semua Jurusan {jurusanList.length > 0 ? `(${jurusanList.length})` : ''}</option>
            {jurusanList.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
          <select value={params.angkatan} onChange={e => setParams(p => ({ ...p, angkatan: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
            <option value="">Semua Angkatan {angkatanList.length > 0 ? `(${angkatanList.length})` : ''}</option>
            {angkatanList.map(a => (
              <option key={a} value={String(a)}>Angkatan {a}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button onClick={() => setImportModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-bold text-sm border border-emerald-200 transition-colors">
            <Download size={16} /> Import
          </button>
          <button onClick={() => openForm()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-colors">
            <Plus size={16} /> Tambah Siswa
          </button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Siswa', value: meta.total || 0, color: 'blue' },
          { label: 'Halaman', value: `${meta.current_page || 1} / ${meta.last_page || 1}`, color: 'indigo' },
          { label: 'Status Sync', value: loading ? 'Memuat...' : 'Realtime ✓', color: 'green' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
              <p className="text-sm text-slate-400 font-medium">Memuat data siswa...</p>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-24">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold">Tidak ada siswa ditemukan</p>
            <button onClick={() => openForm()} className="mt-4 text-blue-600 font-bold text-sm hover:underline">+ Tambah Siswa Pertama</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600">Siswa</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Jurusan / Angkatan</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Email</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={s.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=3B82F6&color=fff`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shrink-0" alt={s.name} />
                        <div>
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">NISN: {s.nisn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{s.jurusan || '-'}</p>
                      <p className="text-xs text-slate-400">{s.angkatan ? `Angkatan ${s.angkatan}` : ''}{s.kelas ? ` · ${s.kelas}` : ''}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {s.is_active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openForm(s)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(s)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Halaman {meta.current_page} dari {meta.last_page} · Total {meta.total} siswa
            </span>
            <div className="flex items-center gap-1">
              <button disabled={params.page <= 1} onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setParams(pr => ({ ...pr, page: p }))}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${params.page === p ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {p}
                </button>
              ))}
              <button disabled={params.page >= meta.last_page} onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{editingStudent ? 'Edit Data Siswa' : 'Registrasi Siswa Baru'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Perubahan akan sinkron realtime ke semua portal</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="flex gap-6 items-start">
                  <div className="shrink-0 flex flex-col items-center">
                    <label className="relative cursor-pointer group">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-slate-300 group-hover:border-blue-500 bg-slate-50 flex items-center justify-center transition-colors">
                        {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" /> : <Camera size={24} className="text-slate-400 group-hover:text-blue-500" />}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">FOTO (OPSIONAL)</p>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Nama Lengkap *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="Nama lengkap siswa" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">NISN *</label>
                      <input required value={form.nisn} onChange={e => setForm(f => ({ ...f, nisn: e.target.value }))} className={inp} placeholder="Nomor Induk Siswa" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} placeholder="email@contoh.com" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Jurusan</label>
                    <input value={form.jurusan} onChange={e => setForm(f => ({ ...f, jurusan: e.target.value }))} className={inp} placeholder="RPL / TKJ / dll" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Angkatan</label>
                    <input value={form.angkatan} onChange={e => setForm(f => ({ ...f, angkatan: e.target.value }))} className={inp} placeholder="2024" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Kelas</label>
                    <input value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))} className={inp} placeholder="X RPL 1" />
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block flex gap-1 items-center">
                      <Lock size={12} /> Password {editingStudent ? '(kosongkan jika tetap)' : '*'}
                    </label>
                    <input type="password" required={!editingStudent} minLength={8} value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inp.replace('bg-slate-50', 'bg-white')} placeholder="Min. 8 karakter" />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer h-10">
                      <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                      <span className="text-sm font-bold text-slate-700">Akun Aktif (Bisa Login)</span>
                    </label>
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Batal</button>
                  <button type="submit" disabled={formLoading} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-60 hover:bg-blue-700 transition-colors">
                    {formLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {formLoading ? 'Menyimpan...' : 'Simpan Data Siswa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {importModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setImportModalOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4"><Upload size={28} className="text-blue-600" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Import Data Siswa</h3>
              <p className="text-sm text-slate-500 mb-6">Upload file CSV dengan kolom: <code className="bg-slate-100 text-blue-600 px-1 rounded">name, nisn, email, jurusan, angkatan, kelas, password</code></p>
              <form onSubmit={handleImport}>
                <input type="file" name="file" accept=".csv" required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6 border border-slate-200 p-2 rounded-2xl" />
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setImportModalOpen(false)} className="py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Batal</button>
                  <button type="submit" disabled={formLoading} className="py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {formLoading ? <Loader2 size={16} className="animate-spin" /> : 'Mulai Import'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
