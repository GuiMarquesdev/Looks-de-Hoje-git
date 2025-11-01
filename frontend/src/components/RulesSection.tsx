import { Clock, Shield, Truck, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import ContactChannels from "@/components/ContactChannels";

const RulesSection = () => {
  const rules = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Prazo de Aluguel",
      description: "Peças podem ser alugadas por 1 a 7 dias, com possibilidade de extensão mediante disponibilidade.",
      details: ["Mínimo: 1 dia", "Máximo: 7 dias", "Extensão sob consulta"]
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Entrega e Retirada",
      description: "Entregamos em toda a região metropolitana ou você pode retirar em nossa loja física.",
      details: ["Entrega grátis acima de R$ 150", "Retirada na loja sem custo", "Horário: 9h às 18h"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Cuidados e Segurança",
      description: "Todas as peças são higienizadas antes e após cada uso com produtos especializados.",
      details: ["Lavagem profissional", "Produtos antialérgicos", "Embalagem lacrada"]
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Forma de Pagamento",
      description: "Aceitamos PIX, cartão de crédito/débito. Pagamento antecipado obrigatório.",
      details: ["PIX com desconto", "Cartão até 3x sem juros", "Caução via cartão"]
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Estado das Peças",
      description: "Todas as roupas devem ser devolvidas nas mesmas condições de retirada.",
      details: ["Sem manchas ou rasgos", "Perfume suave permitido", "Pequenos desgastes normais"]
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: "Política de Danos",
      description: "Em caso de danos irreversíveis, será cobrado o valor de reposição da peça.",
      details: ["Avaliação criteriosa", "Orçamento transparente", "Parcelamento disponível"]
    }
  ];

  return (
    <section id="regras" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            Regras de Aluguel
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground max-w-2xl mx-auto">
            Conheça nossas políticas para garantir uma experiência transparente e segura para todos.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="luxury-card hover-lift group p-8 text-center"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/30 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                {rule.icon}
              </div>

              {/* Title */}
              <h3 className="font-playfair text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                {rule.title}
              </h3>

              {/* Description */}
              <p className="font-montserrat text-muted-foreground mb-6 leading-relaxed">
                {rule.description}
              </p>

              {/* Details */}
              <ul className="space-y-2">
                {rule.details.map((detail, detailIndex) => (
                  <li 
                    key={detailIndex}
                    className="font-montserrat text-sm text-muted-foreground flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 p-8 rounded-2xl bg-secondary/30 border border-primary/20">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="font-playfair text-2xl font-semibold text-foreground mb-4">
              Dúvidas sobre nossas regras?
            </h3>
            <p className="font-montserrat text-muted-foreground mb-6">
              Nossa equipe está sempre disponível para esclarecer qualquer questão sobre o processo de aluguel. 
              Entre em contato conosco pelo WhatsApp ou Instagram.
            </p>
            <ContactChannels 
              message="Olá! Tenho dúvidas sobre as regras de aluguel."
              size="md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RulesSection;