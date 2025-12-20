<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ProductVariant extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'product_id',
        'sku',
        'quantity',
        'is_default',
        'price',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function options()
    {
        return $this->hasMany(ProductVariantOption::class, 'variant_id');
    }

    public function optionValues()
    {
        return $this->belongsToMany(
            AttributeOption::class,
            'product_variant_options',
            'variant_id',
            'attribute_option_id'
        );
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')->singleFile();
    }

    public function getImageUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('image');
    }
}
