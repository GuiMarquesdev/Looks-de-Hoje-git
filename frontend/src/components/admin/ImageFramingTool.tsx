import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface ImageFramingToolProps {
  imageUrl: string;
  positionX: number; // 0-100
  positionY: number; // 0-100
  zoom: number; // 100-200
  onPositionChange: (x: number, y: number) => void;
  onZoomChange: (zoom: number) => void;
  title?: string;
  subtitle?: string;
}

export const ImageFramingTool: React.FC<ImageFramingToolProps> = ({
  imageUrl,
  positionX = 50,
  positionY = 50,
  zoom = 100,
  onPositionChange,
  onZoomChange,
  title,
  subtitle
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (positionX * (containerRef.current?.offsetWidth || 1) / 100),
      y: e.clientY - (positionY * (containerRef.current?.offsetHeight || 1) / 100)
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate new position relative to container
    const x = e.clientX - dragStart.x;
    const y = e.clientY - dragStart.y;
    
    // Convert to percentage (0-100)
    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));
    
    onPositionChange(percentX, percentY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleReset = () => {
    onPositionChange(50, 50);
    onZoomChange(100);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoom + 10);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(100, zoom - 10);
    onZoomChange(newZoom);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          Ajuste Manual de Enquadramento
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Resetar
        </Button>
      </div>

      <Card className="overflow-hidden bg-muted">
        <div
          ref={containerRef}
          className="relative aspect-video cursor-move select-none"
          onMouseDown={handleMouseDown}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${zoom}%`,
            backgroundPosition: `${positionX}% ${positionY}%`,
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Overlay com título e subtítulo */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-center p-4 pointer-events-none">
            <div>
              {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
              {subtitle && <p className="text-sm">{subtitle}</p>}
            </div>
          </div>

          {/* Guias de centro */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
          </div>

          {/* Indicador de drag */}
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
          )}
        </div>

        <div className="p-4 space-y-4 bg-card">
          {/* Controles de Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Zoom: {zoom}%</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 100}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(values) => onZoomChange(values[0])}
              min={100}
              max={200}
              step={5}
              className="w-full"
            />
          </div>

          {/* Informação de Posição */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Posição X: {positionX.toFixed(0)}%</p>
            <p>Posição Y: {positionY.toFixed(0)}%</p>
          </div>

          {/* Instruções */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">Como usar:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Clique e arraste a imagem para reposicioná-la</li>
              <li>Use os botões ou o slider para ajustar o zoom</li>
              <li>As linhas guia indicam o centro da imagem</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
