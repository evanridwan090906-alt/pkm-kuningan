<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'book_id',
        'petugas_name',
        'borrow_date',
        'due_date',
        'return_date',
        'status',
        'notes',
        'updated_return_date',
        'updated_by',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
        'updated_return_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function histories()
    {
        return $this->hasMany(BorrowHistory::class, 'transaction_id');
    }
}
