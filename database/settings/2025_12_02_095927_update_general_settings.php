<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration {
    public function up(): void
    {
        $this->migrator->add('general.facebook_url', '');
        $this->migrator->add('general.twitter_url', '');
        $this->migrator->add('general.instagram_url', '');
        $this->migrator->add('general.linkedin_url', '');
        $this->migrator->add('general.youtube_url', '');
        $this->migrator->add('general.phone', '(406) 555-0120');
        $this->migrator->add('general.email', 'marcelnana1@gmail.com');
        $this->migrator->add('general.address', '2972 Westheimer Rd. Santa Ana, Illinois 85486');
    }
};
