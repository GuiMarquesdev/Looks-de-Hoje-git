<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'is_active' // <--- IMPORTANTE TER ESTE CAMPO AQUI
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relacionamento com peças (opcional, mas bom já ter)
    public function pieces()
    {
        return $this->hasMany(Piece::class);
    }
}