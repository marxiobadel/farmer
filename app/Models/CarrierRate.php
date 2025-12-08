<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarrierRate extends Model
{
    protected $fillable = [
        'carrier_id',
        'zone_id',
        'min_weight',
        'max_weight',
        'min_price',
        'max_price',
        'min_volume',
        'max_volume',
        'rate_price',
        'delivery_time',
    ];

    public function carrier()
    {
        return $this->belongsTo(Carrier::class);
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }
}
