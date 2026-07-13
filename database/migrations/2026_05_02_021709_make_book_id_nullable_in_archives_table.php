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
        Schema::table('archives', function (Blueprint $table) {
            $table->foreignId('book_id')->nullable()->change();
            $table->string('manual_title')->nullable()->after('book_id');
            $table->string('manual_isbn')->nullable()->after('manual_title');
            $table->string('manual_author')->nullable()->after('manual_isbn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('archives', function (Blueprint $table) {
            $table->foreignId('book_id')->nullable(false)->change();
            $table->dropColumn(['manual_title', 'manual_isbn', 'manual_author']);
        });
    }
};
