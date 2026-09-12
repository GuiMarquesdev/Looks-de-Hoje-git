import React, { useState, useEffect } from "react";
import {
  Clock,
  Shield,
  Truck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Heart,
  Calendar,
  Star,
  Info,
  FileText,
  ShoppingBag,
  Award,
  Tag,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import ContactChannels from "@/components/ContactChannels";
import { API_URL } from "@/config/api";

interface RuleItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  details: string[];
  order: number;
  is_active?: boolean;
}

interface RulesSettings {
  title: string;
  subtitle: string;
  support_title: string;
  support_description: string;
  support_message: string;
}

const defaultRules: RuleItem[] = [
  {
    id: "1",
    icon: "Clock",
    title: "Período de Locação",
    description: "Peças podem ser alugadas por 1 a 7 dias, com possibilidade de extensão mediante disponibilidade.",
    details: ["Locação mínima: 5 dias corridos", "Locação máxima: 20 dias corridos", "Prorrogação mediante solicitação prévia e disponibilidade da peça"],
    order: 1,
    is_active: true,
  },
  {
    id: "2",
    icon: "Truck",
    title: "Entrega e Retirada",
    description: "Entregamos em toda a região metropolitana ou você pode retirar em nossa loja física.",
    details: ["Entrega por motoboy parceiro com valor calculado conforme a região", "Retirada e devolução mediante agendamento", "Atendimento de segunda a sexta-feira, das 10h às 16h"],
    order: 2,
    is_active: true,
  },
  {
    id: "3",
    icon: "Shield",
    title: "Cuidados e Segurança",
    description: "Todas as peças são higienizadas antes e após cada uso com produtos especializados.",
    details: ["Lavagem profissional", "Produtos antialérgicos", "Embalagem lacrada"],
    order: 3,
    is_active: true,
  },
  {
    id: "4",
    icon: "CreditCard",
    title: "Forma de Pagamento",
    description: "Aceitamos PIX, cartão de crédito/débito. Pagamento antecipado obrigatório.",
    details: ["PIX com desconto", "Cartão até 3x sem juros", "Caução via cartão"],
    order: 4,
    is_active: true,
  },
  {
    id: "5",
    icon: "CheckCircle",
    title: "Estado das Peças",
    description: "Todas as roupas devem ser devolvidas nas mesmas condições de retirada.",
    details: ["Sem manchas ou rasgos", "Perfume suave permitido", "Pequenos desgastes normais"],
    order: 5,
    is_active: true,
  },
  {
    id: "6",
    icon: "AlertCircle",
    title: "Política de Danos",
    description: "Em caso de danos irreversíveis, será cobrado o valor de reposição da peça.",
    details: ["Avaliação criteriosa", "Orçamento transparente", "Parcelamento disponível"],
    order: 6,
    is_active: true,
  },
];

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  truck: Truck,
  shield: Shield,
  creditcard: CreditCard,
  "credit-card": CreditCard,
  checkcircle: CheckCircle,
  "check-circle": CheckCircle,
  alertcircle: AlertCircle,
  "alert-circle": AlertCircle,
  sparkles: Sparkles,
  heart: Heart,
  calendar: Calendar,
  star: Star,
  info: Info,
  filetext: FileText,
  "file-text": FileText,
  shoppingbag: ShoppingBag,
  "shopping-bag": ShoppingBag,
  award: Award,
  tag: Tag,
  helpcircle: HelpCircle,
  "help-circle": HelpCircle,
};

const renderIcon = (iconName: string) => {
  const normalized = (iconName || "").toLowerCase().trim();
  const Component = iconMap[normalized] || Shield;
  return <Component className="w-8 h-8" />;
};

const RulesSection = () => {
  const [rules, setRules] = useState<RuleItem[]>(defaultRules);
  const [settings, setSettings] = useState<RulesSettings>({
    title: "Regras de Aluguel",
    subtitle: "Conheça nossas políticas para garantir uma experiência transparente e segura para todos.",
    support_title: "Dúvidas sobre nossas regras?",
    support_description: "Nossa equipe está sempre disponível para esclarecer qualquer questão sobre o processo de aluguel. Entre em contato conosco pelo WhatsApp ou Instagram.",
    support_message: "Olá! Tenho dúvidas sobre as regras de aluguel.",
  });

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch(`${API_URL}/rules`);
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
          if (Array.isArray(data.rules) && data.rules.length > 0) {
            const activeRules = data.rules
              .filter((r: RuleItem) => r.is_active !== false)
              .sort((a: RuleItem, b: RuleItem) => (a.order || 0) - (b.order || 0));
            setRules(activeRules);
          }
        }
      } catch (err) {
        console.warn("Usando regras locais como fallback:", err);
      }
    };

    fetchRules();
  }, []);

  return (
    <section id="regras" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            {settings.title}
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground max-w-2xl mx-auto">
            {settings.subtitle}
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="luxury-card hover-lift group p-8 text-center"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/30 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                {renderIcon(rule.icon)}
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
              {rule.details && rule.details.length > 0 && (
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
              )}
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 p-8 rounded-2xl bg-secondary/30 border border-primary/20">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="font-playfair text-2xl font-semibold text-foreground mb-4">
              {settings.support_title}
            </h3>
            <p className="font-montserrat text-muted-foreground mb-6">
              {settings.support_description}
            </p>
            <ContactChannels 
              message={settings.support_message || "Olá! Tenho dúvidas sobre as regras de aluguel."}
              size="md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RulesSection;