<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Testimonial extends Model
{
    protected $fillable = [
        'name',
        'position',
        'company',
        'message',
        'rating',
        'product_id',
        'is_approved',
        'user_id',
    ];

    protected static function booted(): void
    {
        static::saved(function ($testimonial) {
            Cache::forget('front_testimonials_active');
        });

        static::deleted(function ($testimonial) {
            Cache::forget('front_testimonials_active');
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', '=', true);
    }
}
