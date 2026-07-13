<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\Book;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Events\BorrowUpdated;
use App\Events\DueDateUpdated;
use App\Events\BorrowReturned;
use App\Models\BorrowHistory;

class BorrowController extends Controller
{
    /**
     * GET /api/borrow - List borrow transactions
     * Admin/Petugas: all transactions
     * Siswa: own transactions only
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = BorrowTransaction::with(['user', 'book.category', 'book.rack']);

        if ($user->role === 'siswa') {
            $query->where('user_id', $user->id);
        } else {
            // Admin/Petugas can filter
            if ($request->has('user_id') && $request->user_id) {
                $query->where('user_id', $request->user_id);
            }
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }
            if ($request->has('search') && $request->search) {
                $query->whereHas('user', function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('nim', 'like', '%' . $request->search . '%');
                })->orWhereHas('book', function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%');
                });
            }
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json(['success' => true, 'data' => $transactions]);
    }

    /**
     * POST /api/borrow - Student creates a borrow request
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'book_id' => 'required|exists:books,id',
            'notes'   => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $book = Book::findOrFail($request->book_id);

        // Check stock
        if ($book->stock <= 0) {
            return response()->json(['success' => false, 'message' => 'Stok buku tidak tersedia'], 400);
        }

        // Check if user already has active borrow for same book
        $existing = BorrowTransaction::where('user_id', $user->id)
            ->where('book_id', $request->book_id)
            ->whereIn('status', ['pending', 'approved', 'borrowed'])
            ->exists();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Anda sudah meminjam buku ini'], 400);
        }

        $borrow = BorrowTransaction::create([
            'user_id'     => $user->id,
            'book_id'     => $request->book_id,
            'borrow_date' => Carbon::today(),
            'due_date'    => Carbon::today()->addDays(7),
            'status'      => 'pending',
            'notes'       => $request->notes,
        ]);

        $borrow->load(['user', 'book']);

        return response()->json(['success' => true, 'message' => 'Permintaan peminjaman berhasil dikirim', 'data' => $borrow], 201);
    }

    /**
     * GET /api/borrow/{id} - Show single transaction
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $borrow = BorrowTransaction::with(['user', 'book.category', 'book.rack'])->findOrFail($id);

        if ($user->role === 'siswa' && $borrow->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        return response()->json(['success' => true, 'data' => $borrow]);
    }

    /**
     * PUT /api/borrow/{id}/approve - Petugas/Admin approve borrow
     */
    public function approve(Request $request, $id)
    {
        $borrow = BorrowTransaction::findOrFail($id);
        $user   = $request->user();

        if ($borrow->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Status peminjaman tidak bisa diubah'], 400);
        }

        $book = Book::findOrFail($borrow->book_id);
        if ($book->stock <= 0) {
            return response()->json(['success' => false, 'message' => 'Stok buku tidak tersedia'], 400);
        }

        $borrow->update([
            'status'       => 'borrowed',
            'borrow_date'  => Carbon::today(),
            'due_date'     => Carbon::today()->addDays(7),
            'petugas_name' => $user->name,
        ]);

        // Reduce stock
        $book->decrement('stock');

        return response()->json(['success' => true, 'message' => 'Peminjaman disetujui', 'data' => $borrow->load(['user', 'book'])]);
    }

    /**
     * PUT /api/borrow/{id}/reject - Petugas/Admin reject borrow
     */
    public function reject(Request $request, $id)
    {
        $borrow = BorrowTransaction::findOrFail($id);

        if ($borrow->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Hanya bisa menolak status pending'], 400);
        }

        $borrow->update([
            'status'       => 'rejected',
            'petugas_name' => $request->user()->name,
            'notes'        => $request->notes ?? $borrow->notes,
        ]);

        return response()->json(['success' => true, 'message' => 'Peminjaman ditolak']);
    }

    /**
     * PUT /api/borrow/{id}/return - Petugas/Admin mark as returned
     */
    public function returnBook(Request $request, $id)
    {
        $borrow = BorrowTransaction::findOrFail($id);

        if (!in_array($borrow->status, ['borrowed', 'overdue'])) {
            return response()->json(['success' => false, 'message' => 'Buku belum dalam status dipinjam'], 400);
        }

        $now = Carbon::today();
        $dueDate = Carbon::parse($borrow->due_date);
        $daysLate = $now->diffInDays($dueDate, false);
        $fines = 0;
        if ($daysLate < 0) {
            $fines = abs($daysLate) * 1000; // 1000 per day
        }

        $borrow->update([
            'status'       => 'returned',
            'return_date'  => $now,
            'petugas_name' => $request->user()->name,
            'notes'        => $request->notes ? $borrow->notes . " | Denda: " . $fines : $borrow->notes,
        ]);

        // Restore stock
        Book::where('id', $borrow->book_id)->increment('stock');

        $data = $borrow->load(['user', 'book']);
        broadcast(new BorrowReturned($data, "Buku telah dikembalikan. " . ($fines > 0 ? "Denda: Rp $fines" : "")))->toOthers();

        return response()->json([
            'success' => true, 
            'message' => 'Pengembalian berhasil dicatat', 
            'data' => $data,
            'fines' => $fines
        ]);
    }

