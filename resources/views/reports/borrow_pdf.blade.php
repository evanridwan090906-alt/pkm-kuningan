<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 20px; }
        .header p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #1d58d8; color: white; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: right; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CASPER Smart Library</h1>
        <p>Laporan Peminjaman Buku Perpustakaan</p>
        <p>Tanggal Cetak: {{ $date }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>NISN</th>
                <th>Judul Buku</th>
                <th>Tgl Pinjam</th>
                <th>Due Date</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->user->name ?? '-' }}</td>
                <td>{{ $item->user->nisn ?? '-' }}</td>
                <td>{{ $item->book->title ?? '-' }}</td>
                <td>{{ $item->borrow_date }}</td>
                <td>{{ $item->due_date }}</td>
                <td>{{ ucfirst($item->status) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dicetak otomatis oleh Sistem CASPER Smart Library
    </div>
</body>
</html>
