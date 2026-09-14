import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import whatsappIcon from "@/assets/whatsapp-icon.svg";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import { useSiteContent } from "@/contexts/SiteContentContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getWhatsAppUrl, settings } = useStoreSettings();
  const { content } = useSiteContent();
  const headerContent = content.header;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const handleWhatsAppClick = () => {
    setIsMenuOpen(false);
    const message = `Olá! Gostaria de saber mais sobre o aluguel de roupas do ${settings.store_name || "LooksdeHoje"}.`;
    const url = getWhatsAppUrl(message);
    window.open(url, "_blank");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? "bg-white shadow-elegant border-b border-border/40"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="relative cursor-pointer group"
            onClick={() => scrollToSection("inicio")}
          >
            {/* Logo for scrolled or open menu state (white background) */}
            <img
              src={logoDark}
              alt="LooksdeHoje"
              className={`h-12 md:h-16 lg:h-20 w-auto object-contain transition-all duration-300 ${
                isScrolled || isMenuOpen ? "opacity-100" : "opacity-0"
              }`}
            />
            {/* Logo for initial state (transparent background) */}
            <img
              src={logoLight}
              alt="LooksdeHoje"
              className={`absolute top-0 left-0 h-12 md:h-16 lg:h-20 w-auto object-contain transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${
                isScrolled || isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("inicio")}
              className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {headerContent.nav_home || "Início"}
            </button>
            <button
              onClick={() => scrollToSection("colecao")}
              className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {headerContent.nav_collection || "Coleção"}
            </button>
            <button
              onClick={() => scrollToSection("regras")}
              className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {headerContent.nav_rules || "Regras de Aluguel"}
            </button>
            <button
              onClick={() => scrollToSection("contato")}
              className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {headerContent.nav_contact || "Contato"}
            </button>
          </div>

            {/* WhatsApp CTA Button */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleWhatsAppClick}
              className="hidden md:flex items-center space-x-2 bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-semibold px-6 py-2 rounded-full shadow-gold transition-all duration-300 hover:-translate-y-0.5"
            >
              <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4" />
              <span>{headerContent.cta_button_text || "Fale pelo WhatsApp"}</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              id="header-mobile-menu-toggle"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              className={`md:hidden p-2.5 rounded-full transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer ${
                isScrolled || isMenuOpen
                  ? "text-foreground bg-secondary/80 hover:bg-secondary border border-border/60"
                  : "text-white bg-black/35 hover:bg-black/50 backdrop-blur-md border border-white/20 shadow-md"
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            id="header-mobile-menu"
            className="md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-b border-border/70 animate-fade-in z-50"
          >
            <div className="container mx-auto px-4 py-5 space-y-2 bg-white">
              <button
                id="header-mobile-nav-home"
                onClick={() => scrollToSection("inicio")}
                className="block w-full text-left font-montserrat text-sm font-semibold text-foreground hover:text-primary hover:bg-secondary/80 transition-colors px-3.5 py-3 rounded-xl cursor-pointer"
              >
                {headerContent.nav_home || "Início"}
              </button>
              <button
                id="header-mobile-nav-collection"
                onClick={() => scrollToSection("colecao")}
                className="block w-full text-left font-montserrat text-sm font-semibold text-foreground hover:text-primary hover:bg-secondary/80 transition-colors px-3.5 py-3 rounded-xl cursor-pointer"
              >
                {headerContent.nav_collection || "Coleção"}
              </button>
              <button
                id="header-mobile-nav-rules"
                onClick={() => scrollToSection("regras")}
                className="block w-full text-left font-montserrat text-sm font-semibold text-foreground hover:text-primary hover:bg-secondary/80 transition-colors px-3.5 py-3 rounded-xl cursor-pointer"
              >
                {headerContent.nav_rules || "Regras de Aluguel"}
              </button>
              <button
                id="header-mobile-nav-contact"
                onClick={() => scrollToSection("contato")}
                className="block w-full text-left font-montserrat text-sm font-semibold text-foreground hover:text-primary hover:bg-secondary/80 transition-colors px-3.5 py-3 rounded-xl cursor-pointer"
              >
                {headerContent.nav_contact || "Contato"}
              </button>
              <Button
                id="header-mobile-cta-whatsapp"
                onClick={handleWhatsAppClick}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-bold px-6 py-3.5 rounded-xl shadow-gold transition-all duration-300 mt-3 cursor-pointer"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4" />
                <span>{headerContent.cta_button_text || "Fale pelo WhatsApp"}</span>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
