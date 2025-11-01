import { Instagram, Heart } from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.svg";

const Footer = () => {
  const quickLinks = [
    { name: "Início", href: "#inicio" },
    { name: "Coleção", href: "#colecao" },
    { name: "Regras de Aluguel", href: "#regras" },
    { name: "Contato", href: "#contato" }
  ];

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: <img src={whatsappIcon} alt="WhatsApp" className="w-5 h-5" />,
      href: "https://wa.me/71992771527",
      color: "hover:text-green-500"
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      href: "https://www.instagram.com/looksdehojebr",
      color: "hover:text-pink-500"
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="font-playfair text-3xl font-bold mb-4 text-primary">
              LooksdeHoje
            </h3>
            <p className="font-montserrat text-background/80 leading-relaxed mb-6">
              Elegância e sofisticação para suas ocasiões especiais. Alugue looks únicos e vista-se com estilo sem comprometer o orçamento.
            </p>
            
            {/* Social Links */}
            <div className="flex justify-center md:justify-start space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full bg-background/10 backdrop-blur-sm text-background hover:bg-primary ${social.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-gold`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-playfair text-xl font-semibold mb-6 text-background">
              Links Rápidos
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="font-montserrat text-background/80 hover:text-primary transition-colors duration-300 hover:translate-x-1 transform inline-block"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h4 className="font-playfair text-xl font-semibold mb-6 text-background">
              Contato
            </h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-montserrat font-medium text-background mb-1">WhatsApp:</h5>
                <a 
                  href="https://wa.me/71992771527"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat text-background/80 hover:text-primary transition-colors"
                >
                  (71) 99277-1527
                </a>
              </div>
              
              <div>
                <h5 className="font-montserrat font-medium text-background mb-1">E-mail:</h5>
                <a 
                  href="mailto:lookdehojebrecho@gmail.com"
                  className="font-montserrat text-background/80 hover:text-primary transition-colors"
                >
                  lookdehojebrecho@gmail.com
                </a>
              </div>
              
              <div>
                <h5 className="font-montserrat font-medium text-background mb-1">Endereço:</h5>
                <address className="font-montserrat text-background/80 not-italic">
                  Av. Antônio Carlos Magalhães, 2501 - Brotas<br />
                  Salvador - BA, 40280-901
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-background/60 font-montserrat text-sm">
              <span>© 2025 LooksdeHoje. Todos os direitos reservados.</span>
            </div>

            {/* Made with Love */}
            <div className="flex items-center space-x-2 text-background/60 font-montserrat text-sm">
              <span>Feito com</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>para mulheres que amam moda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-gold opacity-50" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-16 right-16 w-3 h-3 bg-primary/30 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-12 left-1/4 w-1.5 h-1.5 bg-primary/25 rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-8 right-1/3 w-2.5 h-2.5 bg-primary/20 rounded-full animate-pulse delay-1000" />
      </div>
    </footer>
  );
};

export default Footer;