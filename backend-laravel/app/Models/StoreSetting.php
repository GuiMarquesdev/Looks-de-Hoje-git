<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $table = 'store_settings'; // Força o nome correto da tabela

    protected $fillable = [
        'store_name',
        'instagram_url',
        'whatsapp_url',
        'email',
    ];
}