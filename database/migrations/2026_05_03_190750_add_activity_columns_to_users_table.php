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
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('last_seen')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('login_attempts')->default(0);
            $table->string('last_ip')->nullable();
            $table->string('last_device')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_login_at', 'last_seen', 'is_active', 'login_attempts', 'last_ip', 'last_device']);
        });
    }
};
