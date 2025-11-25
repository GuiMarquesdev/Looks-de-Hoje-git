<?php

namespace App\Http\Controllers;

use App\Models\Piece;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PieceController extends Controller
{
    public function index(Request $request)
    {
        // Implementa filtros se necessário (ex: ?category=vestidos)
        $query = Piece::with('category');

        if ($request->has('categoryId')) {
            $query->where('categoryId', $request->categoryId);
        }
        
        if ($request->has('promoted')) {
            $query->where('isPromoted', filter_var($request->promoted, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        return Piece::with('category')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'categoryId' => 'required|exists:categories,id',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // Validação de upload
            'isPromoted' => 'boolean' // Opcional
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Salva em storage/app/public/uploads e gera URL
                $path = $image->store('uploads', 'public');
                $imagePaths[] = asset('storage/' . $path);
            }
        }

        $piece = Piece::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'categoryId' => $validated['categoryId'],
            'isPromoted' => $request->input('isPromoted', false),
            'images' => $imagePaths // O Model fará o cast para JSON
        ]);

        return response()->json($piece, 201);
    }

    public function update(Request $request, $id)
    {
        $piece = Piece::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric',
            'categoryId' => 'exists:categories,id',
            'isPromoted' => 'boolean'
        ]);

        // Lógica para adicionar novas imagens ou substituir (depende da sua regra de negócio)
        // Aqui estou apenas atualizando dados textuais para simplificar
        $piece->update($validated);

        return response()->json($piece);
    }

    public function destroy($id)
    {
        $piece = Piece::findOrFail($id);
        
        // Opcional: Deletar imagens do disco
        /*
        if ($piece->images) {
            foreach ($piece->images as $imgUrl) {
                // Lógica para extrair path relativo e deletar
            }
        }
        */

        $piece->delete();
        return response()->json(null, 204);
    }
}