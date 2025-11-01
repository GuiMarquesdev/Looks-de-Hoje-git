import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-playfair text-8xl font-bold text-primary mb-4">
            404
          </h1>
          <h2 className="font-playfair text-2xl font-semibold text-foreground mb-4">
            Página não encontrada
          </h2>
          <p className="font-montserrat text-muted-foreground mb-8">
            Ops! A página que você está procurando não existe. Que tal dar uma
            olhada na nossa coleção de looks incríveis?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-gradient-gold hover:bg-primary-dark text-primary-foreground font-montserrat font-semibold px-6 py-3 rounded-full shadow-gold transition-all duration-300 hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-2 border-primary text-primary hover:bg-gradient-gold hover:text-primary-foreground hover:border-transparent font-montserrat font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
