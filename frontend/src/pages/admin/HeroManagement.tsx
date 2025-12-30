// src/pages/admin/HeroManagement.tsx

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  Edit,
  Plus,
  RotateCcw,
  Save,
  X,
  GripVertical,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
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

// CORREÇÃO: Importar a api configurada em vez de usar URL fixa
import api from "../../config/api";

// Interfaces baseadas no modelo Prisma
interface HeroSlide {
  id?: string;
  image_url: string;
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

// Interface para resposta de upload
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

// Função utilitária para reordenar arrays
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
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  useEffect(() => {
    if (selectedSlide) {
      form.reset({
        title: selectedSlide.title || "",
        subtitle: selectedSlide.subtitle || "",
        cta_text: selectedSlide.cta_text || "",
        cta_link: selectedSlide.cta_link || "",
        image_fit: selectedSlide.image_fit || "cover",
      });
    }
  }, [selectedSlide]);

  const fetchHeroData = async () => {
    try {
      // CORREÇÃO: Usando api.get
      const response = await api.get<HeroData>("/hero");
      const data = response.data;

      const processedSlides = data.slides.map((slide, index) => {
        if (!slide.id) {
          return { ...slide, id: `temp-${index}` };
        }
        return slide;
      });

      setHeroData({ ...data, slides: processedSlides });
    } catch (error) {
      toast.error("Erro ao carregar hero section");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveSlideToDB = async (slideData: HeroSlide) => {
    try {
      // CORREÇÃO: Usando api.put
      await api.put(`/hero/slides/${slideData.id}`, slideData);
      await fetchHeroData();
    } catch (error) {
      console.error("Erro ao salvar slide:", error);
      throw new Error("Erro ao salvar alterações no servidor.");
    }
  };

  const updateSlidesOrder = async (newSlides: HeroSlide[]) => {
    if (!heroData) return;

    const payloadSlides = newSlides.map((slide) => {
      const isTempId = slide.id && String(slide.id).startsWith("temp-");
      return {
        ...slide,
        id: isTempId ? undefined : slide.id,
      };
    });

    try {
      const updatePayload = {
        ...heroData.settings,
        slides: payloadSlides,
      };

      // CORREÇÃO: Usando api.put
      await api.put("/hero", updatePayload);

      await fetchHeroData();
      toast.success("Ordem dos slides salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar a ordem dos slides.");
      console.error("Error updating slide order:", error);
      await fetchHeroData();
    }
  };

  const moveSlide = (currentIndex: number, direction: "up" | "down") => {
    if (!heroData) return;

    const sortedSlides = heroData.slides.sort((a, b) => a.order - b.order);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

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

      // CORREÇÃO: Usando api.post com tipagem
      const response = await api.post<UploadResponse>(
        "/hero/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const finalUpdatedSlide = {
        ...originalSlide,
        image_url: response.data.url,
      };
      setSelectedSlide(finalUpdatedSlide);
      await saveSlideToDB(finalUpdatedSlide);

      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar imagem");
      console.error(error);
      setSelectedSlide(originalSlide); // Reverte em caso de erro
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

  const updateSlidePosition = (
    key: "image_position_x" | "image_position_y" | "image_zoom",
    value: number
  ) => {
    if (!selectedSlide || !heroData) return;

    const updated = {
      ...selectedSlide,
      [key]: value,
    };

    setSelectedSlide(updated);
    setHeroData({
      ...heroData,
      slides: heroData.slides.map((s) =>
        s.id === selectedSlide.id ? updated : s
      ),
    });
  };

  const resetFraming = async () => {
    if (!selectedSlide || !heroData) return;

    const updated = {
      ...selectedSlide,
      image_position_x: 50,
      image_position_y: 50,
      image_zoom: 100,
    };

    try {
      await saveSlideToDB(updated);
      setSelectedSlide(updated);
      toast.success("Enquadramento resetado e salvo!");
    } catch (error) {
      toast.error("Erro ao resetar enquadramento.");
    }
  };

  const addNewSlide = async () => {
    try {
      // CORREÇÃO: Usando api.post
      await api.post("/hero/slides", {
        image_url:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
        order: heroData ? heroData.slides.length + 1 : 1,
        title: "Novo Slide",
        subtitle: "Conteúdo do novo slide",
        image_position_x: 50,
        image_position_y: 50,
        image_zoom: 100,
        image_fit: "cover",
      });

      await fetchHeroData();
      toast.success("Novo slide adicionado!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao adicionar slide");
      console.error(error);
    }
  };

  const removeSlide = async (id: string) => {
    if (!heroData) return;

    try {
      // CORREÇÃO: Usando api.delete
      await api.delete(`/hero/slides/${id}`);

      await fetchHeroData();

      if (selectedSlide?.id === id) {
        setSelectedSlide(null);
        setEditDialogOpen(false);
      }
      toast.success("Slide removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover slide.");
      console.error(error);
      await fetchHeroData();
    }
  };

  const saveSlideChanges = async (values: z.infer<typeof slideSchema>) => {
    if (!selectedSlide) return;

    try {
      const updatedSlide = {
        ...selectedSlide,
        ...values,
      };

      await saveSlideToDB(updatedSlide as HeroSlide);

      setEditDialogOpen(false);
      toast.success("Alterações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar alterações");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!heroData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Gerenciador de Hero Section
            </h1>
            <p className="text-muted-foreground">
              Gerencie os slides da vitrine principal do seu site
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slides List */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Slides</span>
                  <Button
                    onClick={addNewSlide}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 glow-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {heroData.slides
                    .sort((a, b) => a.order - b.order)
                    .map((slide, index, array) => {
                      const isFirst = index === 0;
                      const isLast = index === array.length - 1;

                      return (
                        <div
                          key={slide.id || index}
                          className={`
                            glass-card p-4 transition-all animate-fade-in
                            ${
                              selectedSlide?.id === slide.id
                                ? "ring-2 ring-primary glow-primary"
                                : "hover:border-primary/50"
                            }
                          `}
                          onClick={() => {
                            setSelectedSlide(slide);
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div
                                  className="w-16 h-10 rounded bg-cover bg-center flex-shrink-0"
                                  style={{
                                    backgroundImage: `url(${slide.image_url})`,
                                  }}
                                />
                                <span className="text-sm font-medium truncate">
                                  {slide.title || `Slide ${slide.order}`}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Mover para cima"
                                disabled={isFirst}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveSlide(index, "up");
                                }}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Mover para baixo"
                                disabled={isLast}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveSlide(index, "down");
                                }}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar Slide"
                                className="text-black hover:text-black"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSlide(slide);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Remover Slide"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (slide.id) removeSlide(slide.id);
                                }}
                                className="text-red-500 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSlide ? (
                  <div className="relative h-64 rounded-lg overflow-hidden border-2 border-border">
                    <div
                      className="absolute inset-0 bg-cover transition-all duration-300"
                      style={{
                        backgroundImage: `url(${selectedSlide.image_url})`,
                        backgroundPosition: `${
                          selectedSlide.image_position_x || 50
                        }% ${selectedSlide.image_position_y || 50}%`,
                        transform: `scale(${
                          (selectedSlide.image_zoom || 100) / 100
                        })`,
                        objectFit: selectedSlide.image_fit || "cover",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {selectedSlide.title || "Título do Slide"}
                        </h3>
                        <p className="text-white/80">
                          {selectedSlide.subtitle || "Subtítulo do slide"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Selecione um slide para visualizar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Slide</DialogTitle>
            <DialogDescription>
              Configure o conteúdo e aparência do slide
            </DialogDescription>
          </DialogHeader>

          {selectedSlide && (
            <div className="space-y-6">
              {/* Image Upload */}
              <div
                className={`
                  relative h-64 rounded-lg overflow-hidden border-2 border-dashed
                  transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }
                `}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
              >
                <div
                  className="absolute inset-0 bg-cover transition-all duration-300"
                  style={{
                    backgroundImage: `url(${selectedSlide.image_url})`,
                    backgroundPosition: `${
                      selectedSlide.image_position_x || 50
                    }% ${selectedSlide.image_position_y || 50}%`,
                    transform: `scale(${
                      (selectedSlide.image_zoom || 100) / 100
                    })`,
                  }}
                />

                <div className="absolute top-4 right-4">
                  <input
                    type="file"
                    id="image-upload-dialog"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        handleImageUpload(e.target.files[0]);
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="bg-black/50 backdrop-blur hover:bg-black/70"
                    disabled={uploading}
                    onClick={() =>
                      document.getElementById("image-upload-dialog")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Enviando..." : "Upload"}
                  </Button>
                </div>
              </div>

              {/* Framing Controls */}
              <div className="space-y-4">
                <h3 className="font-semibold">Ajustes de Enquadramento</h3>

                <div>
                  <label className="text-sm font-medium mb-3 flex items-center justify-between">
                    <span>Posição X</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedSlide.image_position_x || 50}%
                    </span>
                  </label>
                  <Slider
                    value={[selectedSlide.image_position_x || 50]}
                    onValueChange={(v) =>
                      updateSlidePosition("image_position_x", v[0])
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 flex items-center justify-between">
                    <span>Posição Y</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedSlide.image_position_y || 50}%
                    </span>
                  </label>
                  <Slider
                    value={[selectedSlide.image_position_y || 50]}
                    onValueChange={(v) =>
                      updateSlidePosition("image_position_y", v[0])
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 flex items-center justify-between">
                    <span>Zoom</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedSlide.image_zoom || 100}%
                    </span>
                  </label>
                  <Slider
                    value={[selectedSlide.image_zoom || 100]}
                    onValueChange={(v) =>
                      updateSlidePosition("image_zoom", v[0])
                    }
                    min={50}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Button
                  type="button"
                  onClick={resetFraming}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar Enquadramento
                </Button>
              </div>

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(saveSlideChanges)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Título do slide" />
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
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Subtítulo do slide" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cta_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Botão (CTA)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Saiba Mais" />
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
                        <FormLabel>Link do Botão</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://..."
                            type="url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_fit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ajuste da Imagem</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o ajuste" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cover">
                              Cover (Preencher)
                            </SelectItem>
                            <SelectItem value="contain">
                              Contain (Conter)
                            </SelectItem>
                            <SelectItem value="fill">Fill (Esticar)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 glow-primary text-white"
                    >
                      <Save className="w-4 h-4 mr-2 text-white" />
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroManagement;
