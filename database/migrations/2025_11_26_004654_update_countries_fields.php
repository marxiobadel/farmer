<?php

use App\Models\Country;
use App\Models\Timezone;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            Schema::table('countries', function (Blueprint $table) {
                $table->string('capital')->nullable()->comment('Country capital');
                $table->string('currency')->nullable()->comment('Country currency Code');
                $table->string('currency_symbol')->nullable()->comment('Country currency Symbol');
                $table->float('currency_value')->default(0)->nullable()->comment('Base currency value in USD');
                $table->string('tld')->nullable()->comment('Country top level domain');
                $table->string('native_name')->nullable()->comment('Native name of the country');
                $table->string('region')->nullable();
                $table->string('subregion')->nullable();
                $table->string('latitude')->nullable();
                $table->string('longitude')->nullable();
                $table->string('emojiU')->nullable()->comment('Emoji unicode');
            });

            Schema::create('timezones', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('country_id')->nullable();
                $table->foreign('country_id')->references('id')->on('countries')->onUpdate('cascade')->onDelete('cascade');
                $table->string('zone_name')->comment('Timezone database name');
                $table->string('name')->nullable()->comment('Timezone name');
                $table->string('gmt_offset')->nullable()->comment('Timezone offset from UTC');
                $table->string('gmt_offset_name')->nullable()->comment('Timezone offset from UTC name');
                $table->string('abbreviation')->nullable()->comment('Timezone abbreviation');
            });

            $countries_data = json_decode(file_get_contents(storage_path('countries.json')), true);

            $countries = Country::all();

            foreach ($countries_data as $countryData) {
                foreach ($countries as $country) {
                    if ($countryData['iso2'] == $country['iso']) {
                        $country->capital = $countryData['capital'];
                        $country->currency = $countryData['currency'];
                        $country->currency_symbol = $countryData['currency_symbol'];
                        $country->tld = $countryData['tld'];
                        $country->native_name = $countryData['native'];
                        $country->region = $countryData['region'];
                        $country->subregion = $countryData['subregion'];
                        $country->latitude = $countryData['latitude'];
                        $country->longitude = $countryData['longitude'];
                        $country->emojiU = $countryData['emojiU'];
                        $country->save();

                        foreach ($countryData['timezones'] as $timezones) {
                            $timezone = new Timezone();
                            $timezone->country_id = $country->id;
                            $timezone->zone_name = $timezones['zoneName'];
                            $timezone->name = $timezones['tzName'];
                            $timezone->gmt_offset = $timezones['gmtOffset'];
                            $timezone->gmt_offset_name = $timezones['gmtOffsetName'];
                            $timezone->abbreviation = $timezones['abbreviation'];
                            $timezone->save();
                        }
                    }
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            //
        });
    }
};
