<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rack;

class RackSeeder extends Seeder
{
    public function run(): void
    {
        $racks = [
            ['name' => 'Rak A', 'description' => 'Buku Pengetahuan Umum'],
            ['name' => 'Rak B', 'description' => 'Novel & Fiksi'],
            ['name' => 'Rak C', 'description' => 'Referensi & Kamus'],
            ['name' => 'Rak D', 'description' => 'Sains & Teknologi'],
        ];

        foreach ($racks as $rack) {
            Rack::create($rack);
        }
    }
}
