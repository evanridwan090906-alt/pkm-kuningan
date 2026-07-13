<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'category_id',
        'rack_id',
        'title',
        'author',
        'publisher',
        'year',
        'isbn',
        'barcode',
        'stock',
        'status',
        'description',
        'ebook_file',
        'ebook_link',
        'cover_image',
        'created_by'
    ];

    protected $appends = ['cover_url'];

    public function getCoverUrlAttribute()
    {
        return $this->cover_image ? asset('storage/' . $this->cover_image) : null;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function rack()
    {
        return $this->belongsTo(Rack::class);
    }

    public function archives()
    {
        return $this->hasMany(Archive::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
