<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    protected $fillable = [
        'book_id',
        'manual_title',
        'manual_isbn',
        'manual_author',
        'user_id',
        'type',
        'status',
        'qty',
        'date',
        'description'
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
