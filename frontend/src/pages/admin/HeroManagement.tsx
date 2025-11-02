// src/pages/admin/HeroManagement.tsx

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Settings, Image, Edit, Plus, RotateCcw } from "lucide-react";
import { API_URL } from "@/config/api";
import {
  MultipleImageUpload,
  ProductImage,
} from "@/components/admin/MultipleImageUpload"; // Agora ProductImage usa 'image_url'
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImageFramingTool } from "@/components/admin/ImageFramingTool";

// Interfaces baseadas no modelo Prisma
interface HeroSlide {
  id?: string;
  image_url: string; // Corrigido para image_url
  order: number;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  image_fit?: "cover" | "contain" | "fill";
  image_position_x?: number;
  image_position_y?: number;
  image_zoom?: number;
}
interface HeroSetting {
  id: string;
  is_active: boolean;
  interval_ms: number;
  background_image_url?: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
}
interface HeroData {
  settings: HeroSetting;
  slides: HeroSlide[];
}

// SCHEMA ZOD EXPANDIDO PARA NOVOS CAMPOS (mantido)
const slideContentSchema = z.object({
  title: z.string().max(100, "Máximo de 100 caracteres").optional(),
  subtitle: z.string().max(255, "Máximo de 255 caracteres").optional(),
  cta_text: z.string().max(50, "Máximo de 50 caracteres").optional(),
  cta_link: z
    .string()
    .url("Deve ser uma URL válida")
    .optional()
    .or(z.literal("")),

  image_fit: z.enum(["cover", "contain", "fill"]).optional(),
  image_position_x: z.number().optional(),
  image_position_y: z.number().optional(),
  image_zoom: z.number().optional(),
});
type SlideContentFormValues = z.infer<typeof slideContentSchema>;

