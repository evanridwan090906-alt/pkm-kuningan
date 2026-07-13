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
        Schema::table('borrow_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('borrow_transactions', 'updated_return_date')) {
                $table->date('updated_return_date')->nullable()->after('due_date');
            }
            if (!Schema::hasColumn('borrow_transactions', 'updated_by')) {
                $table->unsignedBigInteger('updated_by')->nullable()->after('status');
                $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('borrow_transactions', function (Blueprint $table) {
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['updated_return_date', 'updated_by']);
        });
    }
};
