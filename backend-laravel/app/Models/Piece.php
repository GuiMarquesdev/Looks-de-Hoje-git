<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Piece extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'category_id',
        'images',           // JSON
        'measurements',     // JSON
        'image_position_x',
        'image_position_y',
        'image_zoom',
        'status'
    ];

    protected $casts = [
        'images' => 'array',
        'measurements' => 'array',
        'image_position_x' => 'float',
        'image_position_y' => 'float',
        'image_zoom' => 'float',
        'price' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}