<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrow_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->string('petugas_name')->nullable();       // who processed it
            $table->date('borrow_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->enum('status', ['pending', 'approved', 'borrowed', 'returned', 'overdue', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrow_transactions');
    }
};
