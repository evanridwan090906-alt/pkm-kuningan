import { useState, useEffect, useRef } from 'react';
import { PackageMinus, Calendar, Info, Search, Book as BookIcon, AlertTriangle, Minus, Plus, Loader2, X, CheckCircle2 } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import BarcodeScanner from '../../components/BarcodeScanner';

export default function StockOut() {
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  // Smart Search & Quick Select
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [items, setItems] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isManualMode, setIsManualMode] = useState(false);

  const [formData, setFormData] = useState({
    book_id: '',
    manual_title: '',
    manual_author: '',
    manual_isbn: '',
    qty: 1,
    status: 'rusak', // hilang/rusak/basah
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleScan = async (code) => {
    setShowScanner(false);
    setLoading(true);
    try {
      const response = await api.get(`/books/barcode/${code}`);
      const book = response.data;
      setSelectedBook(book);
      setIsManualMode(false);
      setFormData(prev => ({ ...prev, book_id: book.id }));
      setSearchTerm('');
      Swal.fire({
        title: 'Buku Ditemukan',
        text: `Buku: ${book.title}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error', 'Buku dengan barcode/ISBN tersebut tidak ditemukan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!isManualMode && !formData.book_id) {
      return Swal.fire('Error', 'Pilih buku dari inventaris terlebih dahulu', 'error');
    }
    if (isManualMode && !formData.manual_title) {
      return Swal.fire('Error', 'Judul buku manual wajib diisi', 'error');
    }
    if (formData.qty < 1) {
      return Swal.fire('Error', 'Jumlah tidak boleh kurang dari 1', 'error');
    }

    // Check if already in items (if using book_id)
    if (formData.book_id && items.find(item => item.book_id === formData.book_id)) {
      return Swal.fire('Error', 'Buku ini sudah ada dalam daftar antrean', 'warning');
    }

    const newItem = {
      ...formData,
      id: Date.now(), // Local ID for deletion
      display_title: isManualMode ? formData.manual_title : selectedBook?.title,
      display_info: isManualMode ? `Manual (${formData.manual_author || '-'})` : `Stok: ${selectedBook?.stock}`
    };

    setItems([...items, newItem]);

    // Reset form for next item
    setFormData({
      ...formData,
      book_id: '',
      manual_title: '',
      manual_author: '',
      manual_isbn: '',
      qty: 1,
      description: ''
    });
    setSelectedBook(null);
    setSearchTerm('');
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmitBatch = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      await api.post('/books/batch-stock-out', { items });
      Swal.fire({
        title: 'Berhasil',
        text: `${items.length} entri penyusutan stok telah diproses`,
        icon: 'success',
        confirmButtonColor: '#2563EB'
      });
      setItems([]);
      fetchBooks();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal memproses batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (book.isbn && book.isbn.includes(debouncedSearch)) ||
    (book.barcode && book.barcode.includes(debouncedSearch))
  );

  const handleQtyChange = (delta) => {
    const currentQty = parseInt(formData.qty) || 0;
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      setFormData({ ...formData, qty: newQty });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buku Keluar (Penyusutan)</h1>
          <p className="text-sm text-gray-500 mt-1">Pencatatan buku rusak, hilang, atau tidak layak guna</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-rose-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-rose-900">Formulir Penyusutan Stok</h3>
              </div>
            </div>

            <form onSubmit={addItem} className="p-6 space-y-6">

              {/* Manual Entry Toggle */}
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsManualMode(!isManualMode);
                    setSelectedBook(null);
                    setFormData({ ...formData, book_id: '', manual_title: '', manual_author: '', manual_isbn: '' });
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border-2 ${isManualMode
                      ? 'bg-rose-100 border-rose-200 text-rose-700'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                    }`}
                >
                  {isManualMode ? 'Beralih ke Cari Buku' : 'Input Manual (Buku Belum Terdaftar)'}
                </button>
              </div>

              {/* Smart Search / Scan */}
              {!isManualMode ? (
                <div className="space-y-1 relative" ref={dropdownRef}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-semibold text-gray-700">Pilih Buku dari Inventaris <span className="text-red-500">*</span></label>
                  </div>

                  {selectedBook ? (
                    <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
                      <div className="w-16 h-20 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
                        {selectedBook.cover_image ? (
                          <img src={`/storage/${selectedBook.cover_image}`} alt={selectedBook.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookIcon size={24} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 truncate">{selectedBook.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">ISBN: {selectedBook.isbn || '-'} | Sisa Stok: {selectedBook.stock}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedBook(null); setFormData({ ...formData, book_id: '' }); setSearchTerm(''); }}
                        className="p-2 text-gray-400 hover:bg-white hover:text-red-500 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                        title="Ganti Buku"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Ketik judul, ISBN, atau barcode buku..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                          }}
                          onFocus={() => setIsDropdownOpen(true)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                        />
                      </div>

                      {/* Dropdown Options */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto custom-scrollbar">
                          {searchTerm === '' ? (
                            <div className="p-3 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wider">
                              Cari Buku di Inventaris
                            </div>
                          ) : filteredBooks.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              Buku tidak ditemukan.
                            </div>
                          ) : null}

                          {filteredBooks.slice(0, 10).map(book => (
                            <div
                              key={book.id}
                              onClick={() => {
                                setSelectedBook(book);
                                setFormData({ ...formData, book_id: book.id });
                                setSearchTerm('');
                                setIsDropdownOpen(false);
                              }}
                              className="p-3 hover:bg-rose-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-none transition-colors"
                            >
                              <div className="w-10 h-14 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden">
                                {book.cover_image ? <img src={`/storage/${book.cover_image}`} className="w-full h-full object-cover" alt="" /> : <BookIcon size={16} className="text-gray-300" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{book.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">ISBN: {book.isbn || '-'}</span>
                                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">Stok: {book.stock}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Buku <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.manual_title}
                      onChange={(e) => setFormData({ ...formData, manual_title: e.target.value })}
                      placeholder="Masukkan judul buku..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Penulis / Pengarang</label>
                    <input
                      type="text"
                      value={formData.manual_author}
                      onChange={(e) => setFormData({ ...formData, manual_author: e.target.value })}
                      placeholder="Nama penulis..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">ISBN / Barcode</label>
                    <input
                      type="text"
                      value={formData.manual_isbn}
                      onChange={(e) => setFormData({ ...formData, manual_isbn: e.target.value })}
                      placeholder="ISBN (jika ada)..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantity Input */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Kuantitas Keluar <span className="text-red-500">*</span></label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(-1)}
                      className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-l-lg hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      required
                      type="number"
                      min="1"
                      max={selectedBook ? selectedBook.stock : undefined}
                      value={formData.qty}
                      onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || '' })}
                      className="w-full bg-white border-y border-gray-300 py-2.5 text-center text-sm font-semibold outline-none focus:ring-0 focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyChange(1)}
                      className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-r-lg hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Date Input */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Tanggal Kejadian <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Status Input */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Kondisi / Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="rusak">Rusak (Tidak layak guna)</option>
                  <option value="hilang">Hilang (Tidak ditemukan)</option>
                  <option value="basah">Rusak karena Cairan/Basah</option>
                </select>
              </div>

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Kronologi / Keterangan</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors resize-none"
                  placeholder="Ceritakan detail kejadian kerusakan atau kehilangan..."
                  rows="3"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg transition-colors font-semibold text-sm flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
                >
                  <Plus size={18} />
                  Keluarkan Buku
                </button>
              </div>
            </form>

            {/* Pending Items List */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <PackageMinus size={18} className="text-rose-500" />
                    Daftar Antrean Penyusutan ({items.length})
                  </h4>
                  <button
                    onClick={() => setItems([])}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Kosongkan Daftar
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${item.status === 'rusak' ? 'bg-amber-100 text-amber-700' :
                            item.status === 'hilang' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {item.qty}x
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-gray-900">{item.display_title}</h5>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {item.status} • {item.display_info}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  disabled={loading}
                  onClick={handleSubmitBatch}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-xl transition-all font-black text-sm flex justify-center items-center gap-3 shadow-xl shadow-rose-200 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : (
                    <>
                      <AlertTriangle size={20} />
                      KONFIRMASI & PROSES SEMUA ({items.length} BUKU)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Info */}
        <div className="space-y-6">
          <div className="bg-rose-50 rounded-xl p-6 border border-rose-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-rose-900 text-lg">Peringatan Kritis</h3>
            </div>
            <p className="text-rose-700 text-sm leading-relaxed mb-3">
              Tindakan penyusutan ini akan <strong className="font-bold">mengurangi saldo stok</strong> buku secara permanen dari sistem perpustakaan.
            </p>
            <p className="text-rose-700 text-sm leading-relaxed">
              Pastikan buku fisik telah diperiksa dan laporan diverifikasi sebelum mengonfirmasi transaksi ini.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info size={18} className="text-gray-400" />
              Log Keamanan
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">Setiap pengurangan stok dicatat pada Jejak Digital Audit.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">Aktivitas ini tidak dapat dibatalkan secara sepihak.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
