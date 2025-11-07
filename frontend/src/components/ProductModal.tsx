// guimarquesdev/looks-de-hoje-git/Looks-de-Hoje-git-09219f1fd0a1688ed42e10d4ed53d02dea107fd6/frontend/src/components/ProductModal.tsx

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // ADICIONADO para acessibilidade
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ContactChannels from "@/components/ContactChannels";
import ProductImageCarousel from "@/components/ProductImageCarousel";

// Tipo que o Carrossel espera (camelCase)
interface CarouselImageSource {
  url: string;
  order: number;
  imagePositionX?: number;
  imagePositionY?: number;
  imageZoom?: number;
}

// Renomeado para ModalComponentProps para evitar conflitos de tipagem/cache
interface ModalComponentProps {
  product: {
    id: string;
    name: string;
    image_url?: string;
    // O tipo images reflete o dado bruto do backend (snake_case)
    images?: Array<{
      url: string;
      order: number;
      image_position_x?: number;
      image_position_y?: number;
      image_zoom?: number;
    }>;
    image_position_x?: number;
    image_position_y?: number;
    image_zoom?: number;
    category?: { name: string };
    status: "available" | "rented";
    description?: string;
    measurements?: any;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl?: string;
}

const ProductModal: React.FC<ModalComponentProps> = ({
  product,
  isOpen,
  onClose,
  whatsappUrl = "5511999999999",
}) => {
  if (!product) return null;

  const getContactMessage = () => {
    if (isAvailable) {
      return `Olá! Gostaria de alugar o ${product.name} do LooksdeHoje. Poderia me dar mais informações?`;
    } else {
      return `Olá, gostaria de ser avisado(a) quando a peça ${product.name} estiver disponível novamente.`;
    }
  };

  const isAvailable = product.status === "available";

  // CORREÇÃO: Mapeia o array de imagens do produto (snake_case) para o formato esperado pelo Carousel (camelCase).
  const mappedImagesForCarousel: CarouselImageSource[] =
    product.images && product.images.length > 0
      ? product.images.map((image) => ({
          url: image.url,
          order: image.order,
          // Mapeamento explícito de snake_case para camelCase
          imagePositionX: image.image_position_x,
          imagePositionY: image.image_position_y,
          imageZoom: image.image_zoom,
        }))
      : product.image_url
      ? [
          {
            url: product.image_url,
            order: 0,
            // Mapeia as propriedades do produto principal para o item único
            imagePositionX: product.image_position_x,
            imagePositionY: product.image_position_y,
            imageZoom: product.image_zoom,
          },
        ]
      : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-foreground">
            {product.name}
          </DialogTitle>

          {/* Adicionado para acessibilidade */}
          <DialogDescription className="sr-only">
            {product.description || `Detalhes da peça ${product.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Images Carousel */}
          <div className="relative">
            <ProductImageCarousel
              images={mappedImagesForCarousel as any} // Mantido 'as any' para forçar a compilação por causa da anomalia de tipagem do bundler
              productName={product.name}
              imagePositionX={product.image_position_x}
              imagePositionY={product.image_position_y}
              imageZoom={product.image_zoom}
            />

            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge
                variant={isAvailable ? "default" : "destructive"}
                className={`font-montserrat font-semibold ${
                  isAvailable
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {isAvailable ? "Disponível" : "Alugado"}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Category */}
            <div>
              <span className="font-montserrat text-sm text-muted-foreground">
                Categoria:{" "}
                <span className="font-semibold">{product.category?.name}</span>
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h4 className="font-montserrat font-semibold text-foreground mb-2">
                  Descrição
                </h4>
                <p className="font-montserrat text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Measurements */}
            {product.measurements && (
              <div>
                <h4 className="font-montserrat font-semibold text-foreground mb-2">
                  Medidas
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(product.measurements).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between bg-muted rounded-lg p-3"
                    >
                      <span className="font-montserrat font-medium capitalize">
                        {key}:
                      </span>
                      <span className="font-montserrat text-muted-foreground">
                        {value as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Contact Channels */}
          <div className="pt-6 border-t">
            <div className="text-center mb-4">
              <p className="font-montserrat text-muted-foreground text-sm">
                {isAvailable
                  ? "Entre em contato para alugar:"
                  : "Entre em contato para ser avisado:"}
              </p>
            </div>
            <ContactChannels
              productName={product.name}
              message={getContactMessage()}
              size="md"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
