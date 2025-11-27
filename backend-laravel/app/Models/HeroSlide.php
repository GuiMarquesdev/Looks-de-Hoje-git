<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    // Define quais campos podem ser gravados no banco
    protected $fillable = [
        'image_url',
        'title',
        'subtitle',
        'cta_text',
        'cta_link',
        'order',
        'image_fit',
        'image_position_x',
        'image_position_y',
        'image_zoom',
        'is_active'
    ];

    // Converte is_active para booleano automaticamente
    protected $casts = [
        'is_active' => 'boolean',
    ];
}