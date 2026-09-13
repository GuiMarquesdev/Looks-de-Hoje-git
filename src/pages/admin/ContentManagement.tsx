import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAdminFeedback } from "@/contexts/AdminFeedbackContext";
import {
  Type,
  LayoutTemplate,
  ShoppingBag,
  FileText,
  PhoneCall,
  PanelBottom,
  RotateCcw,
  Save,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { SiteContent, defaultSiteContent } from "@/types/siteContent";

const ContentManagement: React.FC = () => {
  const { showSuccess, showError } = useAdminFeedback();
  const { content, updateContent, refreshContent } = useSiteContent();
  const [formData, setFormData] = useState<SiteContent>(defaultSiteContent);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("header");

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  const handleHeaderChange = (field: keyof SiteContent["header"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value,
      },
    }));
  };

  const handleCollectionChange = (field: keyof SiteContent["collection"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      collection: {
        ...prev.collection,
        [field]: value,
      },
    }));
  };

  const handleRulesChange = (field: keyof SiteContent["rules"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [field]: value,
      },
    }));
  };

  const handleContactChange = (field: keyof SiteContent["contact"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  const handleFooterChange = (field: keyof SiteContent["footer"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateContent(formData);
      if (success) {
        toast.success("Conteúdo do site atualizado com sucesso!");
        showSuccess(
          "Conteúdo do Site Atualizado!",
          "Todos os títulos, subtítulos, placeholders de busca e textos de botões foram gravados e atualizados na loja.",
          [
            `Aba em edição: ${activeTab.toUpperCase()}`,
            "As alterações já estão ativas para todos os visitantes do site.",
          ]
        );
        await refreshContent();
      } else {
        toast.error("Erro ao salvar alterações.");
        showError(
          "Falha ao Atualizar Conteúdo",
          "O servidor não confirmou o salvamento do conteúdo. Tente novamente."
        );
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado ao salvar.");
      showError(
        "Erro Inesperado",
        "Não foi possível salvar o conteúdo.",
        error?.message || "Erro de rede"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Tem certeza que deseja restaurar os textos e botões padrões originais?")) {
      setFormData(defaultSiteContent);
      toast.info("Valores padrões restaurados na tela. Clique em 'Salvar Alterações' para confirmar.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Type className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold font-playfair text-foreground tracking-tight">
              Conteúdo do Site
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-montserrat">
            Personalize todos os textos, títulos de seções, placeholders de busca e textos dos botões do site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleResetDefaults}
            className="font-montserrat text-xs gap-2 border-border/80 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrões
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="font-montserrat font-semibold text-xs gap-2 bg-gradient-gold hover:bg-amber-400 text-black shadow-gold"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/80 p-1 rounded-xl flex flex-wrap gap-1 w-full justify-start border border-border/60">
          <TabsTrigger
            value="header"
            className="flex items-center gap-2 px-4 py-2 font-montserrat text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Cabeçalho (Header)
          </TabsTrigger>
          <TabsTrigger
            value="collection"
            className="flex items-center gap-2 px-4 py-2 font-montserrat text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Coleção de Peças
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="flex items-center gap-2 px-4 py-2 font-montserrat text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Regras de Aluguel
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="flex items-center gap-2 px-4 py-2 font-montserrat text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Contato & Localização
          </TabsTrigger>
          <TabsTrigger
            value="footer"
            className="flex items-center gap-2 px-4 py-2 font-montserrat text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <PanelBottom className="w-3.5 h-3.5" />
            Rodapé (Footer)
          </TabsTrigger>
        </TabsList>

        {/* 1. Header Tab */}
        <TabsContent value="header" className="space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-playfair flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-primary" />
                Textos do Menu Superior e Botão de Contato
              </CardTitle>
              <CardDescription className="text-xs font-montserrat">
                Configure os rótulos de cada item da navegação principal e do botão destacado de WhatsApp no topo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Menu: Início
                  </Label>
                  <Input
                    value={formData.header.nav_home}
                    onChange={(e) => handleHeaderChange("nav_home", e.target.value)}
                    placeholder="Início"
                    className="font-montserrat text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Menu: Coleção
                  </Label>
                  <Input
                    value={formData.header.nav_collection}
                    onChange={(e) => handleHeaderChange("nav_collection", e.target.value)}
                    placeholder="Coleção"
                    className="font-montserrat text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Menu: Regras de Aluguel
                  </Label>
                  <Input
                    value={formData.header.nav_rules}
                    onChange={(e) => handleHeaderChange("nav_rules", e.target.value)}
                    placeholder="Regras de Aluguel"
                    className="font-montserrat text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Menu: Contato
                  </Label>
                  <Input
                    value={formData.header.nav_contact}
                    onChange={(e) => handleHeaderChange("nav_contact", e.target.value)}
                    placeholder="Contato"
                    className="font-montserrat text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2 max-w-md">
                <Label className="text-xs font-montserrat font-medium text-foreground">
                  Texto do Botão de WhatsApp (CTA Principal)
                </Label>
                <Input
                  value={formData.header.cta_button_text}
                  onChange={(e) => handleHeaderChange("cta_button_text", e.target.value)}
                  placeholder="Fale pelo WhatsApp"
                  className="font-montserrat text-sm font-medium"
                />
                <p className="text-[11px] text-muted-foreground font-montserrat">
                  Este botão é exibido no topo à direita e no menu mobile.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Collection Tab */}
        <TabsContent value="collection" className="space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-playfair flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Seção da Vitrine de Coleção
              </CardTitle>
              <CardDescription className="text-xs font-montserrat">
                Configure os títulos, placeholders de busca, opções de ordenação e botões dos cards de peças.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-montserrat">
                  Títulos da Seção
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Título Principal
                    </Label>
                    <Input
                      value={formData.collection.section_title}
                      onChange={(e) => handleCollectionChange("section_title", e.target.value)}
                      placeholder="Nossa Coleção"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Subtítulo Explicativo
                    </Label>
                    <Textarea
                      rows={2}
                      value={formData.collection.section_subtitle}
                      onChange={(e) => handleCollectionChange("section_subtitle", e.target.value)}
                      placeholder="Descubra looks únicos para cada ocasião..."
                      className="font-montserrat text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-montserrat">
                  Barra de Busca e Filtros de Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Placeholder do Campo de Busca
                    </Label>
                    <Input
                      value={formData.collection.search_placeholder}
                      onChange={(e) => handleCollectionChange("search_placeholder", e.target.value)}
                      placeholder="Buscar vestidos, modelos..."
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Filtro: Todas
                    </Label>
                    <Input
                      value={formData.collection.filter_all}
                      onChange={(e) => handleCollectionChange("filter_all", e.target.value)}
                      placeholder="Todas"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Filtro: Disponíveis
                    </Label>
                    <Input
                      value={formData.collection.filter_available}
                      onChange={(e) => handleCollectionChange("filter_available", e.target.value)}
                      placeholder="Disponíveis"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Filtro: Alugadas
                    </Label>
                    <Input
                      value={formData.collection.filter_rented}
                      onChange={(e) => handleCollectionChange("filter_rented", e.target.value)}
                      placeholder="Alugadas"
                      className="font-montserrat text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-montserrat">
                  Opções de Ordenação
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Mais recentes
                    </Label>
                    <Input
                      value={formData.collection.sort_recent}
                      onChange={(e) => handleCollectionChange("sort_recent", e.target.value)}
                      placeholder="Mais recentes"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Menor preço
                    </Label>
                    <Input
                      value={formData.collection.sort_price_asc}
                      onChange={(e) => handleCollectionChange("sort_price_asc", e.target.value)}
                      placeholder="Menor preço"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Maior preço
                    </Label>
                    <Input
                      value={formData.collection.sort_price_desc}
                      onChange={(e) => handleCollectionChange("sort_price_desc", e.target.value)}
                      placeholder="Maior preço"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Nome (A - Z)
                    </Label>
                    <Input
                      value={formData.collection.sort_name_asc}
                      onChange={(e) => handleCollectionChange("sort_name_asc", e.target.value)}
                      placeholder="Nome (A - Z)"
                      className="font-montserrat text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-montserrat">
                  Botões dos Cards e Ações
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Botão Alugar (Disponível)
                    </Label>
                    <Input
                      value={formData.collection.btn_rent_available}
                      onChange={(e) => handleCollectionChange("btn_rent_available", e.target.value)}
                      placeholder="Alugar"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Botão Indisponível (Alugado)
                    </Label>
                    <Input
                      value={formData.collection.btn_rent_unavailable}
                      onChange={(e) => handleCollectionChange("btn_rent_unavailable", e.target.value)}
                      placeholder="Avise-me"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Botão "Ver Mais Peças"
                    </Label>
                    <Input
                      value={formData.collection.btn_load_more}
                      onChange={(e) => handleCollectionChange("btn_load_more", e.target.value)}
                      placeholder="Ver Mais Peças"
                      className="font-montserrat text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-montserrat">
                  Estado Vazio (Quando nada for encontrado)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Título de Peça Não Encontrada
                    </Label>
                    <Input
                      value={formData.collection.empty_title}
                      onChange={(e) => handleCollectionChange("empty_title", e.target.value)}
                      placeholder="Nenhuma peça encontrada"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Botão Limpar Filtros
                    </Label>
                    <Input
                      value={formData.collection.empty_reset_btn}
                      onChange={(e) => handleCollectionChange("empty_reset_btn", e.target.value)}
                      placeholder="Limpar filtros e ver todas as peças"
                      className="font-montserrat text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-playfair flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Textos da Seção de Regras e Dúvidas
              </CardTitle>
              <CardDescription className="text-xs font-montserrat">
                Configure os títulos da seção e o card de apoio/suporte sobre as políticas de aluguel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Título Principal da Seção
                  </Label>
                  <Input
                    value={formData.rules.section_title}
                    onChange={(e) => handleRulesChange("section_title", e.target.value)}
                    placeholder="Regras de Aluguel"
                    className="font-montserrat text-sm"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Subtítulo da Seção
                  </Label>
                  <Textarea
                    rows={2}
                    value={formData.rules.section_subtitle}
                    onChange={(e) => handleRulesChange("section_subtitle", e.target.value)}
                    placeholder="Conheça nossas políticas para garantir uma experiência transparente..."
                    className="font-montserrat text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-montserrat">
                  Bloco de Suporte e Dúvidas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Título do Card de Dúvidas
                    </Label>
                    <Input
                      value={formData.rules.support_title}
                      onChange={(e) => handleRulesChange("support_title", e.target.value)}
                      placeholder="Dúvidas sobre nossas regras?"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Descrição do Bloco de Suporte
                    </Label>
                    <Textarea
                      rows={2}
                      value={formData.rules.support_description}
                      onChange={(e) => handleRulesChange("support_description", e.target.value)}
                      placeholder="Nossa equipe está sempre disponível para esclarecer qualquer questão..."
                      className="font-montserrat text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-playfair flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-primary" />
                Textos da Seção de Contato e Localização
              </CardTitle>
              <CardDescription className="text-xs font-montserrat">
                Personalize os títulos dos cards de canais de atendimento, botão do Google Maps e horários.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Título da Seção
                  </Label>
                  <Input
                    value={formData.contact.section_title}
                    onChange={(e) => handleContactChange("section_title", e.target.value)}
                    placeholder="Contato & Localização"
                    className="font-montserrat text-sm"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Subtítulo da Seção
                  </Label>
                  <Textarea
                    rows={2}
                    value={formData.contact.section_subtitle}
                    onChange={(e) => handleContactChange("section_subtitle", e.target.value)}
                    placeholder="Entre em contato conosco ou visite nossa loja física..."
                    className="font-montserrat text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-montserrat">
                  Cards de Atendimento e Ações
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Título do Card de WhatsApp
                    </Label>
                    <Input
                      value={formData.contact.whatsapp_card_title}
                      onChange={(e) => handleContactChange("whatsapp_card_title", e.target.value)}
                      placeholder="WhatsApp"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Texto do Botão de WhatsApp
                    </Label>
                    <Input
                      value={formData.contact.whatsapp_card_btn}
                      onChange={(e) => handleContactChange("whatsapp_card_btn", e.target.value)}
                      placeholder="Chamar no WhatsApp"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Título do Card do Instagram
                    </Label>
                    <Input
                      value={formData.contact.instagram_card_title}
                      onChange={(e) => handleContactChange("instagram_card_title", e.target.value)}
                      placeholder="Instagram"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Texto do Botão do Instagram
                    </Label>
                    <Input
                      value={formData.contact.instagram_card_btn}
                      onChange={(e) => handleContactChange("instagram_card_btn", e.target.value)}
                      placeholder="Seguir no Instagram"
                      className="font-montserrat text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-montserrat">
                  Horário e Localização
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Título do Bloco de Horários
                    </Label>
                    <Input
                      value={formData.contact.hours_title}
                      onChange={(e) => handleContactChange("hours_title", e.target.value)}
                      placeholder="Horário de Funcionamento"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Título do Card da Loja Física
                    </Label>
                    <Input
                      value={formData.contact.store_title}
                      onChange={(e) => handleContactChange("store_title", e.target.value)}
                      placeholder="Nossa Loja"
                      className="font-montserrat text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-montserrat font-medium text-foreground">
                      Texto do Botão do Google Maps
                    </Label>
                    <Input
                      value={formData.contact.maps_btn_text}
                      onChange={(e) => handleContactChange("maps_btn_text", e.target.value)}
                      placeholder="Ver no Google Maps"
                      className="font-montserrat text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Footer Tab */}
        <TabsContent value="footer" className="space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-playfair flex items-center gap-2">
                <PanelBottom className="w-5 h-5 text-primary" />
                Textos do Rodapé (Footer)
              </CardTitle>
              <CardDescription className="text-xs font-montserrat">
                Configure a mensagem institucional da marca, os títulos das colunas e os créditos de copyright.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-montserrat font-medium text-foreground">
                  Descrição / Slogan da Marca (Abaixo do Nome da Loja)
                </Label>
                <Textarea
                  rows={2}
                  value={formData.footer.brand_tagline}
                  onChange={(e) => handleFooterChange("brand_tagline", e.target.value)}
                  placeholder="Elegância e sofisticação para suas ocasiões especiais..."
                  className="font-montserrat text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Título da Coluna: Links Rápidos
                  </Label>
                  <Input
                    value={formData.footer.quick_links_title}
                    onChange={(e) => handleFooterChange("quick_links_title", e.target.value)}
                    placeholder="Links Rápidos"
                    className="font-montserrat text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-montserrat font-medium text-foreground">
                    Título da Coluna: Contato
                  </Label>
                  <Input
                    value={formData.footer.contact_title}
                    onChange={(e) => handleFooterChange("contact_title", e.target.value)}
                    placeholder="Contato"
                    className="font-montserrat text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs font-montserrat font-medium text-foreground">
                  Texto de Copyright (Final da Página)
                </Label>
                <Input
                  value={formData.footer.copyright_text}
                  onChange={(e) => handleFooterChange("copyright_text", e.target.value)}
                  placeholder="© 2025 LooksdeHoje. Todos os direitos reservados."
                  className="font-montserrat text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button floating at bottom */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="font-montserrat font-semibold text-sm gap-2 bg-gradient-gold hover:bg-amber-400 text-black shadow-gold px-8 rounded-full"
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando Alterações..." : "Salvar Todas as Alterações"}
        </Button>
      </div>
    </div>
  );
};

export default ContentManagement;
