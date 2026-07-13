import { useState, useEffect } from 'react';
import api from '../../api';
import { 
  Archive as ArchiveIcon, 
  Book as BookIcon,
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  FileDown, 
  FileSpreadsheet, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  User as UserIcon,
  Info
} from 'lucide-react';

const ARCHIVE_TYPE_MAP = {
  masuk: { 
    label: 'Masuk', 
    icon: ArrowUpRight, 
    classes: 'bg-emerald-100 text-emerald-700',
  },
  keluar: { 
    label: 'Keluar', 
    icon: ArrowDownRight, 
    classes: 'bg-rose-100 text-rose-700',
  }
};

const STATUS_MAP = {
  rusak: 'bg-amber-100 text-amber-700',
  hilang: 'bg-red-100 text-red-700',
  basah: 'bg-blue-100 text-blue-700',
  dipinjam: 'bg-indigo-100 text-indigo-700',
  dikembalikan: 'bg-emerald-100 text-emerald-700',
  terlambat: 'bg-rose-100 text-rose-700',
  null: 'bg-gray-100 text-gray-600'
};

export default function Archives() {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState({ pdf: false, excel: false });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => { 
    fetchArchives(); 
  }, [page, filterType, startDate, endDate]);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stock/history', {
        params: { 
          page, 
          type: filterType,
          start_date: startDate,
          end_date: endDate
        }
      });
      setArchives(res.data.data);
      setMeta({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
        from: res.data.from,
        to: res.data.to
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportType) => {
    setExportLoading(prev => ({ ...prev, [exportType]: true }));
    try {
      const response = await api.get(`/export/archives/${exportType}`, {
        params: { type: filterType, start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-stok-${new Date().getTime()}.${exportType === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Gagal mengekspor laporan.');
    } finally {
      setExportLoading(prev => ({ ...prev, [exportType]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Aktivitas Perpustakaan</h1>
          <p className="text-sm text-gray-500 mt-1">Jejak digital seluruh aktivitas sirkulasi stok buku</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('excel')}
            disabled={exportLoading.excel}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {exportLoading.excel ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            Unduh Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportLoading.pdf}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium text-sm hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {exportLoading.pdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            Unduh PDF
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-auto space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Kategori Transaksi</label>
            <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors appearance-none cursor-pointer">
                    <option value="">Semua Aktivitas</option>
                    <option value="masuk">Pemasukan (In)</option>
                    <option value="keluar">Pengeluaran (Out)</option>
                </select>
            </div>
        </div>

        <div className="flex-1 space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Periode Waktu</label>
            <div className="flex items-center gap-2">
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                />
                <span className="text-gray-500 font-medium text-sm">s/d</span>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                />
            </div>
        </div>

        {(filterType || startDate || endDate) && (
            <button 
                onClick={() => {setFilterType(''); setStartDate(''); setEndDate(''); setPage(1);}}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
            >
                Reset Filter
            </button>
        )}
      </div>

      {/* Main Content Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {loading && archives.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader2 className="animate-spin text-[#2563EB]" size={40} />
            <p className="text-sm text-gray-500">Memuat log...</p>
          </div>
        ) : archives.length === 0 ? (
          <div className="text-center py-16 px-6">
            <ArchiveIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Log Aktivitas Kosong</h3>
            <p className="text-gray-500 mt-1 text-sm">Data riwayat akan muncul otomatis setelah aktivitas perubahan stok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Buku & Operator</th>
                  <th className="px-6 py-3">Tipe & Status</th>
                  <th className="px-6 py-3 text-center">Jumlah</th>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {archives.map((arc) => {
                  const typeInfo = ARCHIVE_TYPE_MAP[arc.type];
                  const TypeIcon = typeInfo?.icon;
                  return (
                    <tr key={arc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
                                <BookIcon size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 line-clamp-1">{arc.book?.title || '—'}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                    <UserIcon size={12} />
                                    <span>{arc.user?.name || 'SYSTEM'}</span>
                                </div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${typeInfo?.classes || 'bg-gray-100 text-gray-700'}`}>
                                {TypeIcon && <TypeIcon size={12} />}
                                {typeInfo?.label || arc.type}
                            </span>
                            {arc.status && (
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${STATUS_MAP[arc.status] || STATUS_MAP.null}`}>
                                    {arc.status}
                                </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold text-lg ${arc.type === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {arc.type === 'masuk' ? '+' : '-'}{arc.qty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">
                            {arc.date ? new Date(arc.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {new Date(arc.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-[200px]">
                            <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-600 italic line-clamp-2">
                                {arc.description || '—'}
                            </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{meta.from}-{meta.to}</span> dari <span className="font-semibold text-gray-900">{meta.total}</span> data
            </div>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} 
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1">
                <ChevronLeft size={16} /> Prev
              </button>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} 
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
