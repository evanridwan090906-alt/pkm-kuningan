<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rack extends Model
{
    protected $fillable = ['name', 'description'];

    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
