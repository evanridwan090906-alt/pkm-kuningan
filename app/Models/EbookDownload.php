<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EbookDownload extends Model
{
    protected $fillable = [
        'user_id',
        'ebook_id',
        'action',
        'downloaded_at',
    ];

    protected $casts = [
        'downloaded_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ebook()
    {
        return $this->belongsTo(Ebook::class);
    }
}
