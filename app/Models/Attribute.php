<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Attribute extends Model
{
    use HasFactory, HasSlug;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'is_filterable',
        'is_required',
    ];

    protected $casts = [
        'is_filterable' => 'boolean',
        'is_required' => 'boolean',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()->generateSlugsFrom('name')->saveSlugsTo('slug');
    }

    public function options()
    {
        return $this->hasMany(AttributeOption::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_attributes')->withTimestamps();
    }

    // Helper
    public function isVariantCompatible(): bool
    {
        return in_array($this->type, ['select', 'color']);
    }
}
