<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change role enum to include siswa
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'petugas', 'siswa') NOT NULL DEFAULT 'petugas'");
        
        // Add student-specific fields
        Schema::table('users', function (Blueprint $table) {
            $table->string('nim')->nullable()->after('email'); // NIM/NIS
            $table->string('jurusan')->nullable()->after('nim');
            $table->string('angkatan')->nullable()->after('jurusan');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nim', 'jurusan', 'angkatan']);
        });
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'petugas') NOT NULL DEFAULT 'petugas'");
    }
};
