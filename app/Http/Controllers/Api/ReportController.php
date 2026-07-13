<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\Ebook;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BorrowReportExport;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function getBorrowReport(Request $request)
    {
        $query = BorrowTransaction::with(['user', 'book']);

        // Filter by Date Range
        if ($request->filter === 'harian') {
            $query->whereDate('borrow_date', Carbon::today());
        } elseif ($request->filter === 'mingguan') {
            $query->whereBetween('borrow_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($request->filter === 'bulanan') {
            $query->whereMonth('borrow_date', Carbon::now()->month)
                  ->whereYear('borrow_date', Carbon::now()->year);
        } elseif ($request->filter === 'tahunan') {
            $query->whereYear('borrow_date', Carbon::now()->year);
        }

        // Filter by Status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by Jurusan (if user has jurusan)
        if ($request->jurusan) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('jurusan', $request->jurusan);
            });
        }

        $reports = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $reports
        ]);
    }

    public function getReturnReport(Request $request)
    {
        $query = BorrowTransaction::with(['user', 'book'])
            ->whereNotNull('return_date');

        // Similar filters as borrow
        if ($request->filter === 'harian') {
            $query->whereDate('return_date', Carbon::today());
        }

        if ($request->jurusan) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('jurusan', $request->jurusan);
            });
        }

        $reports = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $reports
        ]);
    }

    public function getEbookReport()
    {
        $totalEbooks = Ebook::count();
        $totalDownloads = Ebook::sum('download_count');
        $popularEbooks = Ebook::orderBy('download_count', 'desc')->take(5)->get();
        $latestEbooks = Ebook::latest()->take(5)->get();

        return response()->json([
            'status' => 'success',
            'stats' => [
                'total_ebooks' => $totalEbooks,
                'total_downloads' => $totalDownloads,
            ],
            'popular_ebooks' => $popularEbooks,
            'latest_ebooks' => $latestEbooks
        ]);
    }

    public function exportBorrowExcel(Request $request)
    {
        return Excel::download(new BorrowReportExport($request->all()), 'laporan_peminjaman.xlsx');
    }

    public function exportBorrowPdf(Request $request)
    {
        $query = BorrowTransaction::with(['user', 'book']);
        
        // Apply same filters
        if ($request->filter === 'harian') {
            $query->whereDate('borrow_date', Carbon::today());
        }
        
        $data = $query->latest()->get();
        
        $pdf = Pdf::loadView('reports.borrow_pdf', [
            'data' => $data,
            'title' => 'Laporan Peminjaman Buku',
            'date' => Carbon::now()->format('d F Y')
        ]);

        return $pdf->download('laporan_peminjaman.pdf');
    }
}
