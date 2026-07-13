<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Archive;
use App\Exports\TransactionExport;
use App\Exports\ArchiveExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function exportTransactionsExcel(Request $request)
    {
        $status = $request->query('status');
        return Excel::download(new TransactionExport($status), 'laporan-transaksi.xlsx');
    }

    public function exportTransactionsPdf(Request $request)
    {
        $status = $request->query('status');
        $query = Transaction::with('book');

        if ($status) {
            $query->where('status', $status);
        }

        $transactions = $query->get();
        
        $pdf = Pdf::loadView('exports.transactions-pdf', compact('transactions', 'status'));
        
        return $pdf->download('laporan-transaksi.pdf');
    }

    public function exportArchivesExcel(Request $request)
    {
        $type = $request->query('type');
        return Excel::download(new ArchiveExport($type), 'laporan-arsip.xlsx');
    }

    public function exportArchivesPdf(Request $request)
    {
        $type = $request->query('type');
        $query = Archive::with(['book', 'user']);

        if ($type) {
            $query->where('type', $type);
        }

        $archives = $query->get();
        
        $pdf = Pdf::loadView('exports.archives-pdf', compact('archives', 'type'));
        
        return $pdf->download('laporan-arsip.pdf');
    }
}
