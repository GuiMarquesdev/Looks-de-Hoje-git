// guimarquesdev/looks-de-hoje-git/Looks-de-Hoje-git-09219f1fd0a1688ed42e10d4ed53d02dea107fd6/frontend/src/components/ProductImageCarousel.tsx

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
// ADICIONADO: Importar a URL base da API para construir URLs absolutas
import { API_URL } from "@/config/api";

// CORRIGIDO: Interface atualizada para incluir as propriedades de enquadramento (camelCase)
interface ProductImage {
  url: string | undefined | null; // Permitir nulo/indefinido para segurança
  order: number;
  imagePositionX?: number; // Propriedade opcional
  imagePositionY?: number; // Propriedade opcional
  imageZoom?: number; // Propriedade opcional
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  productName: string;
  // Propriedades padrão para a primeira imagem (ou a única imagem)
  imagePositionX?: number;
  imagePositionY?: number;
  imageZoom?: number;
  className?: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  productName,
  imagePositionX = 50,
  imagePositionY = 50,
  imageZoom = 100,
  className = "",
}) => {
  // Ordenar imagens pela ordem
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  // Determinar a URL base para ativos (imagens)
  const imageBaseUrl = API_URL.endsWith("/api")
    ? API_URL.substring(0, API_URL.lastIndexOf("/api"))
    : API_URL;

  // Função auxiliar para garantir que a URL da imagem seja absoluta/completa (Correção do Uncaught TypeError)
  const ensureAbsoluteUrl = (url: string | undefined | null): string => {
    if (!url || typeof url !== "string" || url.length === 0) {
      return "";
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const normalizedUrl = url.startsWith("/") ? url.substring(1) : url;
    return `${imageBaseUrl}/${normalizedUrl}`;
  };

  // Se não houver imagens, mostra um placeholder
  if (!sortedImages.length) {
    return (
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-muted flex items-center justify-center ${className}`}
      >
        <span className="text-muted-foreground">Sem imagem</span>
      </div>
    );
  }

  // Se houver apenas uma imagem
  if (sortedImages.length === 1) {
    const image = sortedImages[0];
    const imageUrl = ensureAbsoluteUrl(image.url);
    if (!imageUrl) {
      return (
        <div
          className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-muted flex items-center justify-center ${className}`}
        >
          <span className="text-muted-foreground">Sem imagem</span>
        </div>
      );
    }

    // Usa as props do componente como fallback para a imagem única
    const singleImagePositionX = image.imagePositionX ?? imagePositionX;
    const singleImagePositionY = image.imagePositionY ?? imagePositionY;
    const singleImageZoom = image.imageZoom ?? imageZoom;

    return (
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-lg ${className}`}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${imageUrl})`, // URL CORRIGIDA
            backgroundSize: `${singleImageZoom}%`,
            backgroundPosition: `${singleImagePositionX}% ${singleImagePositionY}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    );
  }

  // Se houver múltiplas imagens (carrossel)
  return (
    <div className={`relative ${className}`}>
      <Carousel className="w-full">
        <CarouselContent>
          {sortedImages.map((image, index) => {
            const imageUrl = ensureAbsoluteUrl(image.url);
            if (!imageUrl) return null; // Pula slides sem URL válida

            // Lógica de fallback para carrossel: usa a prop da imagem, senão usa a prop do componente (apenas para o index 0) ou um valor padrão (50/100)
            const currentPositionX =
              image.imagePositionX ?? (index === 0 ? imagePositionX : 50);
            const currentPositionY =
              image.imagePositionY ?? (index === 0 ? imagePositionY : 50);
            const currentZoom =
              image.imageZoom ?? (index === 0 ? imageZoom : 100);

            return (
              <CarouselItem key={index}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${imageUrl})`, // URL CORRIGIDA
                      backgroundSize: `${currentZoom}%`,
                      backgroundPosition: `${currentPositionX}% ${currentPositionY}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {sortedImages.length} fotos
      </div>
    </div>
  );
};

export default ProductImageCarousel;
