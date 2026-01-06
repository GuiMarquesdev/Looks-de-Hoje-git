    <?php

    use Illuminate\Support\Facades\Route;

    Route::get('/', function () {
        return view('welcome');
    }); 

    use Illuminate\Support\Facades\Artisan;

Route::get('/arrumar-imagens', function () {
    // 1. Limpa caches que podem estar a atrapalhar
    Artisan::call('config:clear');
    
    // 2. Define os caminhos
    $targetFolder = storage_path('app/public');
    $linkFolder = public_path('storage');

    // 3. Verifica se o link já existe e o remove (para recriar corretamente)
    if (file_exists($linkFolder)) {
        // Se for um link, removemos o link. Se for pasta, aviso.
        if (is_link($linkFolder)) {
            unlink($linkFolder); 
        } else {
            return "ERRO: Existe uma PASTA REAL chamada 'storage' dentro de public/. Delete-a via FTP e tente de novo.";
        }
    }

    // 4. Cria o link simbólico
    try {
        symlink($targetFolder, $linkFolder);
        return 'SUCESSO: O link das imagens foi corrigido! Tente recarregar sua imagem agora.';
    } catch (\Exception $e) {
        return 'ERRO ao criar link: ' . $e->getMessage();
    }
});