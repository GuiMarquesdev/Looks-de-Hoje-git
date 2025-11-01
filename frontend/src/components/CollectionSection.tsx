// src/components/CollectionSection.tsx

import { useState, useEffect } from "react";
// REMOVER: import { supabase } from "@/integrations/supabase/client"; // REMOVIDO
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductModal from "@/components/ProductModal";
import whatsappIcon from "@/assets/whatsapp-icon.svg";

// Importa a URL base da API
const API_URL = "http://localhost:3000/api";

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

  useEffect(() => {
    fetchData();
  }, []);

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

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
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
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const isAvailable = product.status === "available";
                return (
                  <div
                    key={product.id}
                    className="luxury-card hover-lift group overflow-hidden cursor-pointer border-2 border-border/50 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
                    onClick={() => openProductModal(product)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
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
                              className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                              style={{
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: `${product.image_zoom ?? 100}%`,
                                backgroundPosition: `${
                                  product.image_position_x ?? 50
                                }% ${product.image_position_y ?? 50}%`,
                                backgroundRepeat: "no-repeat",
                              }}
                            />
                            {/* Multiple images indicator */}
                            {product.images &&
                              (product.images as Array<any>).length > 1 && (
                                <div className="absolute top-4 left-4 bg-black/70 text-white rounded-full px-2 py-1 text-xs font-montserrat">
                                  +{(product.images as Array<any>).length} fotos
                                </div>
                              )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">
                              Sem imagem
                            </span>
                          </div>
                        );
                      })()}

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
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

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            isAvailable
                              ? whatsappRent(product.name)
                              : whatsappNotify(product.name);
                          }}
                          className={`font-montserrat font-semibold px-6 py-3 rounded-full shadow-gold transition-all duration-300 ${
                            isAvailable
                              ? "bg-gradient-gold hover:bg-primary-dark text-primary-foreground"
                              : "bg-yellow-400 hover:bg-black text-black hover:text-yellow-400 border border-yellow-400"
                          }`}
                        >
                          <img
                            src={whatsappIcon}
                            alt="WhatsApp"
                            className="w-4 h-4 mr-2"
                          />
                          {isAvailable
                            ? "Alugar pelo WhatsApp"
                            : "Me avise quando estiver disponível"}
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-playfair text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <span className="font-montserrat text-sm text-muted-foreground capitalize">
                          {product.category?.name}
                        </span>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            isAvailable
                              ? whatsappRent(product.name)
                              : whatsappNotify(product.name);
                          }}
                          className={`font-montserrat font-medium px-4 py-2 rounded-full shadow-gold transition-all duration-300 ${
                            isAvailable
                              ? "bg-gradient-gold hover:bg-primary-dark text-primary-foreground"
                              : "bg-yellow-400 hover:bg-black text-black hover:text-yellow-400 border border-yellow-400"
                          }`}
                        >
                          <img
                            src={whatsappIcon}
                            alt="WhatsApp"
                            className="w-3 h-3 mr-1"
                          />
                          {isAvailable ? "Alugar" : "Me avise"}
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
          {products.length > 6 && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
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
