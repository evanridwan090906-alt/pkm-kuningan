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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('app_name')->default('CASPER Smart Library');
            $table->string('school_name')->default('SMK PERTIWI KUNINGAN');
            $table->text('address')->nullable();
            $table->string('logo')->nullable();
            $table->string('primary_color')->default('#2563EB');
            $table->string('date_format')->default('d/m/Y');
            $table->boolean('notif_loan')->default(true);
            $table->boolean('notif_late')->default(true);
            $table->boolean('notif_email')->default(false);
            $table->integer('auto_logout_minutes')->default(30);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
