import { useState, useEffect } from 'react';
import { 
  BarChart2, 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar,
  BookOpen,
  ArrowLeftRight,
  TrendingUp,
  PieChart,
  User,
  Search,
  ChevronDown
} from 'lucide-react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">{title}</h3>
    <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

export default function Reports() {
  const [activeTab, setActiveTab] = useState('peminjaman');
  const [filter, setFilter] = useState('bulanan');
  const [statusFilter, setStatusFilter] = useState('');
  const [jurusanFilter, setJurusanFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [ebookStats, setEbookStats] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'peminjaman') {
        const res = await api.get('/reports/borrow', { params: { filter, status: statusFilter, jurusan: jurusanFilter } });
        setData(res.data.data);
      } else if (activeTab === 'pengembalian') {
        const res = await api.get('/reports/return', { params: { filter, jurusan: jurusanFilter } });
        setData(res.data.data);
      } else {
        const res = await api.get('/reports/ebooks');
        setEbookStats(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, filter, statusFilter, jurusanFilter]);

  const handleExport = async (type) => {
    try {
      const endpoint = activeTab === 'peminjaman' ? '/reports/borrow' : '/reports/return';
      const response = await api.get(`${endpoint}/${type}`, {
        params: { filter, status: statusFilter, jurusan: jurusanFilter },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan_${activeTab}_${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Berhasil mengunduh ${type.toUpperCase()}`);
    } catch (err) {
      toast.error('Gagal mengunduh laporan');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laporan Perpustakaan</h1>
          <p className="text-slate-500 font-medium mt-1">Pantau statistik dan ekspor data operasional perpustakaan secara realtime.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
          >
            <Download size={18} /> PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors"
          >
            <Download size={18} /> Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-1">
          {[
            { id: 'peminjaman', label: 'Peminjaman', icon: ArrowLeftRight },
            { id: 'pengembalian', label: 'Pengembalian', icon: TrendingUp },
            { id: 'ebook', label: 'Buku Digital', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
            >
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={jurusanFilter}
              onChange={(e) => setJurusanFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
            >
              <option value="">Semua Jurusan</option>
              <option value="RPL">RPL</option>
              <option value="TKJ">TKJ</option>
              <option value="MM">MM</option>
              <option value="TKR">TKR</option>
            </select>
          </div>

          {activeTab === 'peminjaman' && (
             <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                >
                  <option value="">Semua Status</option>
                  <option value="borrowed">Dipinjam</option>
                  <option value="returned">Dikembalikan</option>
                  <option value="overdue">Terlambat</option>
                  <option value="booking">Booking</option>
                </select>
             </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab === 'ebook' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard 
                      title="Total E-Book" 
                      value={ebookStats?.stats?.total_ebooks || 0} 
                      icon={BookOpen} 
                      color="bg-indigo-600" 
                    />
                    <StatCard 
                      title="Total Download" 
                      value={ebookStats?.stats?.total_downloads || 0} 
                      icon={Download} 
                      color="bg-emerald-600" 
                    />
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                      <TrendingUp className="text-blue-600" size={24} />
                      Buku Paling Populer
                    </h3>
                    <div className="space-y-4">
                      {ebookStats?.popular_ebooks?.map((book, idx) => (
                        <div key={book.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-blue-600 border border-blue-100">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{book.title}</h4>
                            <p className="text-xs text-slate-500 font-medium">{book.author} • {book.download_count} Downloads</p>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-black text-blue-600">{book.download_count}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <PieChart className="text-purple-600" size={24} />
                    Statistik Unduhan
                  </h3>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ebookStats?.popular_ebooks}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="title" hide />
                        <YAxis stroke="#94a3b8" fontSize={12} fontStyle="bold" />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="download_count" radius={[8, 8, 0, 0]}>
                           {ebookStats?.popular_ebooks?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-50">
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                      Statistik menunjukkan buku digital yang paling sering diunduh oleh siswa selama periode ini.
                    </p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Siswa</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Buku</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tenggat</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {[...Array(6)].map((_, j) => (
                            <td key={j} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                          ))}
                        </tr>
                      ))
                    ) : data.length > 0 ? (
                      data.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100">
                                {item.user?.name?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{item.user?.name}</div>
                                <div className="text-[10px] font-black text-slate-400 tracking-wider">{item.user?.nisn}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="max-w-[200px]">
                              <div className="font-bold text-slate-800 truncate">{item.book?.title}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{item.book?.author}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-bold text-slate-600 text-sm">
                            {item.borrow_date}
                          </td>
                          <td className="px-6 py-5 font-bold text-slate-600 text-sm">
                            {item.due_date}
                          </td>
                          <td className="px-6 py-5">
                             <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                               item.status === 'borrowed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                               item.status === 'returned' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                               item.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' :
                               'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>
                               {item.status}
                             </span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                <User size={14} className="text-slate-400" />
                                {item.petugas_name || '-'}
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                              <Search size={32} />
                           </div>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Data tidak ditemukan</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
