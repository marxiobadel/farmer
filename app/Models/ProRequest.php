<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ProRequest extends Model
{
    protected $fillable = [
        'company_name',
        'niu',
        'contact_name',
        'email',
        'phone',
        'activity_sector',
        'address',
        'message',
        'status',
        'user_id',
    ];

    protected static function booted(): void
    {
        static::creating(function ($proRequest) {
            $proRequest->user_id = Auth::id();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
