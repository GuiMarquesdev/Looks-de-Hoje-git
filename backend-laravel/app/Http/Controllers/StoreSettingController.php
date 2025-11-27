<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use Illuminate\Http\Request;

class StoreSettingController extends Controller
{
    public function show()
    {
        // Pega a primeira configuração ou cria se não existir
        $settings = StoreSetting::firstOrCreate([], ['store_name' => 'Looks de Hoje']);
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = StoreSetting::first();
        if (!$settings) {
            $settings = new StoreSetting();
        }

        $settings->fill($request->all());
        $settings->save();

        return response()->json($settings);
    }
}