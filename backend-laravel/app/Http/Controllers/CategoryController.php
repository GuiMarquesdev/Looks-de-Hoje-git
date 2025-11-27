<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:categories',
            'is_active' => 'boolean' // Validação para o status
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'is_active' => $request->boolean('is_active', true) // Default true se não enviado
        ]);

        return response()->json($category, 201);
    }

    // Método que faltava para a edição
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|unique:categories,name,' . $id, // Ignora o próprio ID na validação unique
            'is_active' => 'boolean'
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'is_active' => $request->boolean('is_active')
        ]);

        return response()->json($category);
    }

    public function destroy($id)
    {
        // Verifica se há peças antes de deletar (Opcional, mas recomendado)
        $category = Category::withCount('pieces')->findOrFail($id);
        
        if ($category->pieces_count > 0) {
            return response()->json(['message' => 'Não é possível excluir categoria com peças vinculadas.'], 400);
        }

        $category->delete();
        return response()->json(null, 204);
    }
}