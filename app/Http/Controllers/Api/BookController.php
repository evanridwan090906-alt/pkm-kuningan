<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Events\BookCreated;
use App\Events\BookUpdated;
use App\Events\LibraryDataUpdated;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['category', 'rack']);

        if ($request->filled('rack_id')) {
            $query->where('rack_id', $request->rack_id);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('author', 'like', '%' . $request->search . '%')
                  ->orWhere('isbn', 'like', '%' . $request->search . '%')
                  ->orWhere('barcode', 'like', '%' . $request->search . '%');
            });
        }

        // If paginate param is set, return paginated (for student catalog)
        if ($request->boolean('paginate', false) || $request->filled('page')) {
            return response()->json(['data' => $query->paginate(15)]);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function findByIsbn($isbn)
    {
        $book = Book::with('category')->where('isbn', $isbn)->first();
        if (!$book) {
            return response()->json(['message' => 'Buku tidak ditemukan'], 404);
        }
        return response()->json($book);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'rack_id' => 'nullable|exists:racks,id',
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'required|string|max:255',
            'year' => 'required|integer',
            'isbn' => 'required|string|unique:books,isbn',
            'barcode' => 'required|string|unique:books,barcode',
            'stock' => 'required|integer|min:0',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'ebook_file' => 'nullable|mimes:pdf,epub|max:51200',
            'ebook_link' => 'nullable|url',
        ]);

        $data = $request->only([
            'category_id', 'rack_id', 'title', 'author', 'publisher', 
            'year', 'isbn', 'barcode', 'stock', 'status', 'description', 'ebook_link'
        ]);
        
        $data['created_by'] = $request->user()->id;

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('books/covers', 'public');
        }

        if ($request->hasFile('ebook_file')) {
            $data['ebook_file'] = $request->file('ebook_file')->store('books/ebooks', 'public');
        }

        $book = Book::create($data);
        
        broadcast(new BookCreated($book->load(['category', 'rack'])))->toOthers();
        broadcast(new LibraryDataUpdated('book', 'Buku baru ditambahkan', $book))->toOthers();

        return response()->json(['success' => true, 'data' => $book], 201);
    }

    public function show(Book $book)
    {
        return response()->json($book->load(['category', 'rack']));
    }

    public function update(Request $request, Book $book)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'rack_id' => 'nullable|exists:racks,id',
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'required|string|max:255',
            'year' => 'required|integer',
            'isbn' => 'required|string|unique:books,isbn,' . $book->id,
            'barcode' => 'required|string|unique:books,barcode,' . $book->id,
            'stock' => 'required|integer|min:0',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'ebook_file' => 'nullable|mimes:pdf,epub|max:51200',
            'ebook_link' => 'nullable|url',
        ]);

        $data = $request->only([
            'category_id', 'rack_id', 'title', 'author', 'publisher', 
            'year', 'isbn', 'barcode', 'stock', 'status', 'description', 'ebook_link'
        ]);

        if ($request->hasFile('cover_image')) {
            if ($book->cover_image) Storage::disk('public')->delete($book->cover_image);
            $data['cover_image'] = $request->file('cover_image')->store('books/covers', 'public');
        }

        if ($request->hasFile('ebook_file')) {
            if ($book->ebook_file) Storage::disk('public')->delete($book->ebook_file);
            $data['ebook_file'] = $request->file('ebook_file')->store('books/ebooks', 'public');
        }

        $book->update($data);
        
        broadcast(new BookUpdated($book->load(['category', 'rack'])))->toOthers();
        broadcast(new LibraryDataUpdated('book', 'Data buku diperbarui', $book))->toOthers();

        return response()->json(['success' => true, 'data' => $book]);
    }

    public function destroy(Book $book)
    {
        if ($book->cover_image) Storage::disk('public')->delete($book->cover_image);
        if ($book->ebook_file) Storage::disk('public')->delete($book->ebook_file);
        $bookId = $book->id;
        $book->delete();
        
        broadcast(new LibraryDataUpdated('book', 'Buku dihapus', ['id' => $bookId, 'deleted' => true]))->toOthers();

        return response()->json(null, 204);
    }

    public function globalSearch(Request $request)
    {
        $search = $request->search;
        if (!$search) return response()->json(['books' => [], 'members' => []]);

        $books = Book::with('category')
            ->where('title', 'like', "%$search%")
            ->orWhere('isbn', 'like', "%$search%")
            ->orWhere('barcode', 'like', "%$search%")
            ->take(5)
            ->get();

        $members = \App\Models\Transaction::where('borrower_name', 'like', "%$search%")
            ->select('borrower_name')
            ->distinct()
            ->take(5)
            ->get()
            ->map(function($item) {
                return ['name' => $item->borrower_name];
            });

        return response()->json([
            'books' => $books,
            'members' => $members
        ]);
    }
}
