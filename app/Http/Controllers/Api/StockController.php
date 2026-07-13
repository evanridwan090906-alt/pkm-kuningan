<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Archive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockController extends Controller
{
    /**
     * Get stock history
     */
    public function history(Request $request)
    {
        $query = Archive::with(['book', 'user'])->orderBy('created_at', 'desc');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Stock In (Buku Masuk)
     */
    public function stockIn(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'qty' => 'required|integer|min:1',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $book = Book::findOrFail($request->book_id);
            
            // Log entry
            Archive::create([
                'book_id' => $book->id,
                'user_id' => Auth::id() ?? 1, // Fallback if no auth for testing
                'type' => 'masuk',
                'qty' => $request->qty,
                'date' => $request->date,
                'description' => $request->description,
            ]);

            // Update stock
            $book->increment('stock', $request->qty);

            return response()->json([
                'message' => 'Stock added successfully',
                'current_stock' => $book->stock
            ]);
        });
    }

    /**
     * Stock Out (Buku Keluar)
     */
    public function stockOut(Request $request)
    {
        $request->validate([
            'book_id' => 'nullable|exists:books,id',
            'manual_title' => 'required_without:book_id|nullable|string|max:255',
            'manual_author' => 'nullable|string|max:255',
            'manual_isbn' => 'nullable|string|max:255',
            'qty' => 'required|integer|min:1',
            'status' => 'required|in:hilang,rusak,basah',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $book = null;
            if ($request->book_id) {
                $book = Book::findOrFail($request->book_id);
                if ($book->stock < $request->qty) {
                    return response()->json(['message' => 'Stok tidak mencukupi untuk pengurangan ini'], 422);
                }
                $book->decrement('stock', $request->qty);
            }

            // Log entry in Archives
            Archive::create([
                'book_id' => $book ? $book->id : null,
                'manual_title' => $request->manual_title,
                'manual_isbn' => $request->manual_isbn,
                'manual_author' => $request->manual_author,
                'user_id' => Auth::id() ?? 1,
                'type' => 'keluar',
                'status' => $request->status,
                'qty' => $request->qty,
                'date' => $request->date,
                'description' => $request->description,
            ]);

            return response()->json([
                'message' => 'Penyusutan stok berhasil dicatat' . ($book ? '' : ' (Entri Manual)'),
                'current_stock' => $book ? $book->stock : null
            ]);
        });
    }

    /**
     * Batch Stock Out (Multiple items)
     */
    public function batchStockOut(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.book_id' => 'nullable|exists:books,id',
            'items.*.manual_title' => 'required_without:items.*.book_id|nullable|string|max:255',
            'items.*.manual_author' => 'nullable|string|max:255',
            'items.*.manual_isbn' => 'nullable|string|max:255',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.status' => 'required|in:hilang,rusak,basah',
            'items.*.date' => 'required|date',
            'items.*.description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            foreach ($request->items as $item) {
                $book = null;
                if (isset($item['book_id']) && $item['book_id']) {
                    $book = Book::findOrFail($item['book_id']);
                    if ($book->stock < $item['qty']) {
                        throw new \Exception("Stok buku '{$book->title}' tidak mencukupi.");
                    }
                    $book->decrement('stock', $item['qty']);
                }

                Archive::create([
                    'book_id' => $book ? $book->id : null,
                    'manual_title' => $item['manual_title'] ?? null,
                    'manual_isbn' => $item['manual_isbn'] ?? null,
                    'manual_author' => $item['manual_author'] ?? null,
                    'user_id' => Auth::id() ?? 1,
                    'type' => 'keluar',
                    'status' => $item['status'],
                    'qty' => $item['qty'],
                    'date' => $item['date'],
                    'description' => $item['description'] ?? null,
                ]);
            }

            return response()->json(['message' => 'Batch penyusutan berhasil diproses']);
        });
    }

    /**
     * Lookup book by barcode/ISBN
     */
    public function barcodeLookup($code)
    {
        $book = Book::where('barcode', $code)
                    ->orWhere('isbn', $code)
                    ->first();

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        return response()->json($book);
    }

    /**
     * Statistics for dashboard
     */
    public function stats()
    {
        $lowStock = Book::where('stock', '<', 5)->get();
        
        $mostOut = Archive::where('type', 'keluar')
            ->select('book_id', DB::raw('SUM(qty) as total_out'))
            ->groupBy('book_id')
            ->orderBy('total_out', 'desc')
            ->with('book')
            ->take(5)
            ->get();

        return response()->json([
            'low_stock' => $lowStock,
            'most_out' => $mostOut
        ]);
    }
}
