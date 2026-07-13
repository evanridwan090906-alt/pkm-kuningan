<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ebook;
use App\Models\EbookDownload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use App\Events\LibraryDataUpdated;

class EbookController extends Controller
{
    /**
     * GET /api/ebooks - List all ebooks (filtered by access for siswa)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Ebook::with('category')->where('is_active', true);

        // Siswa can only see public or member ebooks (both, since they are members)
        // Non-authenticated cannot access (protected by auth middleware)
        
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('author', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->has('access') && $request->access) {
            $query->where('access', $request->access);
        }

        $ebooks = $query->orderBy('created_at', 'desc')->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $ebooks,
        ]);
    }

    /**
     * POST /api/ebooks - Create new ebook (admin/petugas)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'author'      => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'publisher'   => 'nullable|string|max:255',
            'year'        => 'nullable|integer|min:1900|max:2100',
            'isbn'        => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'access'      => 'required|in:public,member',
            'cover'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'file'        => 'required_without:external_file_url|nullable|mimes:pdf,epub|max:51200', 
            'external_file_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'author', 'category_id', 'publisher', 'year', 'isbn', 'description', 'access', 'external_file_url']);

        if ($request->hasFile('cover')) {
            $data['cover'] = $request->file('cover')->store('ebooks/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            try {
                $url = $request->cover_url;
                $contents = file_get_contents($url);
                $name = 'ebooks/covers/' . md5($url) . '.jpg';
                Storage::disk('public')->put($name, $contents);
                $data['cover'] = $name;
            } catch (\Exception $e) {}
        }
        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('ebooks/files', 'public');
        }

        $ebook = Ebook::create($data);
        $ebook->load('category');

        broadcast(new LibraryDataUpdated('ebook', 'E-book baru ditambahkan', $ebook))->toOthers();

        return response()->json(['success' => true, 'message' => 'E-book berhasil ditambahkan', 'data' => $ebook], 201);
    }

    /**
     * POST /api/ebooks/import-link - Import metadata from URL
     */
    public function importMetadata(Request $request)
    {
        $request->validate(['url' => 'required|string']);
        $query = $request->url;
        $url = $query;

        $metadata = [
            'title' => '',
            'author' => 'Unknown Author',
            'description' => '',
            'cover' => '',
            'publisher' => '',
            'year' => '',
            'isbn' => '',
            'file_url' => '',
        ];

        // If it's a direct ISBN (numeric and length 10 or 13)
        if (preg_match('/^[0-9]{10,13}$/', $query)) {
            $res = Http::get("https://www.googleapis.com/books/v1/volumes?q=isbn:{$query}");
            if ($res->successful() && $res->json('totalItems') > 0) {
                $item = $res->json('items.0.volumeInfo');
                $metadata['title'] = $item['title'] ?? '';
                $metadata['author'] = implode(', ', $item['authors'] ?? ['Unknown Author']);
                $metadata['description'] = strip_tags($item['description'] ?? '');
                $metadata['cover'] = $item['imageLinks']['thumbnail'] ?? '';
                $metadata['publisher'] = $item['publisher'] ?? '';
                $metadata['year'] = substr($item['publishedDate'] ?? '', 0, 4);
                $metadata['isbn'] = $query;
                return response()->json(['success' => true, 'data' => $metadata]);
            }
        }

        // 1. Try Google Books API if URL looks like a book
        if (str_contains($url, 'books.google')) {
            preg_match('/id=([^&]+)/', $url, $matches);
            $bookId = $matches[1] ?? null;
            if ($bookId) {
                $res = Http::get("https://www.googleapis.com/books/v1/volumes/{$bookId}");
                if ($res->successful()) {
                    $volume = $res->json('volumeInfo');
                    $metadata['title'] = $volume['title'] ?? '';
                    $metadata['author'] = implode(', ', $volume['authors'] ?? ['Unknown Author']);
                    $metadata['description'] = strip_tags($volume['description'] ?? '');
                    $metadata['cover'] = str_replace('http:', 'https:', $volume['imageLinks']['thumbnail'] ?? ($volume['imageLinks']['smallThumbnail'] ?? ''));
                    $metadata['publisher'] = $volume['publisher'] ?? '';
                    $metadata['year'] = substr($volume['publishedDate'] ?? '', 0, 4);
                    $metadata['isbn'] = $volume['industryIdentifiers'][0]['identifier'] ?? '';
                    return response()->json(['success' => true, 'data' => $metadata]);
                }
            }
        } 

        // 2. Fallback: Generic Scraper (OpenGraph / Title)
        try {
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                return response()->json(['success' => false, 'message' => 'Link tidak valid'], 400);
            }

            $res = Http::withHeaders(['User-Agent' => 'Mozilla/5.0'])->get($url);
            if ($res->successful()) {
                $html = $res->body();
                
                // Title
                preg_match('/<title>(.*?)<\/title>/i', $html, $titleMatch);
                $metadata['title'] = trim($titleMatch[1] ?? '');
                
                // OpenGraph
                preg_match('/<meta property="og:title" content="(.*?)"/i', $html, $ogTitle);
                if (!empty($ogTitle[1])) $metadata['title'] = $ogTitle[1];

                preg_match('/<meta property="og:description" content="(.*?)"/i', $html, $descMatch);
                if (!empty($descMatch[1])) $metadata['description'] = $descMatch[1];

                preg_match('/<meta property="og:image" content="(.*?)"/i', $html, $imgMatch);
                if (!empty($imgMatch[1])) $metadata['cover'] = $imgMatch[1];

                // PDF specific
                if (str_ends_with(strtolower($url), '.pdf')) {
                    $metadata['file_url'] = $url;
                    if (empty($metadata['title'])) $metadata['title'] = basename($url, '.pdf');
                }
            }
        } catch (\Exception $e) {}