const HeroManagement = () => {
  // Declaração dos estados e variáveis
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados Locais para Configurações Gerais
  const [is_active, setIsActive] = useState(false);
  const [interval_ms, setIntervalMs] = useState(5000);
  // REMOVIDO: const [background_image_url, setBackgroundImageUrl] = useState("");

  // Estado para gerenciar as imagens (ProductImage agora inclui os campos de texto)
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  // Estado para edição de slide individual
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(
    null
  );
  const [isSlideEditorOpen, setIsSlideEditorOpen] = useState(false);

  // Instância do useForm para o Editor de Slides
  const slideForm = useForm<SlideContentFormValues>({
    resolver: zodResolver(slideContentSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      cta_text: "",
      cta_link: "",
      image_fit: "cover",
      image_position_x: 50,
      image_position_y: 50,
      image_zoom: 100,
    },
  });

  // ------------------------------------------
  // LÓGICA DE BUSCA DE DADOS (GET)
  // ------------------------------------------
  const fetchHeroSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/hero`);

      if (!response.ok) {
        let errorDetail = "Erro desconhecido ao carregar configurações.";
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.message || errorDetail;
        } catch {
          errorDetail = response.statusText || `Status: ${response.status}`;
        }
        throw new Error(errorDetail);
      }

      const data: HeroData = await response.json();
      setHeroData(data);

      // ATUALIZAÇÃO DOS ESTADOS LOCAIS GERAIS
      setIsActive(data.settings.is_active);
      setIntervalMs(data.settings.interval_ms);
      // setBackgroundImageUrl(data.settings.background_image_url || ""); // REMOVIDO

      // Inicializa o estado de imagens com os slides do backend (incluindo os campos de texto)
      setProductImages(
        data.slides.map((slide) => ({
          // 🚨 NOVO NOME DE PROPRIEDADE: Mapeando image_url do backend para image_url do frontend
          image_url: slide.image_url,
          order: slide.order,
          file: undefined,
          isNew: false,
          // CARREGA TODOS OS CAMPOS
          title: slide.title,
          subtitle: slide.subtitle,
          cta_text: slide.cta_text,
          cta_link: slide.cta_link,
          image_fit: slide.image_fit || "cover",
          image_position_x: slide.image_position_x ?? 50,
          image_position_y: slide.image_position_y ?? 50,
          image_zoom: slide.image_zoom ?? 100,
        }))
      );

      toast.success("Configurações do Hero carregadas com sucesso.");
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error("Error fetching hero settings:", errorMessage);
      setError(errorMessage);
      // Permite que o usuário crie o registro se for a primeira vez.
      if (errorMessage.includes("Configurações do Hero não inicializadas")) {
        toast.info(
          "Configurações iniciais não encontradas. Por favor, configure e salve."
        );
      } else {
        toast.error(`Erro ao carregar configurações do Hero: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  // ------------------------------------------
  // LÓGICA DE ATUALIZAÇÃO GERAL (PUT)
  // ------------------------------------------
  const handleSaveSettings = async () => {
    if (!heroData) return;
    setIsSaving(true);

    try {
      // O payload agora inclui os campos gerais e os slides com conteúdo de texto
      const payload = {
        is_active: is_active,
        interval_ms: interval_ms,
        // background_image_url: background_image_url, // REMOVIDO
        slides: productImages.map((img) => ({
          // 🚨 USANDO image_url CONSISTENTEMENTE
          image_url: img.image_url,
          order: img.order,
          id: img.id,
          // SALVA OS NOVOS CAMPOS DO ESTADO DO PRODUCTIMAGES
          title: img.title || "",
          subtitle: img.subtitle || "",
          cta_text: img.cta_text || "",
          cta_link: img.cta_link || "",
          image_fit: img.image_fit || "cover",
          image_position_x: img.image_position_x ?? 50,
          image_position_y: img.image_position_y ?? 50,
          image_zoom: img.image_zoom ?? 100,
        })),
      };

      const response = await fetch(`${API_URL}/hero`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar no servidor.");
      }

      toast.success("Configurações do Hero atualizadas com sucesso!");
      setIsSlideEditorOpen(false);
      fetchHeroSettings();
    } catch (e) {
      toast.error("Erro ao salvar configurações.");
      console.error("Erro ao salvar:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------------
  // LÓGICA DE EDIÇÃO DE SLIDE INDIVIDUAL (mantida)
  // ------------------------------------------
  const openEditDialog = (index: number) => {
    setEditingSlideIndex(index);
    const slide = productImages[index];

    // RESETANDO O FORMULÁRIO COM TODOS OS DADOS DE CONTEÚDO E IMAGEM
    slideForm.reset({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      cta_text: slide.cta_text || "",
      cta_link: slide.cta_link || "",
      image_fit: slide.image_fit || "cover",
      image_position_x: slide.image_position_x ?? 50,
      image_position_y: slide.image_position_y ?? 50,
      image_zoom: slide.image_zoom ?? 100,
    });

    setIsSlideEditorOpen(true);
  };

  // Função de Submissão do Formulário de Slide (mantida)
  const handleSlideFormSubmit = (values: SlideContentFormValues) => {
    if (editingSlideIndex === null) return;

    // Atualiza o objeto ProductImage/HeroSlide no array productImages
    const newImages = [...productImages];
    newImages[editingSlideIndex] = {
      ...newImages[editingSlideIndex],
      ...values, // Espalha os novos valores (texto e imagem config)
    };
    setProductImages(newImages);

    toast.success(
      `Conteúdo do Slide ${editingSlideIndex + 1} atualizado localmente.`
    );
    setIsSlideEditorOpen(false); // Fecha o modal
    setEditingSlideIndex(null);
  };

  // Handlers para o ImageFramingTool
  const handleFramingChange = (x: number, y: number) => {
    if (editingSlideIndex !== null) {
      const newImages = [...productImages];
      newImages[editingSlideIndex] = {
        ...newImages[editingSlideIndex],
        image_position_x: x,
        image_position_y: y,
      };
      setProductImages(newImages);
      slideForm.setValue("image_position_x", x, { shouldDirty: true });
      slideForm.setValue("image_position_y", y, { shouldDirty: true });
    }
  };

  const handleZoomChange = (zoom: number) => {
    if (editingSlideIndex !== null) {
      const newImages = [...productImages];
      newImages[editingSlideIndex] = {
        ...newImages[editingSlideIndex],
        image_zoom: zoom,
      };
      setProductImages(newImages);
      slideForm.setValue("image_zoom", zoom, { shouldDirty: true });
    }
  };

  const handleAddSlideClick = () => {
    toast.info(
      "Use o botão 'Adicionar Fotos' na seção 'Gestão de Imagens' para carregar novas imagens."
    );
  };

  const currentEditingSlide =
    editingSlideIndex !== null ? productImages[editingSlideIndex] : null;

  if (loading || !heroData || !heroData.settings) {
    // 🚨 NOTA: O Fallback no Backend deve garantir que o settings não seja null no
    // primeiro carregamento (retorna o DEFAULT_HERO_SETTINGS).
    // Caso contrário, esta tela não carregará.
    // Se ainda vir este loading, confira a correção do backend!
    return (
      <div className="p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="font-montserrat text-muted-foreground">
          Carregando configurações do Hero...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* CABEÇALHO COM BOTÕES ALINHADOS */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">
            Gerenciar Vitrine da Loja
          </h1>
          <p className="text-muted-foreground font-montserrat">
            Gerencie os textos e imagens do carrossel principal do site
          </p>
        </div>

        <div className="flex gap-4">
          {/* Botão Adicionar Slide */}
          <Button
            onClick={handleAddSlideClick}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-montserrat font-semibold px-6 py-3 rounded-full shadow-lg"
            disabled={isSaving}
          >
            <Plus className="w-4 h-4" />
            Adicionar Slide
          </Button>

          {/* Botão Salvar Alterações (Ação principal) */}
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-montserrat font-semibold px-6 py-3 rounded-full shadow-lg"
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Card de Configurações Gerais */}
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo Ativo/Inativo (usando Switch) */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <label className="text-base font-montserrat">Status</label>
                <p className="text-sm text-muted-foreground font-montserrat">
                  {is_active
                    ? "Vitrine da Loja visível na página inicial."
                    : "Vitrine da Loja oculta."}
                </p>
              </div>
              <Switch checked={is_active} onCheckedChange={setIsActive} />
            </div>

            {/* Campo Intervalo de Transição */}
            <div className="space-y-2">
              <label className="font-montserrat text-sm">
                Intervalo de Transição (em milissegundos)
              </label>
              <Input
                type="number"
                value={interval_ms}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
                min={1000}
                step={500}
              />
              <p className="text-xs text-muted-foreground">
                Duração de cada slide: {interval_ms / 1000} segundos
              </p>
            </div>

            {/* Ocultando o campo de Fundo Padrão (Fallback) conforme solicitado */}
            {/* <h3 className="font-playfair text-lg font-semibold mt-6">
              Fundo Padrão (Fallback)
            </h3>
            <Input
              placeholder="URL da Imagem de Fundo Geral (Fallback)"
              value={background_image_url}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
            /> 
            */}

            {/* Instrução de salvamento */}
            <div className="flex justify-end mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Use o botão "Salvar Alterações" no topo para salvar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Gestão de Slides (com edição por slide) */}
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Gestão de Imagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultipleImageUpload
              images={productImages}
              onChange={setProductImages}
              maxImages={10}
            />

            {/* Lista de Slides com Botão de Edição */}
            <h3 className="font-playfair text-lg font-semibold mt-6">
              Conteúdo de Texto e Configuração por Slide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productImages.map((slide, index) => (
                <div
                  key={slide.image_url} // 🚨 Usando image_url
                  className="relative border p-4 rounded-lg space-y-2 group"
                >
                  <img
                    src={slide.image_url} // 🚨 Usando image_url
                    alt={`Slide ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <p className="text-sm font-montserrat font-semibold">
                    Slide {index + 1}: {slide.title || "Sem Título"}
                  </p>
                  <p className="text-xs text-muted-foreground font-montserrat line-clamp-1">
                    {slide.subtitle || "Sem Subtítulo"}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openEditDialog(index)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {productImages.length === 0 && (
                <p className="text-sm text-muted-foreground font-montserrat col-span-full text-center pt-8">
                  Nenhum slide encontrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG DE EDIÇÃO DE SLIDE (Com Formulario Completo) */}
      <Dialog open={isSlideEditorOpen} onOpenChange={setIsSlideEditorOpen}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair">
              Slide {editingSlideIndex !== null ? editingSlideIndex + 1 : ""}:{" "}
              {currentEditingSlide?.title || "Novo Slide"}
            </DialogTitle>
          </DialogHeader>

          {currentEditingSlide && (
            <Form {...slideForm}>
              <form
                onSubmit={slideForm.handleSubmit(handleSlideFormSubmit)}
                className="space-y-6 pt-2"
              >
                {/* 1. CAMPOS DE TEXTO (Título e Subtítulo) */}
                <div className="space-y-4">
                  <FormField
                    control={slideForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat">
                          Título Principal
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Elegância em Cada Ocasião"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={slideForm.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat">
                          Subtítulo
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Alugue looks únicos para momentos especiais"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campos CTA */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={slideForm.control}
                      name="cta_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-montserrat">
                            Texto do Botão (CTA)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ver Coleção" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={slideForm.control}
                      name="cta_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-montserrat">
                            Link do Botão (URL)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="/colecao" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 2. CONFIGURAÇÕES DA IMAGEM */}
                <h3 className="font-playfair text-lg font-semibold border-t pt-6">
                  Configuração da Imagem
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Ajuste da Imagem (image_fit) */}
                  <FormField
                    control={slideForm.control}
                    name="image_fit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat">
                          Ajuste da Imagem
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Cobrir (Cover)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cover">
                              Cobrir (Cover)
                            </SelectItem>
                            <SelectItem value="contain">
                              Conter (Contain)
                            </SelectItem>
                            <SelectItem value="fill">
                              Preencher (Fill)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Posição da Imagem (image_position_x/y - aqui só o label) */}
                  <FormItem>
                    <FormLabel className="font-montserrat">
                      Posição da Imagem
                    </FormLabel>
                    <Select disabled defaultValue="center">
                      <SelectTrigger>
                        <SelectValue placeholder="Centro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Centro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                </div>

                {/* 3. FERRAMENTA DE ENQUADRAMENTO */}
                <h3 className="font-playfair text-lg font-semibold border-t pt-6">
                  Ajuste Manual de Enquadramento
                </h3>

                {currentEditingSlide.image_url ? (
                  <ImageFramingTool
                    imageUrl={currentEditingSlide.image_url} // 🚨 Usando image_url
                    // Valores lidos do formState para a ferramenta
                    positionX={slideForm.watch("image_position_x") || 50}
                    positionY={slideForm.watch("image_position_y") || 50}
                    zoom={slideForm.watch("image_zoom") || 100}
                    // Handlers para atualizar o estado e o formulário
                    onPositionChange={handleFramingChange}
                    onZoomChange={handleZoomChange}
                    title={currentEditingSlide.title}
                    subtitle={currentEditingSlide.subtitle}
                  />
                ) : (
                  <div className="text-muted-foreground text-sm border p-4 rounded-lg text-center">
                    Nenhuma imagem selecionada para enquadramento.
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={() => setIsSlideEditorOpen(false)}
                    variant="outline"
                    className="font-montserrat"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="font-montserrat bg-primary hover:bg-primary-dark"
                  >
                    Salvar Conteúdo Local
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroManagement;
