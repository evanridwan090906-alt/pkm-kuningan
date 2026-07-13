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
            $table->foreignId('rack_id')->nullable()->after('category_id')->constrained()->nullOnDelete();
            $table->string('barcode')->unique()->nullable()->after('isbn');
            $table->dropColumn('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropForeign(['rack_id']);
            $table->dropColumn(['rack_id', 'barcode']);
            $table->string('location')->after('stock');
        });
    }
};
