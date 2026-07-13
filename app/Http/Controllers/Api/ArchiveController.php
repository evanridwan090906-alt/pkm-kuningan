<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Archive;
use App\Models\Book;
use Illuminate\Http\Request;
use App\Events\LibraryDataUpdated;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $query = Archive::with(['book', 'user'])->latest();

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('page')) {
            return response()->json($query->paginate(10));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'type' => 'required|in:masuk,keluar,rusak,hilang',
            'quantity' => 'required|integer|min:1',
            'date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $archive = Archive::create([
            'book_id' => $request->book_id,
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'quantity' => $request->quantity,
            'date' => $request->date,
            'notes' => $request->notes
        ]);

        // Update book stock
        $book = Book::find($request->book_id);
        if ($request->type === 'masuk') {
            $book->increment('stock', $request->quantity);
        } else {
            $book->decrement('stock', $request->quantity);
        }

        broadcast(new LibraryDataUpdated('archive', 'Data arsip buku ditambahkan', $archive->load(['book', 'user'])))->toOthers();

        return response()->json($archive->load(['book', 'user']), 201);
    }

    public function show(Archive $archive)
    {
        return response()->json($archive->load(['book', 'user']));
    }

    public function update(Request $request, Archive $archive)
    {
        return response()->json(['message' => 'Archive updates are not allowed to preserve history integrity.'], 403);
    }

    public function destroy(Archive $archive)
    {
        // Revert stock before deleting
        $book = $archive->book;
        if ($archive->type === 'masuk') {
            $book->decrement('stock', $archive->quantity);
        } else {
            $book->increment('stock', $archive->quantity);
        }
        
        $archiveId = $archive->id;
        $archive->delete();
        
        broadcast(new LibraryDataUpdated('archive', 'Data arsip dihapus', ['id' => $archiveId, 'deleted' => true]))->toOthers();

        return response()->json(null, 204);
    }
}
