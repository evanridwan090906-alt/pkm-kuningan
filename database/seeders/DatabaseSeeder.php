<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin Library',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Petugas',
            'email' => 'petugas@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'petugas',
        ]);

        $this->call([
            RackSeeder::class,
        ]);

        // Add some categories and books for testing
        $it = \App\Models\Category::create(['name' => 'Teknologi Informasi', 'slug' => 'teknologi-informasi']);
        $novel = \App\Models\Category::create(['name' => 'Novel', 'slug' => 'novel']);

        $rack = \App\Models\Rack::first();

        \App\Models\Book::create([
            'title' => 'Belajar Laravel 11',
            'author' => 'Taylor Otwell',
            'publisher' => 'Laravel Media',
            'year' => 2024,
            'isbn' => '978-1234567890',
            'barcode' => 'L11001',
            'category_id' => $it->id,
            'rack_id' => $rack->id,
            'stock' => 10
        ]);

        \App\Models\Book::create([
            'title' => 'Harry Potter',
            'author' => 'J.K. Rowling',
            'publisher' => 'Bloomsbury',
            'year' => 1997,
            'isbn' => '978-0747532699',
            'barcode' => 'HP001',
            'category_id' => $novel->id,
            'rack_id' => $rack->id,
            'stock' => 5
        ]);
    }
}
