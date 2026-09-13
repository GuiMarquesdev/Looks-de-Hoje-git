import { LucideIcon } from "lucide-react";

export interface RuleItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  details: string[];
  order: number;
  is_active: boolean;
}

export interface RulesSettings {
  title: string;
  subtitle: string;
  support_title: string;
  support_description: string;
  support_message: string;
}

export const defaultRulesSettings: RulesSettings = {
  title: "Regras de Aluguel",
  subtitle: "Conheça nossas políticas para garantir uma experiência transparente e segura para todos.",
  support_title: "Dúvidas sobre nossas regras?",
  support_description: "Nossa equipe está sempre disponível para esclarecer qualquer questão sobre o processo de aluguel. Entre em contato conosco pelo WhatsApp ou Instagram.",
  support_message: "Olá! Tenho dúvidas sobre as regras de aluguel.",
};

export const defaultRules: RuleItem[] = [
  {
    id: "1",
    icon: "Clock",
    title: "Período de Locação",
    description: "Peças podem ser alugadas por 1 a 7 dias, com possibilidade de extensão mediante disponibilidade.",
    details: [
      "Locação mínima: 5 dias corridos",
      "Locação máxima: 20 dias corridos",
      "Prorrogação mediante solicitação prévia e disponibilidade da peça",
    ],
    order: 1,
    is_active: true,
  },
  {
    id: "2",
    icon: "Truck",
    title: "Entrega e Retirada",
    description: "Entregamos em toda a região metropolitana ou você pode retirar em nossa loja física.",
    details: [
      "Entrega por motoboy parceiro com valor calculado conforme a região",
      "Retirada e devolução mediante agendamento",
      "Atendimento de segunda a sexta-feira, das 10h às 16h",
    ],
    order: 2,
    is_active: true,
  },
  {
    id: "3",
    icon: "Shield",
    title: "Cuidados e Segurança",
    description: "Todas as peças são higienizadas antes e após cada uso com produtos especializados.",
    details: [
      "Lavagem profissional",
      "Produtos antialérgicos",
      "Embalagem lacrada",
    ],
    order: 3,
    is_active: true,
  },
  {
    id: "4",
    icon: "CreditCard",
    title: "Forma de Pagamento",
    description: "Aceitamos PIX, cartão de crédito/débito. Pagamento antecipado obrigatório.",
    details: [
      "PIX com desconto",
      "Cartão até 3x sem juros",
      "Caução via cartão",
    ],
    order: 4,
    is_active: true,
  },
  {
    id: "5",
    icon: "CheckCircle",
    title: "Estado das Peças",
    description: "Todas as roupas devem ser devolvidas nas mesmas condições de retirada.",
    details: [
      "Sem manchas ou rasgos",
      "Perfume suave permitido",
      "Pequenos desgastes normais",
    ],
    order: 5,
    is_active: true,
  },
  {
    id: "6",
    icon: "AlertCircle",
    title: "Política de Danos",
    description: "Em caso de danos irreversíveis, será cobrado o valor de reposição da peça.",
    details: [
      "Avaliação criteriosa",
      "Orçamento transparente",
      "Parcelamento disponível",
    ],
    order: 6,
    is_active: true,
  },
];
