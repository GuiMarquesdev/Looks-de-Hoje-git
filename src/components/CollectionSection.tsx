// src/components/CollectionSection.tsx

import { useState, useEffect } from "react";
import { Filter, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductModal from "@/components/ProductModal";
import whatsappIcon from "@/assets/whatsapp-icon.svg";

// --- CORREÇÃO: Importe a API configurada em vez de criar uma constante fixa ---
import { API_URL } from "@/config/api";
// OU, se preferir garantir manualmente agora:
// const API_URL = "https://lookdehoje.com/api";
// ---------------------------------------------------------------------------

const INITIAL_DISPLAY_LIMIT = 6;
// ... resto do código continua igua

interface Product {
  id: string;
  name: string;
  image_url?: string;
  images?: Array<{ url: string; order: number }>;
  image_position_x?: number;
  image_position_y?: number;
  image_zoom?: number;
  category?: { name: string };
  category_id: string;
  status: "available" | "rented";
  description?: string;
  measurements?: Record<string, string>;
  created_at: string;
  updated_at: string;
  price?: number; // 🚨 ALTERADO: Adição do campo de preço
}

interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface StoreSettings {
  whatsapp_url?: string;
  // Adicione outros campos necessários aqui (ex: email, instagram_url)
}

// 🚨 NOVO: Função para formatar o preço em Reais (R$)
const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return "Preço sob consulta";
  // Formatador para o padrão brasileiro (R$)
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(price);
};

