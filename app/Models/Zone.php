<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    protected $fillable = [
        'name',
        'latitude',
        'longitude',
        'country_id',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function carriers()
    {
        return $this->belongsToMany(Carrier::class, 'carrier_zone');
    }

    public function rates()
    {
        return $this->hasMany(CarrierRate::class, 'zone_id');
    }
}
