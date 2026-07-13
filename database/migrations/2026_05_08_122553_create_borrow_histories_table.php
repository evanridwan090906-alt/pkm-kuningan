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
        Schema::create('borrow_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaction_id');
            $table->date('old_due_date')->nullable();
            $table->date('new_due_date');
            $table->unsignedBigInteger('updated_by');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('transaction_id')->references('id')->on('borrow_transactions')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrow_histories');
    }
};
