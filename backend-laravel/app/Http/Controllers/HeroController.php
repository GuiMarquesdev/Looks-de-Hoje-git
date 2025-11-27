<?php

namespace App\Http\Controllers;

use App\Models\HeroSetting;
use App\Models\HeroSlide; // <--- ESSA IMPORTAÇÃO É ESSENCIAL
use Illuminate\Http\Request;

class HeroController extends Controller
{
    // Retorna a estrutura { settings: {}, slides: [] }
    public function index()
    {
        $settings = HeroSetting::firstOrNew(['id' => 1]);
        $slides = HeroSlide::orderBy('order', 'asc')->get();

        return response()->json([
            'settings' => $settings,
            'slides' => $slides
        ]);
    }

    // Atualiza configurações globais
    public function update(Request $request)
    {
        $settings = HeroSetting::firstOrNew(['id' => 1]);
        
        if ($request->has('is_active')) {
            $settings->is_active = $request->input('is_active');
        }
        
        $settings->fill($request->only(['title', 'subtitle', 'cta_text', 'cta_link']));
        $settings->save();

        return response()->json($settings);
    }

    // --- Métodos para Slides (CRUD) ---

    public function storeSlide(Request $request)
    {
        // Validação completa
        $validated = $request->validate([
            'image_url' => 'required|string',
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'cta_text' => 'nullable|string',
            'cta_link' => 'nullable|string',
            'order' => 'integer',
            'image_fit' => 'nullable|in:cover,contain,fill',
            'image_position_x' => 'integer|min:0|max:100',
            'image_position_y' => 'integer|min:0|max:100',
            'image_zoom' => 'integer|min:50|max:200',
        ]);

        // Criação do slide usando o Model importado
        $slide = HeroSlide::create($validated);
        
        return response()->json($slide, 201);
    }

    public function updateSlide(Request $request, $id)
    {
        $slide = HeroSlide::findOrFail($id);
        
        // Validação para atualização (similar ao store, mas tudo opcional)
        $request->validate([
            'image_fit' => 'nullable|in:cover,contain,fill',
            'image_position_x' => 'nullable|integer',
            'image_position_y' => 'nullable|integer',
            'image_zoom' => 'nullable|integer',
        ]);

        $slide->update($request->all());
        return response()->json($slide);
    }

    public function destroySlide($id)
    {
        $slide = HeroSlide::findOrFail($id);
        $slide->delete();
        return response()->json(['message' => 'Slide removido']);
    }

    public function uploadImage(Request $request)
    {
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('hero-slides', 'public');
            return response()->json(['url' => asset('storage/' . $path)]);
        }
        return response()->json(['error' => 'Nenhuma imagem enviada'], 400);
    }
}