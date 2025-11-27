<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pieces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description', 350)->nullable(); // Limite de 350 igual ao Node
            $table->decimal('price', 10, 2);
            $table->json('images')->nullable(); // Array de URLs das imagens
            $table->json('measurements')->nullable(); // Medidas (busto, cintura, etc)
            
            // Campos para a ferramenta de enquadramento (ImageFramingTool)
            $table->float('image_position_x')->default(50);
            $table->float('image_position_y')->default(50);
            $table->float('image_zoom')->default(100);

            $table->string('status')->default('available'); // 'available' ou 'rented'
            
            // Relacionamento
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pieces');
    }
};