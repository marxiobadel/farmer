<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carrier extends Model
{
    protected $fillable = [
        'name',
        'description',
        'base_price',
        'free_shipping_min',
        'is_active',
        'pricing_type',
    ];

    public function zones()
    {
        return $this->belongsToMany(Zone::class, 'carrier_zone');
    }

    public function rates()
    {
        return $this->hasMany(CarrierRate::class);
    }
}
