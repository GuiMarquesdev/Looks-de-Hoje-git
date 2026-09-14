// src/pages/admin/HeroManagement.tsx

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAdminFeedback } from "@/contexts/AdminFeedbackContext";
import {
  Loader2,
  Edit,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  ChevronUp,
  ChevronDown,
  Monitor,
  Smartphone,
  Sparkles,
  Sliders,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import api from "../../config/api";
import { HeroImageEditor, HeroSlideEditing } from "@/components/admin/HeroImageEditor";

// Interfaces
interface HeroSlide extends HeroSlideEditing {
  order: number;
  is_active?: number;
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

interface UploadResponse {
  url: string;
}

const slideSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().url().optional().or(z.literal("")),
  image_fit: z.enum(["cover", "contain", "fill"]).optional(),
});

const reorder = <T extends { order: number; id?: string | number }>(
  list: T[],
  startIndex: number,
  endIndex: number
): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result.map((item, index) => ({
    ...item,
    order: index + 1,
  })) as T[];
};

const HeroManagement = () => {
  const { showSuccess, showError } = useAdminFeedback();
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [slideIdToDelete, setSlideIdToDelete] = useState<string | null>(null);
  const [isDeletingSlide, setIsDeletingSlide] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [isSavingQuick, setIsSavingQuick] = useState(false);

  const form = useForm<z.infer<typeof slideSchema>>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      cta_text: "",
      cta_link: "",
      image_fit: "cover",
    },
  });

  useEffect(() => {
    fetchHeroData();
  }, []);

  const { reset } = form;

  useEffect(() => {
    if (selectedSlide) {
      reset({
        title: selectedSlide.title || "",
        subtitle: selectedSlide.subtitle || "",
        cta_text: selectedSlide.cta_text || "",
        cta_link: selectedSlide.cta_link || "",
        image_fit: (selectedSlide.image_fit as any) || "cover",
      });
    }
  }, [selectedSlide, reset]);

  const fetchHeroData = async () => {
    try {
      const response = await api.get<HeroData>("/hero");
      const data = response.data;

      const processedSlides = (data.slides || []).map((slide, index) => {
        if (!slide.id) {
          return { ...slide, id: `temp-${index}` };
        }
        return slide;
      });

      const sorted = [...processedSlides].sort((a, b) => (a.order || 0) - (b.order || 0));
      setHeroData({ ...data, slides: sorted });

      // Automatically select first slide if none selected
      if (sorted.length > 0 && !selectedSlide) {
        setSelectedSlide(sorted[0]);
      } else if (selectedSlide) {
        const stillExists = sorted.find((s) => s.id === selectedSlide.id);
        if (stillExists) setSelectedSlide(stillExists);
        else if (sorted.length > 0) setSelectedSlide(sorted[0]);
      }
    } catch (error) {
      toast.error("Erro ao carregar hero section");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveSlideToDB = async (slideData: HeroSlide) => {
    try {
      await api.put(`/hero/slides/${slideData.id}`, slideData);
      await fetchHeroData();
    } catch (error) {
      console.error("Erro ao salvar slide:", error);
      throw new Error("Erro ao salvar alterações no servidor.");
    }
  };

  const updateSlidesOrder = async (newSlides: HeroSlide[]) => {
    if (!heroData) return;

    const payloadSlides = newSlides.map((slide, idx) => {
      const isTempId = slide.id && String(slide.id).startsWith("temp-");
      return {
        ...slide,
        id: isTempId ? undefined : slide.id,
        order: idx + 1,
      };
    });

    try {
      const updatePayload = {
        ...heroData.settings,
        slides: payloadSlides,
      };

      const response = await api.put("/hero", updatePayload);
      if (response.data && response.data.slides) {
        const sorted = [...response.data.slides].sort((a: HeroSlide, b: HeroSlide) => (a.order || 0) - (b.order || 0));
        setHeroData((prev) => (prev ? { ...prev, slides: sorted } : null));
      } else {
        await fetchHeroData();
      }
      toast.success("Ordem dos slides atualizada!");
      showSuccess(
        "Ordem da Vitrine Atualizada!",
        "A nova sequência de exibição dos slides foi gravada no servidor e entrará em vigor imediatamente.",
        [`Total de slides ordenados: ${newSlides.length}`]
      );
    } catch (error: any) {
      toast.error("Erro ao salvar a ordem dos slides.");
      console.error("Error updating slide order:", error);
      showError("Falha na Reordenação", "Não foi possível sincronizar a nova ordem com o servidor.", error?.message);
      await fetchHeroData();
    }
  };

  const moveSlide = (currentIndex: number, direction: "up" | "down") => {
    if (!heroData) return;

    const sortedSlides = [...heroData.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sortedSlides.length) {
      return;
    }

    const newSlides = reorder(sortedSlides, currentIndex, targetIndex);

    setHeroData({
      ...heroData,
      slides: newSlides,
    });

    updateSlidesOrder(newSlides);
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedSlide) return;

    const originalSlide = { ...selectedSlide };
    const tempImageUrl = URL.createObjectURL(file);
    const temporarySlide = { ...selectedSlide, image_url: tempImageUrl };
    setSelectedSlide(temporarySlide);

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post<UploadResponse>(
        "/hero/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const finalUpdatedSlide: HeroSlide = {
        ...originalSlide,
        image_url: response.data.url,
      };
      setSelectedSlide(finalUpdatedSlide);
      await saveSlideToDB(finalUpdatedSlide);

      toast.success("Nova foto enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar imagem");
      console.error(error);
      setSelectedSlide(originalSlide);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(tempImageUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSlideEditorChange = (updated: HeroSlideEditing) => {
    if (!heroData) return;
    const asHeroSlide = updated as HeroSlide;
    setSelectedSlide(asHeroSlide);
    setHeroData({
      ...heroData,
      slides: heroData.slides.map((s) => (s.id === updated.id ? asHeroSlide : s)),
    });
  };

  const handleSaveEditorChanges = async () => {
    if (!selectedSlide) return;
    setIsSavingQuick(true);
    try {
      await saveSlideToDB(selectedSlide);
      toast.success("Ajustes visuais salvos com sucesso!");
      showSuccess(
        "Alterações Salvas na Vitrine!",
        `O enquadramento, zoom e filtros do slide "${selectedSlide.title || "Sem título"}" foram atualizados e já estão visíveis na página inicial.`,
        [
          `Zoom: ${selectedSlide.image_zoom || 100}%`,
          `Filtro aplicado: ${selectedSlide.filter_preset || "Padrão"}`,
          `Posição focal: X ${selectedSlide.image_position_x || 50}% | Y ${selectedSlide.image_position_y || 50}%`,
        ]
      );
    } catch (err: any) {
      toast.error("Erro ao salvar ajustes.");
      showError(
        "Falha ao Salvar Alteração",
        "Não foi possível gravar as alterações do slide no servidor. Verifique sua conexão e tente novamente.",
        err?.message || "Erro desconhecido"
      );
    } finally {
      setIsSavingQuick(false);
    }
  };

  const resetFraming = async () => {
    if (!selectedSlide || !heroData) return;

    const updated: HeroSlide = {
      ...selectedSlide,
      image_position_x: 50,
      image_position_y: 50,
      image_zoom: 100,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      overlay_opacity: 50,
      filter_preset: "none",
    };

    try {
      await saveSlideToDB(updated);
      setSelectedSlide(updated);
      toast.success("Enquadramento e filtros resetados para o padrão!");
    } catch (error) {
      toast.error("Erro ao resetar enquadramento.");
    }
  };

  const addNewSlide = async () => {
    try {
      await api.post("/hero/slides", {
        image_url:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=85",
        order: heroData ? heroData.slides.length + 1 : 1,
        title: "Alta Moda & Elegância",
        subtitle: "Descubra vestidos e peças exclusivas para aluguel",
        image_position_x: 50,
        image_position_y: 50,
        image_zoom: 100,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        overlay_opacity: 50,
        filter_preset: "none",
        image_fit: "cover",
      });

      await fetchHeroData();
      toast.success("Novo slide adicionado à vitrine!");
      showSuccess(
        "Novo Slide Adicionado!",
        "O slide foi criado e adicionado com sucesso ao carrossel principal. Você pode personalizá-lo agora usando o editor visual abaixo.",
        ["Imagem inicial configurada", "Texto e botões padrões atribuídos"]
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao adicionar slide");
      console.error(error);
      showError(
        "Erro ao Criar Slide",
        "Não foi possível criar o novo slide.",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleConfirmDeleteSlide = async () => {
    if (!slideIdToDelete || !heroData) return;

    setIsDeletingSlide(true);
    try {
      await api.delete(`/hero/slides/${slideIdToDelete}`);
      await fetchHeroData();

      if (selectedSlide?.id === slideIdToDelete) {
        setSelectedSlide(null);
        setEditDialogOpen(false);
      }
      toast.success("Slide removido da vitrine.");
      showSuccess(
        "Slide Excluído com Sucesso!",
        "O slide foi removido permanentemente da vitrine da página inicial."
      );
      setSlideIdToDelete(null);
    } catch (error: any) {
      toast.error("Erro ao remover slide.");
      console.error(error);
      showError("Erro ao Remover Slide", "Não foi possível excluir o slide no servidor.", error?.message);
      await fetchHeroData();
    } finally {
      setIsDeletingSlide(false);
    }
  };

  const saveSlideChanges = async (values: z.infer<typeof slideSchema>) => {
    if (!selectedSlide) return;

    try {
      const updatedSlide: HeroSlide = {
        ...selectedSlide,
        ...values,
      };

      await saveSlideToDB(updatedSlide);

      setEditDialogOpen(false);
      toast.success("Textos e dados salvos com sucesso!");
      showSuccess(
        "Slide Atualizado com Sucesso!",
        `As alterações de título, subtítulo e link do botão foram gravadas no banco de dados e publicadas no site.`,
        [
          `Título: "${values.title || "Sem título"}"`,
          `Botão CTA: "${values.cta_text || "Sem botão"}" -> ${values.cta_link || "Link padrão"}`,
          `Enquadramento: ${values.image_fit || "cover"}`,
        ]
      );
    } catch (error: any) {
      toast.error("Erro ao salvar alterações");
      console.error(error);
      showError(
        "Erro ao Salvar Dados do Slide",
        "Ocorreu uma falha ao tentar atualizar os textos e botões do slide selecionado.",
        error?.message || "Erro interno do servidor"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Carregando gerenciador de vitrine...</span>
      </div>
    );
  }

  if (!heroData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background p-8">
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center max-w-md">
          <p className="font-semibold mb-1">Não foi possível carregar os dados da Vitrine</p>
          <p className="text-xs text-red-600">Verifique sua conexão ou autenticação de administrador.</p>
        </div>
        <Button onClick={fetchHeroData} variant="outline" size="sm">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Sorted slides list
  const sortedSlides = [...heroData.slides].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 sm:p-6 lg:p-8 font-montserrat">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Luxury Header */}
        <div className="bg-white border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-400/10 text-amber-800 border-amber-300 font-semibold px-2.5 py-0.5 text-xs">
                <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
                Vitrine Principal
              </Badge>
              <span className="text-xs text-muted-foreground">
                {sortedSlides.length} {sortedSlides.length === 1 ? "slide ativo" : "slides ativos"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-playfair tracking-tight text-foreground">
              Editor de Vitrine & Banners
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Personalize imagens em alta resolução, ajuste o enquadramento perfeito, aplique filtros de alta costura e ordene os destaques da página inicial.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto">
            <Button
              onClick={addNewSlide}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-gold px-4 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Novo Slide
            </Button>
          </div>
        </div>

        {/* Main Grid: Left is Slides Order/Selector, Right is Realtime Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Slides List & Manager (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border border-border/80 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-muted/30 border-b border-border/60 py-3 sm:py-4 px-4 sm:px-5 flex flex-row items-center justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 truncate">
                    <Layers className="w-4 h-4 text-primary shrink-0" />
                    <span>Sequência da Vitrine</span>
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    Selecione para editar ou use as setas
                  </p>
                </div>
                <Button
                  onClick={addNewSlide}
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Slide
                </Button>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                {sortedSlides.length === 0 ? (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-border rounded-xl">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-muted-foreground">Nenhum slide cadastrado</p>
                    <Button onClick={addNewSlide} size="sm" variant="outline" className="mt-3 text-xs cursor-pointer">
                      Criar primeiro slide
                    </Button>
                  </div>
                ) : (
                  sortedSlides.map((slide, index, array) => {
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;
                    const isSelected = selectedSlide?.id === slide.id;

                    return (
                      <div
                        key={slide.id || index}
                        onClick={() => setSelectedSlide(slide)}
                        className={`
                          p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none
                          ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/30"
                              : "border-border/70 hover:border-primary/40 hover:bg-zinc-50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Order Badge */}
                          <div
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>

                          {/* Thumbnail */}
                          <div
                            className="w-14 sm:w-16 h-10 sm:h-12 rounded-lg bg-cover bg-center flex-shrink-0 border border-black/10 shadow-xs relative overflow-hidden"
                            style={{
                              backgroundImage: `url(${slide.image_url})`,
                              backgroundPosition: `${slide.image_position_x || 50}% ${slide.image_position_y || 50}%`,
                            }}
                          >
                            <div className="absolute inset-0 bg-black/10" />
                          </div>

                          {/* Slide Titles */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">
                              {slide.title || `Slide #${slide.order || index + 1}`}
                            </h4>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {slide.subtitle || "Sem subtítulo"}
                            </p>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              title="Mover para cima"
                              disabled={isFirst}
                              onClick={() => moveSlide(index, "up")}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              title="Mover para baixo"
                              disabled={isLast}
                              onClick={() => moveSlide(index, "down")}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              title="Excluir slide"
                              onClick={() => {
                                if (slide.id) setSlideIdToDelete(slide.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Quick Upload helper for currently selected slide */}
            {selectedSlide && (
              <Card className="border border-border/80 shadow-sm rounded-2xl p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    Substituir Foto do Slide
                  </span>
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                </div>

                <div
                  className={`
                    border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer
                    ${dragActive ? "border-primary bg-primary/5" : "border-border/80 hover:border-primary/50"}
                  `}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => document.getElementById("quick-image-upload")?.click()}
                >
                  <input
                    type="file"
                    id="quick-image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                    }}
                  />
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">Clique para enviar nova foto</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">ou arraste e solte arquivos JPG, PNG ou WEBP</p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Interactive Editor Workspace (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedSlide ? (
              <Card className="border border-border/80 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 sm:py-4 px-3.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base sm:text-lg font-bold">
                        Ajuste Visual do Slide #{selectedSlide.order || 1}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono border-border">
                        {selectedSlide.title || "Sem título"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Controles de arrasto, zoom ótico, iluminação e filtros de imagem
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialogOpen(true)}
                      className="text-xs font-semibold h-9 rounded-xl border-border/80 gap-1.5 flex-1 sm:flex-initial"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar Textos & CTA
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleSaveEditorChanges}
                      disabled={isSavingQuick}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-gold h-9 rounded-xl gap-1.5 px-4 flex-1 sm:flex-initial"
                    >
                      {isSavingQuick ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Salvar Ajustes
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-3.5 sm:p-6">
                  {/* The interactive HeroImageEditor */}
                  <HeroImageEditor
                    slide={selectedSlide}
                    onChange={handleSlideEditorChange}
                    onReset={resetFraming}
                    previewMode={previewViewport}
                    onTogglePreviewMode={(mode) => setPreviewViewport(mode)}
                  />

                  {/* Summary Bar */}
                  <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span><strong>Título:</strong> {selectedSlide.title || "(Vazio)"}</span>
                      <span><strong>Subtítulo:</strong> {selectedSlide.subtitle || "(Vazio)"}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleSaveEditorChanges}
                      disabled={isSavingQuick}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-gold h-9 rounded-xl gap-2"
                    >
                      {isSavingQuick ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Confirmar e Salvar no Site
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed border-border rounded-2xl p-16 text-center bg-white">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-base font-bold text-foreground">Nenhum slide selecionado</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Selecione um slide na coluna ao lado ou crie um novo para ajustar fotos e visual.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Texts & Meta Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto font-montserrat rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl font-bold">Editar Textos do Slide</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure o título e subtítulo que aparecem sobrepostos à foto na vitrine.
            </DialogDescription>
          </DialogHeader>

          {selectedSlide && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(saveSlideChanges)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Título Principal</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Coleção Alta Costura 2026" className="rounded-xl text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Subtítulo ou Descrição Curta</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Alugue peças icônicas para formaturas, casamentos e galas"
                          className="rounded-xl text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <FormField
                    control={form.control}
                    name="cta_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Texto do Botão (Opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Explorar Catálogo" className="rounded-xl text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cta_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Link de Destino</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: /produtos ou https://..." className="rounded-xl text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-gold rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Textos
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão de Slide */}
      <AlertDialog
        open={Boolean(slideIdToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeletingSlide) {
            setSlideIdToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="font-montserrat rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair text-xl text-foreground font-bold">
              Excluir Slide da Vitrine?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              Tem certeza que deseja remover este slide da vitrine principal? A imagem não será mais exibida para os clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSlide} className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteSlide}
              disabled={isDeletingSlide}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {isDeletingSlide ? "Excluindo..." : "Sim, Excluir Slide"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HeroManagement;
