// frontend/src/components/admin/MultipleImageUpload.tsx

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ProductImage {
  id?: string;
  image_url: string;
  order: number;
  file?: File;
  isNew?: boolean;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    const newImages: ProductImage[] = files.map((file, index) => {
      const url = URL.createObjectURL(file);
      return {
        image_url: url,
        order: images.length + index,
        file,
        isNew: true,
      };
    });

    onChange([...images, ...newImages]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];

    if (imageToRemove.isNew && imageToRemove.image_url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.image_url);
    }

    const newImages = images.filter((_, i) => i !== indexToRemove);
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reorderedImages);
  };

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
        onClick={(e) => (e.currentTarget.value = "")}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={`${image.image_url}-${index}`}
              className="relative group bg-muted rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image.image_url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Erro ao carregar imagem:", image.image_url);
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EErro%3C/text%3E%3C/svg%3E";
                }}
              />

              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute top-2 left-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium z-10">
                {index + 1}
              </div>

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
          {images.length} de {maxImages} imagens. A primeira imagem será a
          principal.
        </p>
      )}
    </div>
  );
};

export { MultipleImageUpload };
export type { ProductImage };
