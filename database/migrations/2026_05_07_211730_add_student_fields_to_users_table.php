<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'kelas')) {
                $table->string('kelas', 50)->nullable()->after('angkatan');
            }
            if (!Schema::hasColumn('users', 'photo')) {
                $table->string('photo')->nullable()->after('is_active');
            }
            // Ensure status column exists (is_active was added manually in controller but maybe not DB yet)
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('role');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['kelas', 'photo']);
        });
    }
};
