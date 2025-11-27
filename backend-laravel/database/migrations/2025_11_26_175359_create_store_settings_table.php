<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Importante para o insert inicial

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('store_name')->default('Minha Loja');
            $table->string('instagram_url')->nullable();
            $table->string('whatsapp_url')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });
        
        // Removemos o insert daqui para deixar apenas no Seeder,
        // evitando duplicidade ou erros de lógica.
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};