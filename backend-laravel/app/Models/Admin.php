<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Importante para autenticação API

class Admin extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['username', 'password'];

    protected $hidden = ['password'];
}