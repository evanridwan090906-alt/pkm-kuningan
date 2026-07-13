<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Book;
use App\Models\Archive;
use Illuminate\Http\Request;
use App\Events\LibraryDataUpdated;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index()
    {
        return response()->json(Transaction::with(['book', 'user'])->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'borrower_name' => 'required|string|max:255',
            'borrow_date' => 'required|date',
            'return_date' => 'required|date|after_or_equal:borrow_date',
            'notes' => 'nullable|string'
        ]);

        $book = Book::findOrFail($request->book_id);
        if ($book->stock < 1) {
            return response()->json(['message' => 'Buku tidak tersedia/habis.'], 400);
        }

        $transaction = Transaction::create([
            'book_id' => $request->book_id,
            'user_id' => $request->user()->id,
            'borrower_name' => $request->borrower_name,
            'borrow_date' => $request->borrow_date,
            'return_date' => $request->return_date,
            'status' => 'dipinjam',
            'notes' => $request->notes
        ]);

        $book->decrement('stock');

        // Log to Archive
        Archive::create([
            'book_id' => $book->id,
            'user_id' => Auth::id() ?? 1,
            'type' => 'keluar',
            'status' => 'dipinjam',
            'qty' => 1,
            'date' => $request->borrow_date,
            'description' => "Dipinjam oleh: {$request->borrower_name}. Catatan: {$request->notes}",
        ]);
        
        broadcast(new LibraryDataUpdated('transaction', 'Transaksi peminjaman baru ditambahkan', $transaction->load(['book', 'user'])))->toOthers();

        return response()->json($transaction->load(['book', 'user']), 201);
    }

    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load(['book', 'user']));
    }

    public function update(Request $request, Transaction $transaction)
    {
        $request->validate([
            'status' => 'required|in:dipinjam,dikembalikan,terlambat',
            'actual_return_date' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        // If changing status from dipinjam to dikembalikan or terlambat (returned)
        if ($transaction->status === 'dipinjam' && in_array($request->status, ['dikembalikan', 'terlambat'])) {
            $transaction->book->increment('stock');
        } 
        // If reverting status (less likely but possible)
        else if (in_array($transaction->status, ['dikembalikan', 'terlambat']) && $request->status === 'dipinjam') {
            $transaction->book->decrement('stock');
        }

        // Log to Archive if status changes to returned
        if ($transaction->status === 'dipinjam' && in_array($request->status, ['dikembalikan', 'terlambat'])) {
            Archive::create([
                'book_id' => $transaction->book_id,
                'user_id' => Auth::id() ?? 1,
                'type' => 'masuk',
                'status' => 'dikembalikan',
                'qty' => 1,
                'date' => $request->actual_return_date ?? now()->toDateString(),
                'description' => "Dikembalikan oleh: {$transaction->borrower_name}. Status: {$request->status}",
            ]);
        }

        $transaction->update([
            'status' => $request->status,
            'actual_return_date' => $request->actual_return_date,
            'notes' => $request->notes
        ]);
        
        broadcast(new LibraryDataUpdated('transaction', 'Status transaksi diperbarui', $transaction->load(['book', 'user'])))->toOthers();

        return response()->json($transaction->load(['book', 'user']));
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->status === 'dipinjam') {
            $transaction->book->increment('stock');
        }
        $transactionId = $transaction->id;
        $transaction->delete();
        
        broadcast(new LibraryDataUpdated('transaction', 'Transaksi dihapus', ['id' => $transactionId, 'deleted' => true]))->toOthers();

        return response()->json(null, 204);
    }
}
