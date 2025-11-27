<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function store(Request $request)
    {
        if (!$request->hasFile('files')) {
            return response()->json(['message' => 'Nenhum arquivo enviado.'], 400);
        }

        $urls = [];
        $files = $request->file('files');
        
        // Garante que é array mesmo se for um único arquivo
        if (!is_array($files)) {        
            $files = [$files];
        }

        foreach ($files as $file) {
            // Salva na pasta 'public/uploads' dentro do storage
            $path = $file->store('uploads', 'public');
            // Gera a URL completa (ex: http://localhost:8000/storage/uploads/nome.jpg)
            $urls[] = asset('storage/' . $path);
        }

        return response()->json(['urls' => $urls]);
    }
}