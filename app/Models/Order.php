<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'carrier_id',
        'status',
        'total',
        'coupon_code',
        'discount',
        'shipping_address',
        'invoice_address',
    ];

    protected $casts = [
        'shipping_address' => 'json',
        'invoice_address' => 'json',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Carrier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Helper to get the successful payment
    public function paidPayment()
    {
        return $this->hasOne(Payment::class)->where('status', '=', 'completed')->latest();
    }
}
