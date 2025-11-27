<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Admin;
use App\Models\Category;
use App\Models\StoreSetting;
use App\Models\HeroSetting;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Criar Admin
        // Verifica se já existe para não duplicar
        if (!Admin::where('username', 'admin')->exists()) {
            Admin::create([
                'username' => 'admin',
                'password' => Hash::make('admin123'), // Senha padrão: admin123
            ]);
            $this->command->info('Admin user created (user: admin / pass: admin123)');
        }

        // 2. Criar Categorias Padrão
        $categories = [
            'Vestidos',
            'Saias',
            'Blusas',
            'Calças',
            'Macacões',
            'Conjuntos',
            'Outros'
        ];

        foreach ($categories as $catName) {
            Category::firstOrCreate(
                ['name' => $catName],
                ['slug' => \Illuminate\Support\Str::slug($catName), 'is_active' => true]
            );
        }
        $this->command->info('Categories created.');

        // 3. Criar Configurações da Loja
        if (StoreSetting::count() === 0) {
            StoreSetting::create([
                'store_name' => 'Looks de Hoje',
                'instagram_url' => 'https://instagram.com/looksdehoje',
                'whatsapp_url' => 'https://wa.me/550000000000',
                'email' => 'contato@looksdehoje.com.br'
            ]);
            $this->command->info('Store settings created.');
        }

        // 4. Criar Configuração do Hero (Banner inicial)
        if (HeroSetting::count() === 0) {
            HeroSetting::create([
                'title' => 'Nova Coleção Verão',
                'subtitle' => 'Confira as tendências que acabaram de chegar',
                'cta_text' => 'Ver Ofertas',
                'cta_link' => '/produtos',
                'is_active' => true
            ]);
            $this->command->info('Hero settings created.');
        }
    }
}