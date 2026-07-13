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
        Schema::table('ebooks', function (Blueprint $table) {
            $table->string('source_url')->nullable()->after('isbn');
            $table->string('external_file_url')->nullable()->after('file');
        });
    }

    public function down(): void
    {
        Schema::table('ebooks', function (Blueprint $table) {
            $table->dropColumn(['source_url', 'external_file_url']);
        });
    }
};
