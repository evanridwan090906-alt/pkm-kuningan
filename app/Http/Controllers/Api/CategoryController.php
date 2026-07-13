<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Events\LibraryDataUpdated;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);
        
        broadcast(new LibraryDataUpdated('category', 'Kategori baru ditambahkan', $category))->toOthers();
        
        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);
        
        broadcast(new LibraryDataUpdated('category', 'Kategori diperbarui', $category))->toOthers();
        
        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        $id = $category->id;
        $category->delete();
        
        broadcast(new LibraryDataUpdated('category', 'Kategori dihapus', ['id' => $id, 'deleted' => true]))->toOthers();
        
        return response()->json(null, 204);
    }
}
