<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class AttributeOption extends Model
{
    use HasFactory, HasSlug;

    protected $fillable = [
        'attribute_id',
        'name',
        'slug',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()->generateSlugsFrom('name')->saveSlugsTo('slug');
    }

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function variantOptions()
    {
        return $this->hasMany(ProductVariantOption::class, 'attribute_option_id');
    }
}
