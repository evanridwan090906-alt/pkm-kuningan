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
        Schema::table('books', function (Blueprint $table) {
            if (!Schema::hasColumn('books', 'description')) $table->text('description')->nullable()->after('isbn');
            if (!Schema::hasColumn('books', 'status')) $table->string('status')->default('available')->after('stock');
            if (!Schema::hasColumn('books', 'ebook_file')) $table->string('ebook_file')->nullable()->after('status');
            if (!Schema::hasColumn('books', 'ebook_link')) $table->string('ebook_link')->nullable()->after('ebook_file');
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn(['description', 'status', 'ebook_file', 'ebook_link']);
        });
    }
};
