<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'nisn', 'jurusan', 'angkatan', 'kelas', 'photo', 'profile_photo_path', 'last_login_at', 'last_seen', 'is_active', 'login_attempts', 'last_ip', 'last_device'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['profile_photo_url'];

    public function getProfilePhotoUrlAttribute()
    {
        return $this->profile_photo_path 
            ? asset('storage/' . $this->profile_photo_path) 
            : null;
    }

    public function ebookDownloads()
    {
        return $this->hasMany(\App\Models\EbookDownload::class);
    }

    public function borrowTransactions()
    {
        return $this->hasMany(\App\Models\BorrowTransaction::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_seen' => 'datetime',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
