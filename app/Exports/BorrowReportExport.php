<?php

namespace App\Exports;

use App\Models\BorrowTransaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class BorrowReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = BorrowTransaction::with(['user', 'book']);

        if (isset($this->filters['filter'])) {
            if ($this->filters['filter'] === 'harian') {
                $query->whereDate('borrow_date', Carbon::today());
            } elseif ($this->filters['filter'] === 'mingguan') {
                $query->whereBetween('borrow_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
            }
            // Add other filters as in controller
        }

        return $query->latest()->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Siswa',
            'NISN',
            'Judul Buku',
            'Tanggal Pinjam',
            'Tanggal Jatuh Tempo',
            'Status',
            'Petugas'
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->user->name ?? '-',
            $transaction->user->nisn ?? '-',
            $transaction->book->title ?? '-',
            $transaction->borrow_date,
            $transaction->due_date,
            ucfirst($transaction->status),
            $transaction->petugas_name ?? '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '1d58d8']]],
        ];
    }
}
