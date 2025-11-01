// src/components/admin/MultipleImageUpload.tsx

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
// Import do Supabase REMOVIDO

/**
 * Interface para a imagem do produto.
 * - id: ID opcional. Necessário se for um slide existente no DB.
 * - url: Pode ser uma URL pública (se a imagem já existe) ou uma URL de objeto local (para preview).
 * - order: A ordem da imagem.
 * - file: O objeto File real, usado para upload se a imagem for nova.
 * - isNew: Flag para identificar imagens que precisam de upload.
 */
interface ProductImage {
  id?: string;
  // 🚨 CORREÇÃO CRÍTICA: Renomeando 'url' para 'image_url'
  image_url: string;
  order: number;
  file?: File;
  isNew?: boolean;
  // Campos de Texto
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  // Configurações da Imagem
  image_fit?: "cover" | "contain" | "fill";
  image_position_x?: number;
  image_position_y?: number;
  image_zoom?: number;
}

interface MultipleImageUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  images = [],
  onChange,
  maxImages = 10,
}) => {
  // Estado de 'uploading' REMOVIDO - o pai gerencia isso.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    const newImages: ProductImage[] = files.map((file, index) => {
      // Cria uma URL local temporária para preview da imagem
      const url = URL.createObjectURL(file);
      return {
        url,
        order: images.length + index,
        file,
        isNew: true,
      };
    });

    // Envia a lista combinada (antigas + novas) para o componente pai
    onChange([...images, ...newImages]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];

    // Limpa a URL de objeto local da memória se for uma imagem nova
    if (imageToRemove.isNew) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    const newImages = images.filter((_, i) => i !== indexToRemove);

    // Reordena as imagens restantes
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reorderedImages);
  };

  // Função 'handleReorderImages' removida pois não estava implementada (sem drag-and-drop).
  // Função 'uploadImage' (específica do Supabase) REMOVIDA.
  // Função 'uploadAllImages' (lógica de upload) REMOVIDA.

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Imagens do Produto</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
        >
          <Upload className="w-4 h-4 mr-2" />
          Adicionar Fotos
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        // Reseta o input para permitir selecionar o mesmo arquivo após remover
        onClick={(e) => (e.currentTarget.value = "")}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={image.url} // Usa a URL como chave (deve ser única)
              className="relative group bg-muted rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image.url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Botão Remover */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Indicador de Ordem */}
              <div className="absolute top-2 left-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium z-10">
                {index + 1}
              </div>

              {/* Lógica de Drag-and-drop removida por simplicidade e por não estar implementada */}

              {image.isNew && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium z-10">
                  Nova
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Clique em "Adicionar Fotos" para enviar imagens do produto
          </p>
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} de {maxImages} imagens.
          {/* Texto de Reordenar removido */}
        </p>
      )}
    </div>
  );
};

export { MultipleImageUpload };
export type { ProductImage }; // Exporta o tipo para o componente pai usar
