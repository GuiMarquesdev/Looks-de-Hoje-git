// src/components/HeroSection.tsx

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowDown, ShieldCheck, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/config/api";

import heroDress1 from "@/assets/hero-dress-1.jpg";
import heroDress2 from "@/assets/hero-dress-2.jpg";
import heroDress3 from "@/assets/hero-dress-3.jpg";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  image_fit?: "cover" | "contain" | "fill" | "none";
  image_position?: string;
  image_position_x?: number;
  image_position_y?: number;
  image_zoom?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  overlay_opacity?: number;
  filter_preset?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: "default-1",
    image_url: heroDress1,
    title: "Elegância em Cada Ocasião",
    subtitle: "Alugue looks únicos e deslumbrantes para momentos inesquecíveis",
  },
  {
    id: "default-2",
    image_url: heroDress2,
    title: "Estilo & Alta Costura",
    subtitle: "Descubra a coleção mais exclusiva e sofisticada de vestidos e conjuntos",
  },
  {
    id: "default-3",
    image_url: heroDress3,
    title: "Luxo & Consciência",
    subtitle: "Vista peças de grife com elegância incomparável sem comprometer seu orçamento",
  },
];

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [breakpoint]);

  return isMobile;
};

const AUTOPLAY_INTERVAL = 5000;

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/hero`);

      if (!response.ok)
        throw new Error("Erro ao buscar configurações do hero.");

      const data = await response.json();

      if (
        data &&
        data.slides &&
        Array.isArray(data.slides) &&
        data.slides.length > 0
      ) {
        setSlides(data.slides as HeroSlide[]);
      } else {
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error("Erro ao buscar configurações do hero:", error);
      setSlides(defaultSlides);
    } finally {
      setLoading(false);
    }
  };

  // Preload slide images to eliminate lag / stutter during auto-transitions
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    slides.forEach((slide) => {
      if (slide.image_url) {
        const img = new Image();
        img.src = slide.image_url;
      }
    });
  }, [slides]);

  // Smooth auto-slide timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const scrollToCollection = () => {
    const element = document.getElementById("colecao");
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const scrollToRules = () => {
    const element = document.getElementById("regras");
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (loading) {
    return (
      <section
        id="inicio"
        className="relative min-h-[90vh] md:min-h-screen overflow-hidden bg-zinc-950 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-white/60 font-montserrat text-sm tracking-widest uppercase">
            Carregando Coleção...
          </p>
        </div>
      </section>
    );
  }

  const activeSlideData = slides[currentSlide] || slides[0] || defaultSlides[0];

  return (
    <section
      id="inicio"
      className="relative min-h-[92vh] md:min-h-screen overflow-hidden bg-zinc-950 select-none flex flex-col justify-between"
    >
      {/* Background Layers & Images with enhanced framing */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const positionX = slide.image_position_x ?? 50;
          const positionY = slide.image_position_y ?? 50;

          const backgroundPos = isMobile
            ? "center top"
            : `${positionX}% ${positionY}%`;
          const backgroundFit = slide.image_fit || "cover";
          const brightness = slide.brightness ?? 100;
          const contrast = slide.contrast ?? 100;
          const saturation = slide.saturation ?? 100;
          const overlayOpacity = (slide.overlay_opacity ?? 50) / 100;
          const cssFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-1" : "opacity-0 z-0"
              }`}
            >
              {/* Image with subtle Ken Burns effect */}
              <div
                className={`absolute inset-0 bg-no-repeat transition-transform ease-out will-change-transform ${
                  isActive ? "scale-105" : "scale-100"
                }`}
                style={{
                  backgroundImage: `url('${slide.image_url}')`,
                  backgroundSize: backgroundFit,
                  backgroundPosition: backgroundPos,
                  transformOrigin: `${positionX}% ${positionY}%`,
                  filter: cssFilter,
                  transitionDuration: `${AUTOPLAY_INTERVAL}ms`,
                }}
              />

              {/* Sophisticated Luxury Multi-stop Overlay (protecting text legibility) */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 md:to-transparent"
                style={{ opacity: overlayOpacity }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50"
                style={{ opacity: overlayOpacity }}
              />

              {/* Subtle Gold Ambient Glow */}
              <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 pt-32 pb-16 md:pt-40 md:pb-24 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Slide Title with High-Contrast Typography */}
          <h1
            key={`title-${currentSlide}`}
            className="font-playfair text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-[1.15] sm:leading-[1.1] tracking-tight drop-shadow-md animate-hero-text"
          >
            {activeSlideData.title}
          </h1>

          {/* Subtitle */}
          <p
            key={`sub-${currentSlide}`}
            className="font-montserrat text-sm sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-xl leading-relaxed font-light drop-shadow animate-hero-text"
          >
            {activeSlideData.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <Button
              id="hero-cta-collection"
              onClick={scrollToCollection}
              size="lg"
              className="w-full sm:w-auto bg-gradient-gold hover:bg-amber-400 text-black font-montserrat font-bold px-7 py-5 sm:py-6 rounded-full shadow-gold transition-all duration-300 hover:scale-105 border border-amber-300/60 text-sm sm:text-base justify-center touch-manipulation cursor-pointer"
            >
              Explorar Catálogo
            </Button>

            <Button
              id="hero-cta-how-it-works"
              onClick={scrollToRules}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-montserrat font-semibold px-6 py-5 sm:py-6 rounded-full backdrop-blur-md border border-white/25 transition-all duration-300 hover:scale-105 text-sm sm:text-base cursor-pointer justify-center touch-manipulation"
            >
              Como Funciona
            </Button>
          </div>

          {/* Quick Value Props in Editorial Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/15 max-w-xl">
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-montserrat text-xs text-white/90 font-medium">
                Alta Costura & Grife
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-montserrat text-xs text-white/90 font-medium">
                Aluguel Simples e Rápido
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-montserrat text-xs text-white/90 font-medium">
                Peças Higienizadas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Progress Bars, Counters & Controls */}
      <div
        id="hero-bottom-controls"
        className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          {/* Slide Counters & Segmented Progress Bars */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="font-montserrat text-xs font-semibold text-amber-400 tracking-wider">
              {String(currentSlide + 1).padStart(2, "0")}
            </span>

            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-pointer"
                  style={{
                    width: index === currentSlide ? "3rem" : "1.25rem",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                  aria-label={`Ir para slide ${index + 1}`}
                >
                  {index === currentSlide && (
                    <span
                      key={`progress-${currentSlide}-${isPaused}`}
                      className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 origin-left"
                      style={{
                        animation: isPaused
                          ? "none"
                          : `progress ${AUTOPLAY_INTERVAL}ms linear forwards`,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <span className="font-montserrat text-xs text-white/40 tracking-wider">
              {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Slide anterior"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all duration-200 border border-white/10 hover:border-amber-400/40 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Próximo slide"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all duration-200 border border-white/10 hover:border-amber-400/40 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToCollection}
              aria-label="Rolar para a coleção"
              className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-white/15 text-white/70 hover:text-amber-400 text-xs font-montserrat font-medium transition-colors cursor-pointer"
            >
              <span>Descer</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

