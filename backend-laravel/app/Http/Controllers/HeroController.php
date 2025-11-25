<?php

namespace App\Http\Controllers;

use App\Models\HeroSetting;
use Illuminate\Http\Request;

class HeroController extends Controller
{
    public function index()
    {
        // Pega o primeiro registro ou retorna padrão
        return response()->json(HeroSetting::first() ?? []);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'subtitle' => 'required|string',
            'buttonText' => 'required|string',
            'buttonLink' => 'nullable|string',
            'backgroundImage' => 'nullable|image|max:4096'
        ]);

        // Singleton pattern para configurações: sempre atualizamos o ID 1 ou criamos
        $hero = HeroSetting::firstOrNew(['id' => 1]);

        if ($request->hasFile('backgroundImage')) {
            $path = $request->file('backgroundImage')->store('hero', 'public');
            $hero->backgroundImage = asset('storage/' . $path);
        }

        $hero->title = $validated['title'];
        $hero->subtitle = $validated['subtitle'];
        $hero->buttonText = $validated['buttonText'];
        $hero->buttonLink = $validated['buttonLink'] ?? '#';
        $hero->save();

        return response()->json($hero);
    }
}