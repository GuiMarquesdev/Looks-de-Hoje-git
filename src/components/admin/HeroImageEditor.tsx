// src/components/admin/HeroImageEditor.tsx

import React, { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Sparkles,
  MoveVertical,
  MoveHorizontal,
  Maximize2,
  Minimize2,
  Eye,
  Smartphone,
  Monitor,
  Wand2,
  Palette,
  Sun,
  Contrast,
  CheckCircle2,
} from "lucide-react";

export interface HeroSlideEditing {
  id?: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  image_fit?: "cover" | "contain" | "fill";
  image_position_x?: number;
  image_position_y?: number;
  image_zoom?: number;
  // Visual Filters & Color grading
  brightness?: number; // 50 to 150 (default 100)
  contrast?: number; // 50 to 150 (default 100)
  saturation?: number; // 0 to 200 (default 100)
  overlay_opacity?: number; // 0 to 90 (default 50)
  filter_preset?: "none" | "warm-gold" | "cinematic" | "monochrome" | "vivid" | "editorial";
}

interface HeroImageEditorProps {
  slide: HeroSlideEditing;
  onChange: (updatedSlide: HeroSlideEditing) => void;
  onReset: () => void;
  previewMode?: "desktop" | "mobile";
  onTogglePreviewMode?: (mode: "desktop" | "mobile") => void;
}

const PRESETS = [
  { id: "none", name: "Natural", icon: "✨", brightness: 100, contrast: 100, saturation: 100 },
  { id: "warm-gold", name: "Dourado Luxo", icon: "👑", brightness: 105, contrast: 108, saturation: 115 },
  { id: "cinematic", name: "Cinematográfico", icon: "🎬", brightness: 95, contrast: 120, saturation: 90 },
  { id: "vivid", name: "Vívido & Moda", icon: "💎", brightness: 102, contrast: 112, saturation: 130 },
  { id: "editorial", name: "Editorial Suave", icon: "📰", brightness: 108, contrast: 95, saturation: 85 },
  { id: "monochrome", name: "P&B Nobre", icon: "🖤", brightness: 100, contrast: 125, saturation: 0 },
] as const;

