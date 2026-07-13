<!DOCTYPE html>
<html>
<head>
    <title>Laporan Arsip Buku</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; color: #1e40af; }
        .header p { margin: 5px 0; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f3f4f6; color: #374151; font-weight: bold; text-align: left; padding: 10px; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .type-masuk { background-color: #d1fae5; color: #065f46; }
        .type-keluar { background-color: #dbeafe; color: #1e40af; }
        .type-rusak { background-color: #fef3c7; color: #92400e; }
        .type-hilang { background-color: #fee2e2; color: #991b1b; }
        .footer { margin-top: 30px; text-align: right; color: #6b7280; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>CASPER Smart Library</h2>
        <p>Laporan Arsip Buku</p>
        @if($type)
            <p>Filter Tipe: {{ ucfirst($type) }}</p>
        @endif
        <p>Dicetak pada: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Buku</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
                <th>Dicatat Oleh</th>
            </tr>
        </thead>
        <tbody>
            @foreach($archives as $arc)
            <tr>
                <td><strong>{{ $arc->book?->title ?? '-' }}</strong></td>
                <td>
                    <span class="status type-{{ $arc->type }}">
                        {{ $arc->type }}
                    </span>
                </td>
                <td style="text-align: center;">{{ $arc->quantity }}</td>
                <td>{{ \Carbon\Carbon::parse($arc->date)->format('d/m/Y') }}</td>
                <td>{{ $arc->user?->name ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>&copy; {{ date('Y') }} CASPER Smart Library - Sistem Pengarsipan Perpustakaan Sekolah</p>
    </div>
</body>
</html>
