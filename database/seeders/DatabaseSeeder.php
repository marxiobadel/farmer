<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminUser = User::firstOrCreate(
            ['email' => 'marxiobadel@gmail.com'],
            [
                'firstname' => 'Marxio Badel',
                'lastname' => 'NDOUNGUE',
                'phone' => '672816752',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $role = Role::firstOrCreate(['name' => 'superadmin']);

        $adminUser->syncRoles($role);
    }
}
