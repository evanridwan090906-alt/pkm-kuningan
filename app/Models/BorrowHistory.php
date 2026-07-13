<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowHistory extends Model
{
    protected $fillable = [
        'transaction_id',
        'old_due_date',
        'new_due_date',
        'updated_by',
        'notes',
    ];

    protected $casts = [
        'old_due_date' => 'date',
        'new_due_date' => 'date',
    ];

    public function transaction()
    {
        return $this->belongsTo(BorrowTransaction::class, 'transaction_id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
