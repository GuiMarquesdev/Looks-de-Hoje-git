// src/components/CollectionSection.tsx

import { useState, useEffect, useMemo } from "react";
import { Filter, Eye, Sparkles, Search, X, ArrowUpDown, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProductModal from "@/components/ProductModal";
import whatsappIcon from "@/assets/whatsapp-icon.svg";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import { API_URL } from "@/config/api";

const INITIAL_DISPLAY_LIMIT = 6;

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
  price?: number;
}

interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return "Preço sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(price);
};

const CollectionSection = () => {
  const { getWhatsAppUrl, settings } = useStoreSettings();

  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "rented">("all");
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc" | "name_asc">("recent");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT);

  useEffect(() => {
    fetchData();
  }, []);

  // Reseta o limite de exibição sempre que os filtros mudarem
  useEffect(() => {
    setDisplayLimit(INITIAL_DISPLAY_LIMIT);
  }, [activeCategory, searchTerm, statusFilter, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [piecesResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_URL}/pieces`),
        fetch(`${API_URL}/categories`),
      ]);

      if (piecesResponse.ok) {
        const piecesData: Product[] = await piecesResponse.json();
        setProducts(piecesData);
      }

      if (categoriesResponse.ok) {
        const categoriesData: Category[] = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const allCategories = useMemo(() => [
    { id: "todos", name: "Todos", count: products.length },
    ...categories.map((cat) => ({
      ...cat,
      count: products.filter((p) => p.category_id === cat.id).length,
    })),
  ], [categories, products]);

  // Filtragem e ordenação dos produtos
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Filtro de Categoria
    if (activeCategory !== "todos") {
      result = result.filter((p) => p.category_id === activeCategory);
    }

    // 2. Filtro de Status (Disponível / Alugado)
    if (statusFilter === "available") {
      result = result.filter((p) => p.status === "available");
    } else if (statusFilter === "rented") {
      result = result.filter((p) => p.status === "rented");
    }

    // 3. Filtro de Busca (Nome, Descrição, Categoria)
    const cleanSearch = searchTerm.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (cleanSearch) {
      result = result.filter((p) => {
        const nameNorm = (p.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const descNorm = (p.description || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const catNorm = (p.category?.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nameNorm.includes(cleanSearch) || descNorm.includes(cleanSearch) || catNorm.includes(cleanSearch);
      });
    }

    // 4. Ordenação
    if (sortBy === "price_asc") {
      result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR"));
    }

    return result;
  }, [products, activeCategory, statusFilter, searchTerm, sortBy]);

  const displayedProducts = filteredAndSortedProducts.slice(0, displayLimit);
  const hasMoreProducts = filteredAndSortedProducts.length > displayLimit;

  const isFilterActive =
    searchTerm.trim() !== "" ||
    activeCategory !== "todos" ||
    statusFilter !== "all" ||
    sortBy !== "recent";

  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveCategory("todos");
    setStatusFilter("all");
    setSortBy("recent");
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleViewMore = () => {
    setDisplayLimit((prevLimit) => prevLimit + INITIAL_DISPLAY_LIMIT);
  };

  const whatsappRent = (productName: string) => {
    const message = `Olá! Gostaria de alugar o look "${productName}" no ${settings.store_name || "Looks de Hoje"}. Poderia me dar mais informações?`;
    window.open(getWhatsAppUrl(message), "_blank");
  };

  const whatsappNotify = (productName: string) => {
    const message = `Olá! Gostaria de ser avisada quando a peça "${productName}" estiver disponível novamente para aluguel.`;
    window.open(getWhatsAppUrl(message), "_blank");
  };

  if (loading) {
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
    <>
      <section id="colecao" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Nossa Coleção
            </h2>
            <p className="font-montserrat text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra looks únicos para cada ocasião. Elegância e sofisticação
              para momentos inesquecíveis.
            </p>
          </div>

          {/* Search and Advanced Filters Container */}
          <div className="max-w-4xl mx-auto mb-10 space-y-4">
            {/* Top Filter Bar: Search + Status Toggle + Sort */}
            <div className="bg-card/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-border/70 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search Bar Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar vestidos, conjuntos, modelos, tamanhos..."
                  className="pl-9 pr-9 h-11 bg-background/80 border-border/80 rounded-xl font-montserrat text-sm focus-visible:ring-primary/40"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Segmented Control */}
              <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-medium transition-all ${
                    statusFilter === "all"
                      ? "bg-card text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("available")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-medium transition-all flex items-center gap-1.5 ${
                    statusFilter === "available"
                      ? "bg-emerald-600 text-white shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Disponíveis
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("rented")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-medium transition-all ${
                    statusFilter === "rented"
                      ? "bg-card text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Alugadas
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline-block" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="h-11 px-3 bg-background/80 border border-border/80 rounded-xl text-xs sm:text-sm font-montserrat text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  aria-label="Ordenar produtos"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                  <option value="name_asc">Nome (A - Z)</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center px-4 py-2 rounded-full font-montserrat text-xs sm:text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                    activeCategory === category.id
                      ? "bg-gradient-gold text-primary-foreground shadow-gold font-semibold"
                      : "bg-card text-foreground hover:bg-muted border border-border/80"
                  }`}
                >
                  {category.name}
                  <span
                    className={`ml-2 text-[11px] px-2 py-0.5 rounded-full ${
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

            {/* Active Filter summary and Clear button */}
            {isFilterActive && (
              <div className="flex flex-wrap items-center justify-between text-xs font-montserrat text-muted-foreground px-1 pt-1">
                <span>
                  Exibindo{" "}
                  <strong className="text-foreground font-semibold">
                    {displayedProducts.length}
                  </strong>{" "}
                  de{" "}
                  <strong className="text-foreground font-semibold">
                    {filteredAndSortedProducts.length}
                  </strong>{" "}
                  peças encontradas
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in">
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
              <div className="col-span-full text-center py-16 px-4 bg-card/50 rounded-2xl border border-border/60">
                <Search className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                <h4 className="font-playfair text-xl font-bold text-foreground mb-2">
                  Nenhuma peça encontrada
                </h4>
                <p className="font-montserrat text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  {searchTerm
                    ? `Não encontramos resultados para "${searchTerm}". Tente outros termos ou remova filtros.`
                    : "Não encontramos peças com a combinação de filtros selecionada."}
                </p>
                {isFilterActive && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="font-montserrat text-xs gap-2 rounded-full border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar filtros e ver todas as peças
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* View More Button */}
          {hasMoreProducts && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={handleViewMore}
                className="font-montserrat font-semibold px-8 py-3 rounded-full border-2 border-primary text-primary hover:bg-gradient-gold hover:text-primary-foreground hover:border-transparent transition-all duration-300"
              >
                Ver Mais Peças ({filteredAndSortedProducts.length - displayedProducts.length} restantes)
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
        whatsappUrl={
          settings.whatsapp_url?.replace(/\D/g, "") || "5571992771527"
        }
      />
    </>
  );
};

export default CollectionSection;
