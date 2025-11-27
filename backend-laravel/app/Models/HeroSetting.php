<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSetting extends Model
{
    protected $table = 'hero_settings';

    protected $fillable = [
        'title',
        'subtitle',
        'cta_text',
        'cta_link',
        'background_image_url',
        'is_active',
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
}