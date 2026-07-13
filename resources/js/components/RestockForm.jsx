import { Search, Loader2, CheckCircle2, Box, Calendar, X, Book as BookIcon, ArrowRight } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import QuantityInput from './QuantityInput';

export default function RestockForm({ 
  activeTab, 
  handleSubmit, 
  selectedBook, 
  setSelectedBook, 
  searchTerm, 
  setSearchTerm, 
  isDropdownOpen, 
  setIsDropdownOpen, 
  filteredBooks, 
  searchRef, 
  dropdownRef, 
  handleScan, 
  setActiveTab,
  manualTitleRef,
  manualBook,
  setManualBook,
  categories,
  racks,
  formData,
  setFormData,
  qtyRef,
  loading
}) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* --- STEP 1: IDENTIFICATION --- */}
          <div className="space-y-4">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                Identifikasi Buku
             </h3>

              {activeTab === 'select' && (
                <div className="space-y-3" ref={dropdownRef}>
                  {selectedBook ? (
                    <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center gap-4 relative group">
                      <div className="w-14 h-20 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {selectedBook.cover_image ? (
                          <img src={`/storage/${selectedBook.cover_image}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <BookIcon size={24} className="text-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-gray-900 truncate">{selectedBook.title}</h4>
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5">{selectedBook.author}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] font-black bg-white text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">STOK: {selectedBook.stock}</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSelectedBook(null)}
                        className="p-2.5 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm transition-all border border-gray-100"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Cari Judul, ISBN, atau Barcode..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm placeholder:font-medium"
                      />
                      {isDropdownOpen && filteredBooks.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                          {filteredBooks.map(book => (
                            <div 
                              key={book.id} 
                              onClick={() => { setSelectedBook(book); setIsDropdownOpen(false); }}
                              className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                            >
                              <div className="w-8 h-12 bg-gray-50 rounded-md flex-shrink-0 flex items-center justify-center border border-gray-100">
                                {book.cover_image ? <img src={`/storage/${book.cover_image}`} className="w-full h-full object-cover rounded-md" alt="" /> : <BookIcon size={16} className="text-gray-200" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-gray-900 truncate">{book.title}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">ISBN: {book.isbn || '-'}</p>
                              </div>
                              <ArrowRight size={14} className="text-gray-300" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'scan' && (
                <div className="rounded-3xl overflow-hidden aspect-video relative border-2 border-gray-100 shadow-inner">
                    <BarcodeScanner onScan={handleScan} onClose={() => setActiveTab('select')} />
                </div>
              )}

              {activeTab === 'manual' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Buku *</label>
                    <input 
                      ref={manualTitleRef}
                      required 
                      type="text" 
                      placeholder="Judul buku..."
                      value={manualBook.title}
                      onChange={e => setManualBook({...manualBook, title: e.target.value})}
                      className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Penulis *</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Nama penulis..."
                        value={manualBook.author}
                        onChange={e => setManualBook({...manualBook, author: e.target.value})}
                        className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ISBN</label>
                      <input 
                        type="text" 
                        placeholder="ISBN..."
                        value={manualBook.isbn}
                        onChange={e => setManualBook({...manualBook, isbn: e.target.value})}
                        className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori *</label>
                      <select 
                        required 
                        value={manualBook.category_id}
                        onChange={e => setManualBook({...manualBook, category_id: e.target.value})}
                        className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm appearance-none"
                      >
                        <option value="">Pilih</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rak *</label>
                      <select 
                        required 
                        value={manualBook.rack_id}
                        onChange={e => setManualBook({...manualBook, rack_id: e.target.value})}
                        className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm appearance-none"
                      >
                        <option value="">Pilih</option>
                        {racks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* --- STEP 2: QUANTITY & DATE --- */}
          <div className="pt-8 border-t border-gray-100 space-y-6">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                Detail Restock
             </h3>

             <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Box size={14} /> Jumlah Stok *
                    </label>
                    <QuantityInput 
                        value={formData.qty} 
                        onChange={(val) => setFormData({...formData, qty: val})} 
                    />
                </div>
                
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Calendar size={14} /> Tanggal Masuk
                    </label>
                    <input 
                      required 
                      type="date" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
                    />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catatan Tambahan</label>
                <input 
                  type="text" 
                  placeholder="Opsional..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
                />
             </div>
          </div>

          {/* Submit Button - Sticky on Mobile */}
          <div className="md:relative fixed bottom-0 left-0 right-0 p-4 md:p-0 bg-white md:bg-transparent border-t md:border-none z-40">
              <button
                disabled={loading || (activeTab === 'select' && !selectedBook)}
                type="submit"
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm md:text-base transition-all transform active:scale-[0.98] shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                {activeTab === 'manual' ? 'Daftarkan & Simpan' : 'Simpan Buku'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