    /**
     * PUT /api/borrow/{id}/confirm - Alias/Wrapper for approve with specific event
     */
    public function confirm(Request $request, $id)
    {
        $borrow = BorrowTransaction::findOrFail($id);
        $user   = $request->user();

        if ($borrow->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Hanya bisa konfirmasi status booking/pending'], 400);
        }

        $book = Book::findOrFail($borrow->book_id);
        if ($book->stock <= 0) {
            return response()->json(['success' => false, 'message' => 'Stok buku tidak tersedia'], 400);
        }

        $borrow->update([
            'status'       => 'borrowed',
            'borrow_date'  => Carbon::today(),
            'due_date'     => Carbon::today()->addDays(7),
            'petugas_name' => $user->name,
        ]);

        $book->decrement('stock');
        $data = $borrow->load(['user', 'book']);
        broadcast(new BorrowUpdated($data, 'Pinjaman berhasil dikonfirmasi'))->toOthers();

        return response()->json(['success' => true, 'message' => 'Peminjaman berhasil dikonfirmasi', 'data' => $data]);
    }

    /**
     * PUT /api/borrow/{id}/due-date - Update due date with history
     */
    public function updateDueDate(Request $request, $id)
    {
        $transaction = BorrowTransaction::with(['user', 'book'])->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'due_date' => 'required|date|after_or_equal:borrow_date',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $newDueDate = Carbon::parse($request->due_date);
        $oldDueDate = $transaction->due_date;

        // Save history
        BorrowHistory::create([
            'transaction_id' => $transaction->id,
            'old_due_date' => $oldDueDate,
            'new_due_date' => $newDueDate,
            'updated_by' => $request->user()->id,
            'notes' => $request->notes
        ]);
        
        // Determine if still overdue or now on time
        $status = $transaction->status;
        if ($status === 'overdue' && $newDueDate->isAfter(Carbon::today())) {
            $status = 'borrowed';
        } elseif ($status === 'borrowed' && $newDueDate->isBefore(Carbon::today())) {
            $status = 'overdue';
        }

        $transaction->update([
            'due_date' => $newDueDate,
            'status' => $status,
            'updated_by' => $request->user()->id,
            'notes' => $request->notes ?? $transaction->notes
        ]);

        $data = $transaction->load(['user', 'book', 'updater', 'histories.updater']);
        broadcast(new DueDateUpdated($data, 'Tanggal pengembalian diperbarui'))->toOthers();

        return response()->json([
            'success' => true, 
            'message' => 'Tanggal jatuh tempo berhasil diperbarui',
            'data' => $data
        ]);
    }

    /**
     * GET /api/borrow/stats - Statistics for dashboard
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'siswa') {
            return response()->json([
                'success' => true,
                'data' => [
                    'total'    => BorrowTransaction::where('user_id', $user->id)->count(),
                    'borrowed' => BorrowTransaction::where('user_id', $user->id)->whereIn('status', ['borrowed', 'overdue'])->count(),
                    'returned' => BorrowTransaction::where('user_id', $user->id)->where('status', 'returned')->count(),
                    'pending'  => BorrowTransaction::where('user_id', $user->id)->where('status', 'pending')->count(),
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total'    => BorrowTransaction::count(),
                'pending'  => BorrowTransaction::where('status', 'pending')->count(),
                'borrowed' => BorrowTransaction::where('status', 'borrowed')->count(),
                'overdue'  => BorrowTransaction::where('status', 'overdue')->count(),
                'returned' => BorrowTransaction::where('status', 'returned')->count(),
            ]
        ]);
    }

    /**
     * GET /api/borrow/overdue-check - Check and update overdue borrows
     */
    public function overdueCheck()
    {
        $updated = BorrowTransaction::where('status', 'borrowed')
            ->where('due_date', '<', Carbon::today())
            ->update(['status' => 'overdue']);

        return response()->json(['success' => true, 'updated' => $updated]);
    }

    /**
     * PUT /api/borrow/{id}/return-date - Deprecated but keeping for compatibility if needed
     */
    public function updateReturnDate(Request $request, $id)
    {
        return $this->updateDueDate($request, $id);
    }
}
