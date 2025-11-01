import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import whatsappIcon from "@/assets/whatsapp-icon.svg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  const whatsappLink = "https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o aluguel de roupas do LooksdeHoje.";

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-lg shadow-elegant border-b border-border/20" 
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
            {/* Logo for scrolled state (white background) */}
            <img 
              src={logoDark}
              alt="LooksdeHoje"
              className={`h-12 md:h-16 lg:h-20 w-auto object-contain transition-all duration-300 ${
                isScrolled ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {/* Logo for initial state (transparent background) */}
            <img 
              src={logoLight}
              alt="LooksdeHoje"
              className={`absolute top-0 left-0 h-12 md:h-16 lg:h-20 w-auto object-contain transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${
                isScrolled ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection("inicio")}
              className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Início
            </button>
            <button 
              onClick={() => scrollToSection("colecao")}
              className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Coleção
            </button>
            <button 
              onClick={() => scrollToSection("regras")}
              className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Regras de Aluguel
            </button>
            <button 
              onClick={() => scrollToSection("contato")}
              className="font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Contato
            </button>
          </div>

          {/* WhatsApp CTA Button */}
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.open(whatsappLink, "_blank")}
              className="hidden md:flex items-center space-x-2 bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-semibold px-6 py-2 rounded-full shadow-gold transition-all duration-300 hover:-translate-y-0.5"
            >
              <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4" />
              <span>Fale pelo WhatsApp</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg shadow-luxury border-b border-border/20">
            <div className="container mx-auto px-4 py-6 space-y-4">
              <button 
                onClick={() => scrollToSection("inicio")}
                className="block w-full text-left font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              >
                Início
              </button>
              <button 
                onClick={() => scrollToSection("colecao")}
                className="block w-full text-left font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              >
                Coleção
              </button>
              <button 
                onClick={() => scrollToSection("regras")}
                className="block w-full text-left font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              >
                Regras de Aluguel
              </button>
              <button 
                onClick={() => scrollToSection("contato")}
                className="block w-full text-left font-montserrat text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              >
                Contato
              </button>
              <Button 
                onClick={() => window.open(whatsappLink, "_blank")}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-semibold px-6 py-3 rounded-full shadow-gold transition-all duration-300 mt-4"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4" />
                <span>Fale pelo WhatsApp</span>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;