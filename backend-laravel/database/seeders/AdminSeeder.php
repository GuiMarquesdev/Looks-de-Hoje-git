<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verifica se já existe algum admin para evitar duplicação ou erro ao rodar o seed novamente
        if (Admin::count() === 0) {
            Admin::create([
                'username' => 'admin',
                'password' => Hash::make('123456'), // Lembre-se de trocar a senha aqui se desejar
            ]);
            
            $this->command->info('Usuário Admin criado com sucesso!');
        } else {
            $this->command->info('Usuário Admin já existe, pulei a criação.');
        }
    }
}