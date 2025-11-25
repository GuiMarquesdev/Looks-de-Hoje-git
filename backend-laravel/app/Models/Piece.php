<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Piece extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'description', 
        'price', 
        'images', 
        'isPromoted', 
        'categoryId'
    ];

    // Converte o JSON de imagens para array automaticamente
    protected $casts = [
        'images' => 'array',
        'isPromoted' => 'boolean',
        'price' => 'float'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'categoryId');
    }
}