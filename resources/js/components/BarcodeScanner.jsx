import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        // Silent error to avoid console spam
      }
    );

    return () => {
      scanner.clear().catch(e => console.error('Error clearing scanner:', e));
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Scan Barcode / ISBN</h3>
            <p className="text-sm text-gray-500 mt-0.5">Arahkan kamera ke barcode buku</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl shadow-sm transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div id="reader" className="overflow-hidden rounded-2xl border-2 border-dashed border-gray-200"></div>
          <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
              <span className="animate-pulse">?</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Pastikan pencahayaan cukup dan barcode terlihat jelas di dalam kotak scan untuk hasil terbaik.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">CASPER Smart Library System</p>
        </div>
      </div>
    </div>
  );
}
