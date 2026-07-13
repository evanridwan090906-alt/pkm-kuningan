<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ebooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title');
            $table->string('author');
            $table->string('publisher')->nullable();
            $table->year('year')->nullable();
            $table->string('isbn')->nullable();
            $table->string('cover')->nullable();     // path to cover image
            $table->string('file');                   // path to PDF/epub file
            $table->text('description')->nullable();
            $table->unsignedBigInteger('download_count')->default(0);
            $table->unsignedBigInteger('read_count')->default(0);
            $table->enum('access', ['public', 'member'])->default('member');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ebooks');
    }
};
