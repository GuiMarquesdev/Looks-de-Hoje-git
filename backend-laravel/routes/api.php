<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PieceController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\StoreSettingController;

// --- Rotas Públicas ---
Route::post('/login', [AuthController::class, 'login']);

Route::get('/pieces', [PieceController::class, 'index']);
Route::get('/pieces/{id}', [PieceController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/hero', [HeroController::class, 'index']);

// Configurações da loja (Público para leitura)
Route::get('/settings', [StoreSettingController::class, 'show']);

// --- Rotas Protegidas (Admin) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Upload de Imagens (Separado, igual ao Node)
    Route::post('/pieces/upload-images', [ImageUploadController::class, 'store']);

    // Gerenciamento de Peças
    Route::post('/pieces', [PieceController::class, 'store']);
    Route::put('/pieces/{id}', [PieceController::class, 'update']);
    Route::delete('/pieces/{id}', [PieceController::class, 'destroy']);
    Route::put('/pieces/{id}/toggle-status', [PieceController::class, 'toggleStatus']);

    // Categorias
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Hero / Banner
    Route::post('/hero', [HeroController::class, 'update']);
    
    // Atualizar Configurações da Loja
    Route::put('/settings', [StoreSettingController::class, 'update']);
});