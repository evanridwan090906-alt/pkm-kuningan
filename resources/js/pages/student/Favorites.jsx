import { motion } from 'framer-motion';
import { Heart, BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Favorites() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart size={40} fill="currentColor" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Koleksi Favorit</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-10">
          Simpan buku-buku yang Anda sukai di sini untuk akses lebih cepat di masa mendatang.
        </p>

        <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">Belum ada buku favorit.</p>
          <p className="text-sm text-slate-400 mt-1">Mulai jelajahi koleksi kami dan tandai sebagai favorit!</p>
          
          <Link to="/siswa/borrow" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Search size={18} /> Cari Buku Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
