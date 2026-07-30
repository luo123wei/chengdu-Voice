'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface FreeSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
  location?: string;
  image?: string;
}

interface FreeSoundCarouselProps {
  sounds: FreeSound[];
}

export default function FreeSoundCarousel({ sounds }: FreeSoundCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % sounds.length;
      // Play the next audio if we were playing
      if (isPlaying && audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
      return next;
    });
  }, [sounds.length, isPlaying]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = (prev - 1 + sounds.length) % sounds.length;
      if (isPlaying && audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
      return next;
    });
  }, [sounds.length, isPlaying]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    if (isPlaying && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  // Auto play every 4 seconds
  useEffect(() => {
    if (isPaused || sounds.length <= 1) return;
    const timer = setInterval(goToNext, 4000);
    return () => clearInterval(timer);
  }, [isPaused, goToNext, sounds.length]);

  // Auto play audio when current sound changes
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [isPlaying]);

  if (sounds.length === 0) {
    return (
      <div className="text-center py-12 bg-cream rounded-xl">
        <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">暂无声音内容</p>
      </div>
    );
  }

  const currentSound = sounds[currentIndex];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel content */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {sounds.map((sound, index) => (
            <div
              key={sound.id}
              className="w-full flex-shrink-0"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Audio player */}
                <audio
                  ref={index === currentIndex ? audioRef : null}
                  src={sound.audio}
                  onEnded={() => {
                    setIsPlaying(false);
                    goToNext();
                  }}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                />
                
                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Play button and visual */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={togglePlay}
                        className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        {isPlaying && index === currentIndex ? (
                          <Pause className="w-12 h-12" />
                        ) : (
                          <Play className="w-12 h-12 ml-1" />
                        )}
                      </button>
                      
                      <div className="mt-4 text-center">
                        <span className="text-lg font-medium text-gray-600">
                          {sound.duration}
                        </span>
                      </div>
                    </div>

                    {/* Sound info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
                        {sound.title}
                      </h2>
                      <p className="text-gray-500 mb-4">{sound.titleEn}</p>
                      
                      {sound.location && (
                        <div className="flex items-center gap-2 text-primary mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{sound.location}</span>
                        </div>
                      )}
                      
                      <p className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: sound.description }}></p>
                      
                      <div className="mt-6 flex items-center gap-4">
                        <button
                          onClick={togglePlay}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                        >
                          <Volume2 className="w-5 h-5" />
                          {isPlaying && index === currentIndex ? 'Pause' : 'Listen Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {sounds.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {sounds.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {sounds.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className="transition-all duration-300 h-2 rounded-full"
              style={{
                width: index === currentIndex ? '32px' : '16px',
                backgroundColor: index === currentIndex ? '#8B4513' : '#D1D5DB',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
