import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductImage {
  url: string;
  order: number;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  productName: string;
  imagePositionX?: number;
  imagePositionY?: number;
  imageZoom?: number;
  className?: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ 
  images, 
  productName,
  imagePositionX = 50,
  imagePositionY = 50,
  imageZoom = 100,
  className = "" 
}) => {
  // Sort images by order
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  // If no images, show placeholder
  if (!sortedImages.length) {
    return (
      <div className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground">Sem imagem</span>
      </div>
    );
  }

  // If only one image, show it without carousel controls
  if (sortedImages.length === 1) {
    return (
      <div className={`relative aspect-[3/4] overflow-hidden rounded-lg ${className}`}>
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url(${sortedImages[0].url})`,
            backgroundSize: `${imageZoom}%`,
            backgroundPosition: `${imagePositionX}% ${imagePositionY}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Carousel className="w-full">
        <CarouselContent>
          {sortedImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${image.url})`,
                    backgroundSize: index === 0 ? `${imageZoom}%` : '100%',
                    backgroundPosition: index === 0 ? `${imagePositionX}% ${imagePositionY}%` : 'center center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      
      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {sortedImages.length} fotos
      </div>
    </div>
  );
};

export default ProductImageCarousel;