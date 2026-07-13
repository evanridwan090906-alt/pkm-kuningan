import { LayoutGrid, ClipboardList, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import ActivityList from './ActivityList';

export default function SidebarInfo({ activeTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="lg:col-span-1 space-y-4 max-w-sm mx-auto lg:mx-0 w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Mode Info Card - Compact */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <LayoutGrid size={60} />
         </div>
         <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <LayoutGrid size={14} /> Ringkasan Mode
         </h3>
         <div className="space-y-2">
            {[
                { id: 'select', title: 'Pilih Buku', desc: 'Cari koleksi terdaftar.' },
                { id: 'scan', title: 'Scan Barcode', desc: 'Deteksi instan via kamera.' },
                { id: 'manual', title: 'Input Manual', desc: 'Daftarkan buku baru.' },
            ].map(mode => (
                <div key={mode.id} className={`p-3 rounded-xl transition-all border ${activeTab === mode.id ? 'bg-blue-50 border-blue-100 scale-[1.02]' : 'bg-white border-transparent opacity-50'}`}>
                    <p className="font-bold text-[11px] text-gray-900">{mode.title}</p>
                    <p className="text-[10px] mt-0.5 text-gray-500">{mode.desc}</p>
                </div>
            ))}
         </div>
      </div>

      {/* Activity Card - Collapsible on Mobile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full p-5 flex items-center justify-between group"
         >
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="text-blue-600" size={14} /> Aktivitas Terakhir
            </h3>
            <ChevronDown size={16} className={`text-gray-400 transition-transform md:hidden ${isCollapsed ? '' : 'rotate-180'}`} />
         </button>
         
         <div className={`px-2 pb-5 md:block ${isCollapsed ? 'hidden' : 'block'}`}>
            <ActivityList />
            <button className="w-full mt-4 py-2.5 text-[10px] font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-colors uppercase tracking-widest">
                Lihat Semua Laporan
            </button>
         </div>
      </div>
    </div>
  );
}
