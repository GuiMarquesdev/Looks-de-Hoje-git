<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PieceController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\StoreSettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Rotas Públicas ---
Route::post('/login', [AuthController::class, 'login']);

// Peças
Route::get('/pieces', [PieceController::class, 'index']);
Route::get('/pieces/{id}', [PieceController::class, 'show']);

// Categorias
Route::get('/categories', [CategoryController::class, 'index']);

// Hero (Carrossel) - Leitura pública
Route::get('/hero', [HeroController::class, 'index']);

// Configurações da loja (Público para leitura)
Route::get('/settings', [StoreSettingController::class, 'show']);

// --- CORREÇÃO AQUI ---
// Adicionada a rota GET /admin/settings para resolver o erro 405
Route::get('/admin/settings', [StoreSettingController::class, 'show']);
// ---------------------

// --- Rotas Protegidas (Admin) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // === Upload de Imagens das Peças ===
    Route::post('/pieces/upload-images', [ImageUploadController::class, 'store']);

    // === Gerenciamento de Peças ===
    Route::post('/pieces', [PieceController::class, 'store']);
    Route::put('/pieces/{id}', [PieceController::class, 'update']);
    Route::delete('/pieces/{id}', [PieceController::class, 'destroy']);
    Route::put('/pieces/{id}/toggle-status', [PieceController::class, 'toggleStatus']);

    // === Categorias ===
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']); 
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // === Hero / Banner (Novas Rotas) ===
    // Configurações Gerais (Título, Subtítulo, Status Global)
    Route::post('/hero', [HeroController::class, 'update']);
    Route::put('/hero', [HeroController::class, 'update']);

    // Gerenciamento dos Slides Individuais
    Route::post('/hero/slides', [HeroController::class, 'storeSlide']);      
    Route::put('/hero/slides/{id}', [HeroController::class, 'updateSlide']); 
    Route::delete('/hero/slides/{id}', [HeroController::class, 'destroySlide']); 
    
    // Upload de Imagem Específico do Hero
    Route::post('/hero/upload', [HeroController::class, 'uploadImage']);
    
    // === Configurações da Loja ===
    // Atualizar Configurações (ex: Admin dashboard info)
    // Nota: Se você estiver enviando o PUT sem token no frontend, 
    // precisará mover esta linha para fora do grupo middleware auth:sanctum também.
    Route::put('/admin/settings', [StoreSettingController::class, 'update']); 
    Route::put('/settings', [StoreSettingController::class, 'update']);
});