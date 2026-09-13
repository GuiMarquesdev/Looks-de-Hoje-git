// Site Content customization types

export interface HeaderContent {
  nav_home: string;
  nav_collection: string;
  nav_rules: string;
  nav_contact: string;
  cta_button_text: string;
}

export interface CollectionContent {
  section_title: string;
  section_subtitle: string;
  search_placeholder: string;
  filter_all: string;
  filter_available: string;
  filter_rented: string;
  sort_recent: string;
  sort_price_asc: string;
  sort_price_desc: string;
  sort_name_asc: string;
  btn_rent_available: string;
  btn_rent_unavailable: string;
  btn_view_details: string;
  btn_load_more: string;
  empty_title: string;
  empty_description: string;
  empty_reset_btn: string;
  modal_rent_btn: string;
  modal_notify_btn: string;
  modal_measurements_title: string;
}

export interface RulesContent {
  section_title: string;
  section_subtitle: string;
  support_title: string;
  support_description: string;
  support_btn_text: string;
}

export interface ContactContent {
  section_title: string;
  section_subtitle: string;
  whatsapp_card_title: string;
  whatsapp_card_btn: string;
  instagram_card_title: string;
  instagram_card_btn: string;
  email_card_title: string;
  email_card_btn: string;
  hours_title: string;
  hours_badge: string;
  store_title: string;
  maps_btn_text: string;
}

export interface FooterContent {
  brand_tagline: string;
  quick_links_title: string;
  contact_title: string;
  copyright_text: string;
}

export interface SiteContent {
  header: HeaderContent;
  collection: CollectionContent;
  rules: RulesContent;
  contact: ContactContent;
  footer: FooterContent;
}

export const defaultSiteContent: SiteContent = {
  header: {
    nav_home: "Início",
    nav_collection: "Coleção",
    nav_rules: "Regras de Aluguel",
    nav_contact: "Contato",
    cta_button_text: "Fale pelo WhatsApp",
  },
  collection: {
    section_title: "Nossa Coleção",
    section_subtitle: "Descubra looks únicos para cada ocasião. Elegância e sofisticação para momentos inesquecíveis.",
    search_placeholder: "Buscar vestidos, conjuntos, modelos, tamanhos...",
    filter_all: "Todos",
    filter_available: "Disponíveis",
    filter_rented: "Alugados",
    sort_recent: "Mais recentes",
    sort_price_asc: "Menor preço",
    sort_price_desc: "Maior preço",
    sort_name_asc: "Nome (A-Z)",
    btn_rent_available: "Alugar no WhatsApp",
    btn_rent_unavailable: "Me avise quando voltar",
    btn_view_details: "Ver Detalhes",
    btn_load_more: "Ver Mais Peças",
    empty_title: "Nenhuma peça encontrada",
    empty_description: "Não encontramos peças com os filtros ou termo de busca selecionados.",
    empty_reset_btn: "Limpar todos os filtros",
    modal_rent_btn: "Alugar via WhatsApp",
    modal_notify_btn: "Avise-me quando voltar",
    modal_measurements_title: "Medidas da Peça",
  },
  rules: {
    section_title: "Regras de Aluguel",
    section_subtitle: "Conheça nossas políticas para garantir uma experiência transparente e segura para todos.",
    support_title: "Dúvidas sobre nossas regras?",
    support_description: "Nossa equipe está sempre disponível para esclarecer qualquer questão sobre o processo de aluguel. Entre em contato conosco pelo WhatsApp ou Instagram.",
    support_btn_text: "Fale com nossa equipe",
  },
  contact: {
    section_title: "Contato & Localização",
    section_subtitle: "Entre em contato conosco ou visite nossa loja física. Estamos prontas para ajudar você a encontrar o look perfeito.",
    whatsapp_card_title: "WhatsApp & Agendamento",
    whatsapp_card_btn: "Chamar no WhatsApp",
    instagram_card_title: "Instagram",
    instagram_card_btn: "Seguir no Instagram",
    email_card_title: "E-mail",
    email_card_btn: "Enviar E-mail",
    hours_title: "Horário de Funcionamento",
    hours_badge: "Somente com agendamento",
    store_title: "Nossa Loja",
    maps_btn_text: "Ver no Google Maps",
  },
  footer: {
    brand_tagline: "Aluguel de roupas e vestidos sofisticados para tornar seus momentos inesquecíveis.",
    quick_links_title: "Links Rápidos",
    contact_title: "Contato",
    copyright_text: "© 2025 LooksdeHoje. Todos os direitos reservados.",
  },
};
