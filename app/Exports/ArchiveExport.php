<?php

namespace App\Exports;

use App\Models\Archive;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ArchiveExport implements FromCollection, WithHeadings, WithMapping
{
    protected $type;

    public function __construct($type = null)
    {
        $this->type = $type;
    }

    public function collection()
    {
        $query = Archive::with(['book', 'user']);

        if ($this->type) {
            $query->where('type', $this->type);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Judul Buku',
            'Tipe',
            'Jumlah',
            'Tanggal',
            'Dicatat Oleh',
            'Catatan'
        ];
    }

    public function map($archive): array
    {
        return [
            $archive->id,
            $archive->book?->title ?? '-',
            ucfirst($archive->type),
            $archive->quantity,
            $archive->date,
            $archive->user?->name ?? '-',
            $archive->notes ?? '-'
        ];
    }
}
