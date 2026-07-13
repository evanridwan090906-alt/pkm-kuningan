import { useState, useEffect, useRef } from 'react';
import { 
  PackagePlus
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import RestockForm from '../../components/RestockForm';
import SidebarInfo from '../../components/SidebarInfo';
import ModeTabs from '../../components/ModeTabs';

export default function StockIn() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('select');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [racks, setRacks] = useState([]);

  // Refs for focus management
  const manualTitleRef = useRef(null);
  const qtyRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [formData, setFormData] = useState({
    qty: 1,
    date: new Date().toISOString().split('T')[0],
    description: '',
    source: 'Pembelian'
  });

  const [manualBook, setManualBook] = useState({
    title: '',
    author: '',
    isbn: '',
    barcode: '',
    category_id: '',
    rack_id: '',
    publisher: '-',
    year: new Date().getFullYear(),
    stock: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [bookRes, catRes, rackRes] = await Promise.all([
        api.get('/books'),
        api.get('/categories'),
        api.get('/racks')
      ]);
      setBooks(bookRes.data.data || bookRes.data);
      setCategories(catRes.data.data || catRes.data);
      setRacks(rackRes.data.data || rackRes.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (activeTab === 'manual') setTimeout(() => manualTitleRef.current?.focus(), 100);
    else if (activeTab === 'select') setTimeout(() => searchRef.current?.focus(), 100);
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScan = async (code) => {
    setActiveTab('select');
    setLoading(true);
    try {
      const res = await api.get(`/books/barcode/${code}`);
      const book = res.data;
      setSelectedBook(book);
      setSearchTerm('');
      Swal.fire({
        title: 'Buku Ditemukan!',
        text: book.title,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } catch (error) {
      Swal.fire({
        title: 'Buku Baru?',
        text: `Barcode ${code} tidak ditemukan. Input manual?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Manual',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          setManualBook(prev => ({ ...prev, barcode: code }));
          setActiveTab('manual');
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      qty: 1,
      date: new Date().toISOString().split('T')[0],
      description: '',
      source: 'Pembelian'
    });
    setManualBook({
      title: '',
      author: '',
      isbn: '',
      barcode: '',
      category_id: '',
      rack_id: '',
      publisher: '-',
      year: new Date().getFullYear(),
      stock: 0
    });
    setSelectedBook(null);
    setSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'manual' && !manualBook.title) return Swal.fire('Error', 'Judul buku wajib!', 'error');
    if (!selectedBook && activeTab !== 'manual') return Swal.fire('Error', 'Pilih buku!', 'error');
    if (!formData.qty || formData.qty < 1) return Swal.fire('Error', 'Jumlah minimal 1!', 'error');

    setLoading(true);
    try {
      let bookId = selectedBook?.id;
      if (activeTab === 'manual') {
        const bookRes = await api.post('/books', { ...manualBook, stock: 0 });
        bookId = bookRes.data.id;
      }
      await api.post('/books/stock-in', { ...formData, book_id: bookId });
      Swal.fire('Berhasil!', 'Stok buku telah diperbarui.', 'success');
      resetForm();
      fetchInitialData();
      setActiveTab('select');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (book.isbn && book.isbn.includes(debouncedSearch)) ||
    (book.barcode && book.barcode.includes(debouncedSearch))
  );

  return (
    <div className="w-full px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <PackagePlus size={24} />
           </div>
           <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">Buku Masuk</h1>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Manajemen Gudang & Stok</p>
           </div>
        </div>
        
        <ModeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <RestockForm 
          activeTab={activeTab}
          handleSubmit={handleSubmit}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          filteredBooks={filteredBooks}
          searchRef={searchRef}
          dropdownRef={dropdownRef}
          handleScan={handleScan}
          setActiveTab={setActiveTab}
          manualTitleRef={manualTitleRef}
          manualBook={manualBook}
          setManualBook={setManualBook}
          categories={categories}
          racks={racks}
          formData={formData}
          setFormData={setFormData}
          qtyRef={qtyRef}
          loading={loading}
        />
        
        <SidebarInfo activeTab={activeTab} />
      </div>
    </div>
  );
}



