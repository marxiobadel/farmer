<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Category extends Model implements HasMedia
{
    use HasSlug, InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'status',
    ];

    protected $withCount = ['products'];

    protected static function booted(): void
    {
        static::saved(function ($category) {
            Cache::forget('products_categories_oldest');
        });

        static::deleted(function ($category) {
            Cache::forget('products_categories_oldest');
        });
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()->generateSlugsFrom('name')->saveSlugsTo('slug');
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile();
    }

    public function registerMediaConversions(?\Spatie\MediaLibrary\MediaCollections\Models\Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->sharpen(10);
    }

    public function coverUrl(): Attribute
    {
        return new Attribute(
            get: fn () => $this->getFirstMediaUrl('cover', 'thumb')
        );
    }

    public function scopeActive($query)
    {
        return $query->where('status', '=', true);
    }

    public function scopeForProduct($query)
    {
        return $query->where('type', '=', 'products');
    }
}
