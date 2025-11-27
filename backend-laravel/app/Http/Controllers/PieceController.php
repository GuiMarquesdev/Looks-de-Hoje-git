<?php

namespace App\Http\Controllers;

use App\Models\Piece;
use Illuminate\Http\Request;

class PieceController extends Controller
{
    public function index(Request $request)
    {
        $query = Piece::with('category');
        return response()->json($query->get());
    }

    public function show($id)
    {
        return Piece::with('category')->findOrFail($id);
    }

    public function store(Request $request)
    {
        // Validação compatível com o payload do Frontend
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:350',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'images' => 'array', // Recebe array de URLs
            'measurements' => 'nullable|array',
            'status' => 'string'
        ]);

        $piece = Piece::create([
            'name' => $validated['name'],
            'description' => $request->description,
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'images' => $request->images ?? [],
            'measurements' => $request->measurements,
            'status' => $request->status ?? 'available',
            // Valores padrão para o frame
            'image_position_x' => 50,
            'image_position_y' => 50,
            'image_zoom' => 100,
        ]);

        return response()->json($piece, 201);
    }

    public function update(Request $request, $id)
    {
        $piece = Piece::findOrFail($id);
        
        // O frontend envia apenas os campos que mudaram ou o objeto completo
        // Fillable garante que só campos permitidos sejam atualizados
        $piece->fill($request->all());
        $piece->save();

        return response()->json($piece);
    }

    public function destroy($id)
    {
        Piece::destroy($id);
        return response()->noContent();
    }
    
    // Rota específica para alternar status (se o frontend usar essa rota dedicada)
    public function toggleStatus(Request $request, $id)
    {
        $piece = Piece::findOrFail($id);
        $status = $request->input('status');
        
        if ($status && in_array($status, ['available', 'rented'])) {
            $piece->status = $status;
            $piece->save();
        }

        return response()->json($piece);
    }
}