<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.headoffice', '');
        $this->migrator->add('general.budget', '');
        $this->migrator->add('general.registration', '');
        $this->migrator->add('general.taxpayer_number', '');
    }
};
