<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ebook extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'author',
        'publisher',
        'year',
        'isbn',
        'cover',
        'file',
        'description',
        'download_count',
        'read_count',
        'access',
        'source_url',
        'external_file_url',
        'is_active',
    ];

    protected $appends = ['cover_url', 'file_url'];

    public function getCoverUrlAttribute()
    {
        return $this->cover ? asset('storage/' . $this->cover) : null;
    }

    public function getFileUrlAttribute()
    {
        if ($this->external_file_url) return $this->external_file_url;
        return $this->file ? asset('storage/' . $this->file) : null;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function downloads()
    {
        return $this->hasMany(EbookDownload::class);
    }
}
