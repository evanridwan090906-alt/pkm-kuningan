<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'app_name',
        'school_name',
        'address',
        'logo',
        'primary_color',
        'date_format',
        'notif_loan',
        'notif_late',
        'notif_email',
        'auto_logout_minutes'
    ];
}
