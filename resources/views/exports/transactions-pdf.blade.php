<!DOCTYPE html>
<html>
<head>
    <title>Laporan Transaksi</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; color: #1e40af; }
        .header p { margin: 5px 0; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f3f4f6; color: #374151; font-weight: bold; text-align: left; padding: 10px; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .status-dipinjam { background-color: #dbeafe; color: #1e40af; }
        .status-dikembalikan { background-color: #d1fae5; color: #065f46; }
        .status-terlambat { background-color: #fee2e2; color: #991b1b; }
        .footer { margin-top: 30px; text-align: right; color: #6b7280; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>CASPER Smart Library</h2>
        <p>Laporan Transaksi Peminjaman Buku</p>
        @if($status)
            <p>Filter Status: {{ ucfirst($status) }}</p>
        @endif
        <p>Dicetak pada: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Peminjam</th>
                <th>Buku</th>
                <th>Tgl Pinjam</th>
                <th>Batas</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $trx)
            <tr>
                <td><strong>{{ $trx->borrower_name }}</strong></td>
                <td>{{ $trx->book?->title ?? '-' }}</td>
                <td>{{ \Carbon\Carbon::parse($trx->borrow_date)->format('d/m/Y') }}</td>
                <td>{{ \Carbon\Carbon::parse($trx->return_date)->format('d/m/Y') }}</td>
                <td>
                    <span class="status status-{{ $trx->status }}">
                        {{ $trx->status }}
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>&copy; {{ date('Y') }} CASPER Smart Library - Sistem Pengarsipan Perpustakaan Sekolah</p>
    </div>
</body>
</html>