const CollectionSection = () => {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Tipagem ajustada para a nova interface
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
    null
  );
  // 🚨 NOVO: Estado para controlar o limite de peças a serem exibidas
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT);

  useEffect(() => {
    fetchData();
  }, []);

  // 🚨 NOVO: Reseta o limite de exibição quando a categoria ativa muda
  useEffect(() => {
    setDisplayLimit(INITIAL_DISPLAY_LIMIT);
  }, [activeCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Pieces (Peças já vêm com a Categoria aninhada do backend)
      const piecesResponse = await fetch(`${API_URL}/pieces`);
      if (!piecesResponse.ok) throw new Error("Erro ao buscar peças");
      const piecesData: Product[] = await piecesResponse.json();

      // 2. Fetch Categories
      const categoriesResponse = await fetch(`${API_URL}/categories`);
      if (!categoriesResponse.ok) throw new Error("Erro ao buscar categorias");
      const categoriesData: Category[] = await categoriesResponse.json();

      // 3. Fetch Store Settings for WhatsApp
      const settingsResponse = await fetch(`${API_URL}/admin/settings`); // Reutiliza endpoint do admin
      // Se a resposta não for OK, apenas loga e continua sem settings, já que é a parte pública
      let settingsData: StoreSettings | null = null;
      if (settingsResponse.ok) {
        settingsData = await settingsResponse.json();
        setStoreSettings(settingsData);
      }

      setProducts(piecesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... (Restante do componente, filtros, handlers e renderização, permanece inalterado)
  const allCategories = [
    { id: "todos", name: "Todos", count: products.length },
    ...categories.map((cat) => ({
      ...cat,
      // Precisa recalcular o count no frontend ou receber do backend
      count: products.filter((p) => p.category_id === cat.id).length,
    })),
  ];

  const filteredProducts =
    activeCategory === "todos"
      ? products
      : products.filter((product) => product.category_id === activeCategory);

  // 🚨 NOVO: Aplica o limite de exibição aos produtos filtrados
  const displayedProducts = filteredProducts.slice(0, displayLimit);
  const hasMoreProducts = filteredProducts.length > displayLimit;

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // 🚨 NOVO: Handler para aumentar o limite de exibição
  const handleViewMore = () => {
    // Aumenta o limite em mais 6 (INITIAL_DISPLAY_LIMIT) peças
    setDisplayLimit((prevLimit) => prevLimit + INITIAL_DISPLAY_LIMIT);
  };

  // Os handlers de WhatsApp agora usam a constante `storeSettings`
  const whatsappRent = (productName: string) => {
    // Extrai apenas dígitos para o número
    const whatsappNumber =
      storeSettings?.whatsapp_url?.replace(/\D/g, "") || "5511999999999";
    const message = `Olá! Gostaria de alugar o ${productName} do LooksdeHoje. Poderia me dar mais informações?`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const whatsappNotify = (productName: string) => {
    const whatsappNumber =
      storeSettings?.whatsapp_url?.replace(/\D/g, "") || "5511999999999";
    const message = `Olá, gostaria de ser avisado(a) quando a peça ${productName} estiver disponível novamente.`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (loading) {
    // ... (Loading state)
    return (
      <section id="colecao" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nossa Coleção
            </h2>
            <p className="font-montserrat text-lg text-muted-foreground">
              Carregando nossa coleção...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    // ... (Restante da renderização)
    <>
      <section id="colecao" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nossa Coleção
            </h2>
            <p className="font-montserrat text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra looks únicos para cada ocasião. Elegância e sofisticação
              para momentos especiais.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`inline-flex items-center px-4 py-2 rounded-full font-montserrat font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                  activeCategory === category.id
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "bg-background text-foreground hover:bg-muted border border-border"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {category.name}
                <span
                  className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    activeCategory === category.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in">
            {/* 🚨 ALTERADO: Mapeia `displayedProducts` em vez de `filteredProducts` */}
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product) => {
                const isAvailable = product.status === "available";
                return (
                  <div
                    key={product.id}
                    id={`product-card-${product.id}`}
                    data-component="ProductCard"
                    className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/80 shadow-md hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
                    onClick={() => openProductModal(product)}
                  >
                    {/* Top subtle golden shimmer line on hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                    {/* Product Image Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/30">
                      {(() => {
                        // Priority: images array first, then fallback to image_url
                        const firstImage =
                          product.images &&
                          (product.images as Array<any>).length > 0
                            ? (product.images as Array<any>).sort(
                                (a, b) => a.order - b.order
                              )[0]
                            : null;
                        const imageUrl = firstImage?.url || product.image_url;

                        return imageUrl ? (
                          <>
                            <div
                              className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                              style={{
                                backgroundImage: `url('${imageUrl}')`,
                                backgroundSize: `${product.image_zoom ?? 100}%`,
                                backgroundPosition: `${
                                  product.image_position_x ?? 50
                                }% ${product.image_position_y ?? 50}%`,
                                backgroundRepeat: "no-repeat",
                              }}
                            />
                            {/* Subtle dark gradient overlay at bottom of photo for depth */}
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

                            {/* Multiple images indicator badge */}
                            {product.images &&
                              (product.images as Array<any>).length > 1 && (
                                <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md text-white rounded-full px-2.5 py-1 text-xs font-montserrat font-medium tracking-wide border border-white/20 shadow-md">
                                  +{(product.images as Array<any>).length} fotos
                                </div>
                              )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-muted/60 flex items-center justify-center">
                            <span className="text-muted-foreground font-montserrat text-sm">
                              Sem imagem
                            </span>
                          </div>
                        );
                      })()}

                      {/* Status Badge */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-montserrat font-semibold backdrop-blur-md shadow-md transition-transform duration-200 border ${
                            isAvailable
                              ? "bg-emerald-600/90 text-white border-emerald-400/40"
                              : "bg-rose-600/90 text-white border-rose-400/40"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAvailable ? "bg-white animate-pulse" : "bg-white/80"
                            }`}
                          />
                          {isAvailable ? "Disponível" : "Alugado"}
                        </span>
                      </div>

                      {/* Hover Overlay with Quick Action */}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAvailable) {
                              whatsappRent(product.name);
                            } else {
                              whatsappNotify(product.name);
                            }
                          }}
                          className={`font-montserrat font-semibold px-5 py-2.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 ${
                            isAvailable
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-primary text-black hover:bg-black hover:text-primary"
                          }`}
                        >
                          <img
                            src={whatsappIcon}
                            alt="WhatsApp"
                            className="w-4 h-4 mr-2"
                          />
                          {isAvailable ? "Alugar no WhatsApp" : "Me avise quando voltar"}
                        </Button>
                        <span className="text-[11px] font-montserrat text-white/90 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Clique no card para ver detalhes
                        </span>
                      </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="p-5 flex flex-col flex-1 justify-between bg-card">
                      <div>
                        {/* Category tag */}
                        {product.category?.name && (
                          <span className="inline-block font-montserrat text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/80 mb-1.5">
                            {product.category.name}
                          </span>
                        )}

                        {/* Title */}
                        <h3 className="font-playfair text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      {/* Price & Action Row */}
                      <div className="pt-4 mt-3 border-t border-border/60 flex items-end justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-montserrat uppercase tracking-wider text-muted-foreground font-semibold">
                            Aluguel
                          </span>
                          <span className="font-playfair text-2xl font-black text-foreground tracking-tight">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAvailable) {
                              whatsappRent(product.name);
                            } else {
                              whatsappNotify(product.name);
                            }
                          }}
                          className={`font-montserrat font-semibold text-xs px-4 py-2 rounded-full shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 shrink-0 border-0 ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                            isAvailable
                              ? "bg-gradient-gold hover:bg-amber-400 text-black"
                              : "bg-muted text-muted-foreground hover:bg-foreground hover:text-background"
                          }`}
                        >
                          <img
                            src={whatsappIcon}
                            alt="WhatsApp"
                            className="w-3.5 h-3.5 mr-1.5"
                          />
                          {isAvailable ? "Alugar" : "Avise-me"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="font-montserrat text-lg text-muted-foreground">
                  Nenhuma peça encontrada nesta categoria.
                </p>
              </div>
            )}
          </div>

          {/* View More Button */}
          {/* 🚨 ALTERADO: Usa a nova condição `hasMoreProducts` e o handler `handleViewMore` */}
          {hasMoreProducts && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={handleViewMore}
                className="font-montserrat font-semibold px-8 py-3 rounded-full border-2 border-primary text-primary hover:bg-gradient-gold hover:text-primary-foreground hover:border-transparent transition-all duration-300"
              >
                Ver Mais Peças
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        // O ProductModal receberá a URL do WhatsApp das settings carregadas.
        whatsappUrl={
          storeSettings?.whatsapp_url?.replace(/\D/g, "") || "5511999999999"
        }
      />
    </>
  );
};

export default CollectionSection;
