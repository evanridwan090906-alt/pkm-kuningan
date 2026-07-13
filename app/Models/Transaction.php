<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'book_id',
        'user_id',
        'borrower_name',
        'borrow_date',
        'return_date',
        'actual_return_date',
        'status',
        'notes'
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
