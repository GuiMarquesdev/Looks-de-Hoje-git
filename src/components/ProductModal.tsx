import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
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
    // Preço do aluguel da peça
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
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Intercepta o botão "voltar" físico ou gesto do celular para fechar o modal
  // em vez de voltar para a página anterior / sair do site
  useEffect(() => {
    if (!isOpen) return;

    let isHandledByPopState = false;
    const historyState = { modal: "product-details", id: product?.id };

    try {
      window.history.pushState(historyState, "");
    } catch {
      // Ignora se a API de histórico não tiver permissão
    }

    const handlePopState = () => {
      isHandledByPopState = true;
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Se o modal foi fechado por clique no botão "Voltar", "X", fora do modal ou ESC,
      // limpamos a entrada de histórico criada para manter a navegação limpa
      if (!isHandledByPopState) {
        try {
          if (window.history.state?.modal === "product-details") {
            window.history.back();
          }
        } catch {
          // Ignora
        }
      }
    };
  }, [isOpen, product?.id]);

  if (!product) return null;

  const isAvailable = product.status === "available";

  const getContactMessage = () => {
    if (isAvailable) {
      return `Olá! Gostaria de alugar o ${product.name} do LooksdeHoje. Poderia me dar mais informações?`;
    } else {
      return `Olá, gostaria de ser avisado(a) quando a peça ${product.name} estiver disponível novamente.`;
    }
  };

  // Mapeia o array de imagens do produto (snake_case) para o formato esperado pelo Carousel (camelCase).
  const mappedImagesForCarousel: CarouselImageSource[] =
    product.images && product.images.length > 0
      ? product.images.map((image) => ({
          url: image.url,
          order: image.order,
          imagePositionX: image.image_position_x,
          imagePositionY: image.image_position_y,
          imageZoom: image.image_zoom,
        }))
      : product.image_url
      ? [
          {
            url: product.image_url,
            order: 0,
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
      <DialogContent
        id="product-modal-content"
        data-component="ProductModal"
        className="max-w-2xl w-[95vw] sm:w-full max-h-[92vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/10 border border-border/80 shadow-2xl rounded-2xl sm:rounded-3xl [&>button]:hidden"
      >
        {/* Header Section com barra de voltar dedicada para celular */}
        <DialogHeader
          id="product-modal-header"
          className="px-4 sm:px-6 pt-3.5 pb-3 sm:pt-4 sm:pb-4 border-b border-border/60 bg-white/95 backdrop-blur-md sticky top-0 z-30 space-y-2.5"
        >
          {/* Barra Superior de Ações: Botão Voltar + Valor + Botão Fechar */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              id="btn-product-modal-back-top"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-foreground bg-secondary/90 hover:bg-secondary active:scale-95 rounded-full border border-border/70 transition-all cursor-pointer min-h-[42px] touch-manipulation shadow-xs hover:border-primary/50"
              aria-label="Voltar para a vitrine de vestidos"
            >
              <ArrowLeft className="w-4 h-4 text-primary shrink-0" />
              <span>Voltar</span>
              <span className="hidden xs:inline sm:inline text-muted-foreground text-xs font-normal">ao catálogo</span>
            </button>

            <div className="flex items-center gap-2">
              {product.price !== undefined && product.price !== null && (
                <div
                  id="product-modal-price-box"
                  className="text-right bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 border border-primary/30 shadow-xs"
                >
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground font-montserrat font-bold uppercase tracking-wider leading-none mb-0.5">
                    Valor
                  </p>
                  <span
                    id="product-modal-price-value"
                    className="font-playfair text-base sm:text-xl font-bold text-foreground block tracking-tight leading-none"
                  >
                    {formatPrice(product.price)}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                id="btn-product-modal-close"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/90 hover:bg-secondary active:scale-95 text-foreground/80 hover:text-foreground border border-border/70 transition-all cursor-pointer touch-manipulation shadow-xs hover:border-primary/50"
                aria-label="Fechar detalhes da peça"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nome da Peça e Tags */}
          <div className="space-y-1.5 text-left">
            <DialogTitle
              id="product-modal-title"
              className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight"
            >
              {product.name}
            </DialogTitle>

            <div className="flex items-center gap-2 flex-wrap">
              {product.category?.name && (
                <span
                  id="product-modal-category"
                  className="font-montserrat text-xs font-medium text-foreground/80 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-secondary/80 rounded-full border border-border/70 backdrop-blur-sm"
                >
                  {product.category.name}
                </span>
              )}

              <Badge
                id="product-modal-status-badge"
                variant={isAvailable ? "default" : "destructive"}
                className={`font-montserrat text-xs font-semibold px-2.5 py-0.5 shadow-xs transition-all duration-300 ${
                  isAvailable
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700 text-white border-rose-700"
                }`}
              >
                {isAvailable ? "✓ Disponível" : "✗ Alugado"}
              </Badge>
            </div>
          </div>

          <DialogDescription className="sr-only">
            {product.description || `Detalhes da peça ${product.name}`}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div
          id="product-modal-body"
          className="overflow-y-auto max-h-[calc(92vh-130px)] custom-scrollbar"
        >
          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5">
            {/* Product Images Carousel Card */}
            <div
              id="product-modal-carousel-card"
              className="relative max-w-sm sm:max-w-md mx-auto rounded-2xl overflow-hidden shadow-luxury border border-border/70 bg-card p-1.5"
            >
              <div id="product-modal-carousel" className="rounded-xl overflow-hidden">
                <ProductImageCarousel
                  images={mappedImagesForCarousel as any}
                  productName={product.name}
                  imagePositionX={product.image_position_x}
                  imagePositionY={product.image_position_y}
                  imageZoom={product.image_zoom}
                />
              </div>
            </div>

            {/* Product Information Grid */}
            <div id="product-modal-info-grid" className="grid gap-4">
              {/* Description Section Card */}
              {product.description && (
                <div
                  id="product-modal-description-card"
                  className="bg-card rounded-2xl p-4 sm:p-5 border border-border/70 shadow-sm hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="w-1.5 h-4 bg-primary rounded-full" />
                    <h4 className="font-montserrat font-bold text-foreground text-sm uppercase tracking-wide">
                      Descrição da Peça
                    </h4>
                  </div>
                  <p className="font-montserrat text-sm text-muted-foreground leading-relaxed pl-3.5 border-l border-primary/20">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Measurements Section Card */}
              {product.measurements &&
                Object.keys(product.measurements).length > 0 && (
                  <div
                    id="product-modal-measurements-card"
                    className="bg-card rounded-2xl p-4 sm:p-5 border border-border/70 shadow-sm hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-3.5">
                      <span className="w-1.5 h-4 bg-primary rounded-full" />
                      <h4 className="font-montserrat font-bold text-foreground text-sm uppercase tracking-wide">
                        Tabela de Medidas
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(product.measurements).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            id={`product-modal-measurement-${key}`}
                            className="group relative bg-secondary/50 rounded-xl p-3 border border-border/60 hover:border-primary/60 hover:bg-background hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="font-montserrat font-medium uppercase text-[10px] text-muted-foreground tracking-wider">
                                {key}
                              </span>
                              <span className="font-montserrat text-foreground font-bold text-base tracking-tight">
                                {value as string}
                              </span>
                            </div>
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Contact Section Card */}
            <div
              id="product-modal-contact-section"
              className="rounded-2xl p-4 sm:p-5 border border-primary/30 bg-gradient-to-b from-primary/10 via-primary/5 to-card shadow-sm space-y-4"
            >
              <div className="text-center space-y-1">
                <p className="font-playfair text-lg font-bold text-foreground">
                  {isAvailable
                    ? "Interesse nesta peça?"
                    : "Peça indisponível no momento"}
                </p>
                <p className="font-montserrat text-xs text-muted-foreground">
                  {isAvailable
                    ? "Escolha um dos canais abaixo para agendar a prova ou reservar seu look:"
                    : "Fale conosco para consultar disponibilidade ou reservar para outra data:"}
                </p>
              </div>
              <ContactChannels
                productName={product.name}
                message={getContactMessage()}
                size="md"
              />
            </div>

            {/* Botão de Rodapé para voltar fácil sem precisar rolar até o topo */}
            <div className="pt-2 pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                id="btn-product-modal-bottom-back"
                className="w-full py-3.5 sm:py-4 h-auto text-sm font-semibold border-border/80 bg-secondary/50 hover:bg-secondary text-foreground rounded-xl transition-all shadow-xs touch-manipulation cursor-pointer hover:border-primary/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
                Voltar para o Catálogo de Vestidos
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;