        if (empty($metadata['title'])) {
             return response()->json(['success' => false, 'message' => 'Metadata tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $metadata]);
    }

    /**
     * GET /api/ebooks/{id} - Get single ebook
     */
    public function show(Request $request, $id)
    {
        $ebook = Ebook::with('category')->findOrFail($id);

        // Track read activity
        $user = $request->user();
        EbookDownload::create([
            'user_id'       => $user->id,
            'ebook_id'      => $ebook->id,
            'action'        => 'read',
            'downloaded_at' => now(),
        ]);
        $ebook->increment('read_count');

        return response()->json(['success' => true, 'data' => $ebook]);
    }

    /**
     * PUT /api/ebooks/{id} - Update ebook (admin/petugas)
     */
    public function update(Request $request, $id)
    {
        $ebook = Ebook::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'author'      => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'publisher'   => 'nullable|string|max:255',
            'year'        => 'nullable|integer|min:1900|max:2100',
            'isbn'        => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'access'      => 'required|in:public,member',
            'is_active'   => 'nullable|boolean',
            'cover'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'file'        => 'nullable|mimes:pdf,epub|max:51200',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'author', 'category_id', 'publisher', 'year', 'isbn', 'description', 'access', 'is_active', 'external_file_url']);

        if ($request->hasFile('cover')) {
            if ($ebook->cover) Storage::disk('public')->delete($ebook->cover);
            $data['cover'] = $request->file('cover')->store('ebooks/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            try {
                $url = $request->cover_url;
                $contents = file_get_contents($url);
                $name = 'ebooks/covers/' . md5($url) . '.jpg';
                Storage::disk('public')->put($name, $contents);
                $data['cover'] = $name;
            } catch (\Exception $e) {}
        }
        if ($request->hasFile('file')) {
            if ($ebook->file) Storage::disk('public')->delete($ebook->file);
            $data['file'] = $request->file('file')->store('ebooks/files', 'public');
        }

        $ebook->update($data);
        $ebook->load('category');

        broadcast(new LibraryDataUpdated('ebook', 'Data e-book diperbarui', $ebook))->toOthers();

        return response()->json(['success' => true, 'message' => 'E-book berhasil diperbarui', 'data' => $ebook]);
    }

    /**
     * DELETE /api/ebooks/{id} - Delete ebook (admin only)
     */
    public function destroy($id)
    {
        $ebook = Ebook::findOrFail($id);

        if ($ebook->cover) Storage::disk('public')->delete($ebook->cover);
        if ($ebook->file) Storage::disk('public')->delete($ebook->file);

        $ebookId = $ebook->id;
        $ebook->delete();

        broadcast(new LibraryDataUpdated('ebook', 'E-book dihapus', ['id' => $ebookId, 'deleted' => true]))->toOthers();

        return response()->json(['success' => true, 'message' => 'E-book berhasil dihapus']);
    }

    /**
     * POST /api/ebooks/{id}/download - Track download & return file URL
     */
    public function download(Request $request, $id)
    {
        $ebook = Ebook::findOrFail($id);
        $user  = $request->user();

        EbookDownload::create([
            'user_id'       => $user->id,
            'ebook_id'      => $ebook->id,
            'action'        => 'download',
            'downloaded_at' => now(),
        ]);
        $ebook->increment('download_count');

        return response()->json([
            'success'  => true,
            'message'  => 'Download tercatat',
            'file_url' => $ebook->file_url,
        ]);
    }

    /**
     * GET /api/ebooks/popular - Most downloaded ebooks
     */
    public function popular()
    {
        $ebooks = Ebook::with('category')
            ->where('is_active', true)
            ->orderBy('download_count', 'desc')
            ->limit(6)
            ->get();

        return response()->json(['success' => true, 'data' => $ebooks]);
    }
}
