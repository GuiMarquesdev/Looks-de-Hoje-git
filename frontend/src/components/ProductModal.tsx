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
    // CORREÇÃO: Adicionado o campo 'price'
    price?: number;
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

  // Helper para formatar o preço em moeda BRL (Real Brasileiro)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/10">
        {/* Header Section */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <DialogTitle className="font-playfair text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                {product.name}
              </DialogTitle>

              <div className="flex items-center gap-2 flex-wrap">
                {product.category?.name && (
                  <span className="font-montserrat text-xs text-muted-foreground px-3 py-1.5 bg-muted/60 rounded-full border border-border/50 backdrop-blur-sm">
                    {product.category.name}
                  </span>
                )}

                <Badge
                  variant={isAvailable ? "default" : "destructive"}
                  className={`font-montserrat font-semibold shadow-md transition-all duration-300 hover:scale-105 ${
                    isAvailable
                      ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                      : "bg-red-500 hover:bg-red-600 text-white border-red-600"
                  }`}
                >
                  {isAvailable ? "✓ Disponível" : "✗ Alugado"}
                </Badge>
              </div>
            </div>

            {product.price !== undefined && product.price !== null && (
              <div className="text-right bg-muted/30 rounded-xl px-4 py-3 border border-border/50">
                <p className="text-xs text-muted-foreground font-montserrat mb-0.5 uppercase tracking-wide">
                  Valor
                </p>
                <span className="font-playfair text-2xl md:text-3xl font-bold text-foreground block">
                  {formatPrice(product.price)}
                </span>
              </div>
            )}
          </div>

          <DialogDescription className="sr-only">
            {product.description || `Detalhes da peça ${product.name}`}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] custom-scrollbar">
          <div className="px-6 py-6 space-y-6">
            {/* Product Images Carousel */}
            <div className="relative">
              <ProductImageCarousel
                images={mappedImagesForCarousel as any}
                productName={product.name}
                imagePositionX={product.image_position_x}
                imagePositionY={product.image_position_y}
                imageZoom={product.image_zoom}
              />
            </div>

            {/* Product Information Grid */}
            <div className="grid gap-6">
              {/* Description Section */}
              {product.description && (
                <div className="bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-6 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
                  <h4 className="font-montserrat font-semibold text-foreground mb-3 flex items-center gap-2 text-lg">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    Descrição
                  </h4>
                  <p className="font-montserrat text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Measurements Section */}
              {product.measurements &&
                Object.keys(product.measurements).length > 0 && (
                  <div className="bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-6 border border-border/50 backdrop-blur-sm">
                    <h4 className="font-montserrat font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                      <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                      Medidas
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(product.measurements).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="group relative bg-background/90 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:border-primary/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                          >
                            <div className="flex flex-col gap-1.5">
                              <span className="font-montserrat font-medium capitalize text-xs text-muted-foreground tracking-wider">
                                {key}
                              </span>
                              <span className="font-montserrat text-foreground font-bold text-lg">
                                {value as string}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Contact Section */}
            <div className="pt-6 border-t border-border/30">
              <div className="text-center mb-5 bg-muted/30 rounded-xl p-4 border border-border/50">
                <p className="font-montserrat text-muted-foreground font-medium">
                  {isAvailable
                    ? "🎉 Entre em contato para alugar esta peça🎉"
                    : "🔔 Quer ser notificado quando estiver disponível?🔔"}
                </p>
              </div>
              <ContactChannels
                productName={product.name}
                message={getContactMessage()}
                size="lg"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
