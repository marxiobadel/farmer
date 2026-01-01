<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Génère le sitemap du site';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Sitemap::create()
            ->add(Product::published()->get())
            ->writeToFile(public_path('sitemap.xml'));

        $this->info('✅ Sitemap généré avec succès.');
    }
}
