<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionExport implements FromCollection, WithHeadings, WithMapping
{
    protected $status;

    public function __construct($status = null)
    {
        $this->status = $status;
    }

    public function collection()
    {
        $query = Transaction::with('book');

        if ($this->status) {
            $query->where('status', $this->status);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Peminjam',
            'Judul Buku',
            'Tgl Pinjam',
            'Batas Kembali',
            'Tgl Kembali',
            'Status',
            'Catatan'
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->borrower_name,
            $transaction->book?->title ?? '-',
            $transaction->borrow_date,
            $transaction->return_date,
            $transaction->actual_return_date ?? '-',
            ucfirst($transaction->status),
            $transaction->notes ?? '-'
        ];
    }
}
