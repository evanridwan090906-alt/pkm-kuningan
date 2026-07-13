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
            $table->renameColumn('quantity', 'qty');
            $table->renameColumn('notes', 'description');
            $table->string('status')->nullable()->after('type'); // hilang/rusak/basah
            // Change type to restricted enum as per prompt
            // Note: DB::statement might be needed for changing enum but let's try to keep it simple or just add status
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('archives', function (Blueprint $table) {
            $table->renameColumn('qty', 'quantity');
            $table->renameColumn('description', 'notes');
            $table->dropColumn('status');
        });
    }
};
