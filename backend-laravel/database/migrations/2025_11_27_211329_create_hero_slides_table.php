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
        Schema::create('hero_slides', function (Blueprint $table) {
            $table->id();
            $table->string('image_url');
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('cta_text')->nullable();
            $table->string('cta_link')->nullable();
            $table->integer('order')->default(0);
            $table->string('image_fit')->default('cover'); // cover, contain, fill
            $table->integer('image_position_x')->default(50);
            $table->integer('image_position_y')->default(50);
            $table->integer('image_zoom')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hero_slides');
    }
};
