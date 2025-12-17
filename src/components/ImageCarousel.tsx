'use client';

import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

function SafeImage({ src, alt, index }: { src: string; alt: string; index: number }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center rounded-lg">
        <div className="text-center p-8">
          <p className="text-foreground/80 text-lg">Image {index + 1}</p>
          <p className="text-foreground/70 text-sm mt-2">
            Please add image to public/images/img_{['one', 'two', 'three'][index]}.jpg
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain rounded-lg"
      onError={() => setHasError(true)}
    />
  );
}

export default function ImageCarousel({
  images,
  alt = 'Carousel image',
  autoPlay = true,
  autoPlayInterval = 5000,
}: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api || !isPlaying) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [api, isPlaying, autoPlayInterval]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Image Box Container */}
      <div className="flex-1 relative bg-card rounded-lg border border-border shadow-inner overflow-hidden">
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
            dragFree: false,
          }}
          className="w-full h-full"
        >
          <CarouselContent className="h-full -ml-0">
            {images.map((image, index) => (
              <CarouselItem key={index} className="h-full pl-0 basis-full">
                <div className="relative w-full h-full p-2">
                  <SafeImage src={image} alt={`${alt} ${index + 1}`} index={index} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-background/90 backdrop-blur-sm hover:bg-background border-primary/30 shadow-md" />
          <CarouselNext className="right-2 bg-background/90 backdrop-blur-sm hover:bg-background border-primary/30 shadow-md" />
        </Carousel>
        
        {/* Play/Pause Button */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={togglePlayPause}
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm hover:bg-background border-primary/30 shadow-md z-10"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Slide Dots */}
      <div className="flex justify-center items-center gap-2 pt-3">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              api?.scrollTo(index);
              setIsPlaying(false); // Stop autoplay when user manually selects
            }}
            className={`rounded-full transition-all ${
              index === current
                ? 'w-8 h-2 bg-primary'
                : 'w-2 h-2 bg-primary/30 hover:bg-primary/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