export const HeroImageEditor: React.FC<HeroImageEditorProps> = ({
  slide,
  onChange,
  onReset,
  previewMode = "desktop",
  onTogglePreviewMode,
}) => {
  const [activeTab, setActiveTab] = useState<"position" | "filters" | "presets">("position");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const posX = slide.image_position_x ?? 50;
  const posY = slide.image_position_y ?? 50;
  const zoom = slide.image_zoom ?? 100;
  const brightness = slide.brightness ?? 100;
  const contrast = slide.contrast ?? 100;
  const saturation = slide.saturation ?? 100;
  const overlayOpacity = slide.overlay_opacity ?? 50;
  const activePreset = slide.filter_preset || "none";

  // Build CSS filter string
  const cssFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  // Interactive drag-to-reposition handler (mouse + touch)
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX,
      y: clientY,
      posX,
      posY,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((clientY - dragStart.y) / rect.height) * 100;

    const newX = Math.round(Math.max(0, Math.min(100, dragStart.posX - deltaX)));
    const newY = Math.round(Math.max(0, Math.min(100, dragStart.posY - deltaY)));

    onChange({
      ...slide,
      image_position_x: newX,
      image_position_y: newY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    onChange({
      ...slide,
      filter_preset: preset.id as HeroSlideEditing["filter_preset"],
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
    });
  };

  const quickAlign = (alignment: "top" | "center" | "bottom" | "left" | "right") => {
    let newX = posX;
    let newY = posY;
    if (alignment === "top") newY = 15;
    if (alignment === "center") { newX = 50; newY = 50; }
    if (alignment === "bottom") newY = 85;
    if (alignment === "left") newX = 20;
    if (alignment === "right") newX = 80;

    onChange({
      ...slide,
      image_position_x: newX,
      image_position_y: newY,
    });
  };

  return (
    <div className="space-y-5">
      {/* Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 text-white px-4 py-2.5 rounded-xl border border-white/10 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-400/40 text-amber-300 font-medium bg-amber-400/10 gap-1.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Editor Visual de Vitrine
          </Badge>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Clique e arraste a imagem para enquadrar
          </span>
        </div>

        {onTogglePreviewMode && (
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => onTogglePreviewMode("desktop")}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                previewMode === "desktop"
                  ? "bg-amber-400 text-black shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => onTogglePreviewMode("mobile")}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                previewMode === "mobile"
                  ? "bg-amber-400 text-black shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Interactive Canvas Viewport */}
      <div className="flex justify-center bg-zinc-950/60 p-3 sm:p-5 rounded-2xl border border-border/80 shadow-inner">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
          className={`relative rounded-xl overflow-hidden shadow-2xl border-2 border-amber-400/30 transition-all select-none group cursor-grab active:cursor-grabbing touch-none ${
            previewMode === "mobile" ? "w-[300px] max-w-full h-[460px]" : "w-full h-[260px] sm:h-[340px]"
          }`}
        >
          {/* Background image with real-time framing and filters */}
          <div
            className="absolute inset-0 bg-no-repeat transition-transform duration-75 ease-out will-change-transform"
            style={{
              backgroundImage: `url(${slide.image_url})`,
              backgroundSize: slide.image_fit || "cover",
              backgroundPosition: `${posX}% ${posY}%`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: `${posX}% ${posY}%`,
              filter: cssFilter,
            }}
          />

          {/* Luxury Text Legibility Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `linear-gradient(to top, rgba(0, 0, 0, ${overlayOpacity / 100}) 0%, rgba(0, 0, 0, ${
                (overlayOpacity * 0.4) / 100
              }) 50%, rgba(0, 0, 0, ${(overlayOpacity * 0.15) / 100}) 100%)`,
            }}
          />

          {/* Focal Point Indicator Crosshair on Hover/Drag */}
          <div
            className={`absolute pointer-events-none transition-opacity duration-200 ${
              isDragging ? "opacity-90" : "opacity-0 group-hover:opacity-40"
            }`}
            style={{ left: `${posX}%`, top: `${posY}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="w-9 h-9 rounded-full border-2 border-amber-300 border-dashed animate-spin-slow flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-gold" />
            </div>
          </div>

          {/* Live Mock Text on Canvas */}
          <div className="absolute inset-x-0 bottom-0 p-5 pointer-events-none flex flex-col justify-end text-white">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 mb-1">
              Coleção Premium • {slide.id ? `Slide #${slide.order || 1}` : "Novo Slide"}
            </span>
            <h4 className="font-playfair text-xl sm:text-2xl font-bold line-clamp-1 drop-shadow-md">
              {slide.title || "Título do Slide na Vitrine"}
            </h4>
            <p className="font-montserrat text-xs sm:text-sm text-white/80 line-clamp-1 drop-shadow mt-1">
              {slide.subtitle || "Subtítulo do slide para momentos especiais"}
            </p>
          </div>

          {/* Drag Overlay Helper */}
          <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white/90 border border-white/10 flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-amber-300" />
            <span>
              {posX}% X • {posY}% Y • {zoom}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs for Editing Tools */}
      <div className="bg-card rounded-xl border border-border p-3 sm:p-4 shadow-sm space-y-4">
        <div className="flex items-center border-b border-border pb-2 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("position")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "position"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Enquadramento & Zoom</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("filters")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "filters"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Cores & Contraste</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "presets"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Filtros Elegantes</span>
          </button>
        </div>

        {/* Tab 1: Positioning & Zoom */}
        {activeTab === "position" && (
          <div className="space-y-4 animate-fade-in">
            {/* Quick alignment chips */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                Alinhamento Rápido da Foto
              </Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickAlign("top")}
                  className="flex-1 min-w-[70px] sm:min-w-0 text-xs h-8 px-2 border-border/80 hover:border-primary/60 hover:bg-primary/10 cursor-pointer"
                >
                  <MoveVertical className="w-3 h-3 mr-1 shrink-0" />
                  Topo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickAlign("center")}
                  className="flex-1 min-w-[70px] sm:min-w-0 text-xs h-8 px-2 border-border/80 hover:border-primary/60 hover:bg-primary/10 cursor-pointer"
                >
                  Centro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickAlign("bottom")}
                  className="flex-1 min-w-[70px] sm:min-w-0 text-xs h-8 px-2 border-border/80 hover:border-primary/60 hover:bg-primary/10 cursor-pointer"
                >
                  Base
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickAlign("left")}
                  className="flex-1 min-w-[70px] sm:min-w-0 text-xs h-8 px-2 border-border/80 hover:border-primary/60 hover:bg-primary/10 cursor-pointer"
                >
                  <MoveHorizontal className="w-3 h-3 mr-1 shrink-0" />
                  Esquerda
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickAlign("right")}
                  className="flex-1 min-w-[70px] sm:min-w-0 text-xs h-8 px-2 border-border/80 hover:border-primary/60 hover:bg-primary/10 cursor-pointer"
                >
                  <MoveHorizontal className="w-3 h-3 mr-1 shrink-0" />
                  Direita
                </Button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2">
              {/* Zoom Slider */}
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-primary" />
                    Zoom da Foto
                  </span>
                  <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">
                    {zoom}%
                  </span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={(val) => onChange({ ...slide, image_zoom: val[0] })}
                  min={80}
                  max={220}
                  step={5}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-mono">
                  <span>80%</span>
                  <span>100% (Padrão)</span>
                  <span>220%</span>
                </div>
              </div>

              {/* Vertical Position (Y) */}
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <MoveVertical className="w-3.5 h-3.5 text-primary" />
                    Posição Vertical (Y)
                  </span>
                  <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">
                    {posY}%
                  </span>
                </div>
                <Slider
                  value={[posY]}
                  onValueChange={(val) => onChange({ ...slide, image_position_y: val[0] })}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>Topo (0%)</span>
                  <span>Meio (50%)</span>
                  <span>Base (100%)</span>
                </div>
              </div>

              {/* Horizontal Position (X) */}
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <MoveHorizontal className="w-3.5 h-3.5 text-primary" />
                    Posição Horizontal (X)
                  </span>
                  <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">
                    {posX}%
                  </span>
                </div>
                <Slider
                  value={[posX]}
                  onValueChange={(val) => onChange({ ...slide, image_position_x: val[0] })}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>Esq (0%)</span>
                  <span>Centro (50%)</span>
                  <span>Dir (100%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Color and Contrast adjustments */}
        {activeTab === "filters" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Brightness */}
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-primary" />
                    Brilho
                  </span>
                  <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">
                    {brightness}%
                  </span>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={(val) => onChange({ ...slide, brightness: val[0] })}
                  min={60}
                  max={140}
                  step={2}
                />
              </div>

              {/* Contrast */}
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Contrast className="w-3.5 h-3.5 text-primary" />
                    Contraste
                  </span>
                  <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">
                    {contrast}%
                  </span>
                </div>
                <Slider
                  value={[contrast]}
                  onValueChange={(val) => onChange({ ...slide, contrast: val[0] })}
                  min={70}
                  max={150}
                  step={2}
                />
              </div>

              {/* Saturation */}
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    Saturação de Cor
                  </span>
                  <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">
                    {saturation}%
                  </span>
                </div>
                <Slider
                  value={[saturation]}
                  onValueChange={(val) => onChange({ ...slide, saturation: val[0] })}
                  min={0}
                  max={180}
                  step={5}
                />
              </div>
            </div>

            {/* Darkness / Vignette Overlay Slider */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div>
                  <span className="text-xs font-semibold block">Escurecimento de Fundo (Legibilidade do Texto)</span>
                  <span className="text-[11px] text-muted-foreground block">
                    Aumente caso a foto seja muito clara para garantir que os títulos fiquem fáceis de ler
                  </span>
                </div>
                <span className="text-xs font-mono bg-background px-2 py-0.5 rounded border shrink-0">
                  {overlayOpacity}%
                </span>
              </div>
              <Slider
                value={[overlayOpacity]}
                onValueChange={(val) => onChange({ ...slide, overlay_opacity: val[0] })}
                min={10}
                max={90}
                step={5}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Presets */}
        {activeTab === "presets" && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-xs font-medium text-muted-foreground block">
              Escolha um visual pré-calibrado para alta costura:
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border/80 hover:border-primary/50 hover:bg-muted/60"
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{p.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        Brilho {p.brightness}% • Sat {p.saturation}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 w-full sm:w-auto justify-start sm:justify-center cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar Todos os Ajustes
          </Button>

          <div className="text-[11px] text-muted-foreground font-montserrat">
            As alterações são aplicadas instantaneamente no preview.
          </div>
        </div>
      </div>
    </div>
  );
};
