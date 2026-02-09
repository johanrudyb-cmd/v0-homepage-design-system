'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FashionItemProps {
  type: 'tshirt' | 'hoodie' | 'jacket' | 'pants';
  delay?: number;
  className?: string;
}

const fashionItems = {
  tshirt: {
    emoji: '👕',
    colors: ['#007AFF', '#FF3B30', '#34C759', '#FF9500'],
    name: 'T-shirt',
  },
  hoodie: {
    emoji: '🧥',
    colors: ['#5856D6', '#FF2D55', '#1D1D1F', '#8E8E93'],
    name: 'Hoodie',
  },
  jacket: {
    emoji: '🧥',
    colors: ['#1D1D1F', '#007AFF', '#FF3B30', '#34C759'],
    name: 'Veste',
  },
  pants: {
    emoji: '👖',
    colors: ['#1D1D1F', '#5856D6', '#007AFF', '#8E8E93'],
    name: 'Pantalon',
  },
};

export function FashionItem({ type, delay = 0, className }: FashionItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColor((prev) => (prev + 1) % fashionItems[type].colors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [type]);

  const item = fashionItems[type];

  return (
    <div
      ref={itemRef}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95',
        className
      )}
    >
      {/* Carte avec effet glassmorphism */}
      <div
        className={cn(
          'relative w-32 h-40 rounded-3xl',
          'bg-white shadow-apple-lg',
          'flex items-center justify-center',
          'transition-all duration-500',
          'hover:scale-105 hover:shadow-apple-lg',
          'border border-black/5'
        )}
        style={{
          background: `linear-gradient(135deg, ${item.colors[currentColor]}15 0%, ${item.colors[currentColor]}05 100%)`,
        }}
      >
        {/* Emoji animé */}
        <div
          className="text-6xl transition-all duration-500"
          style={{
            filter: `drop-shadow(0 4px 8px ${item.colors[currentColor]}30)`,
            transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-10deg)',
          }}
        >
          {item.emoji}
        </div>

        {/* Indicateur de couleur animé */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {item.colors.map((color, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentColor ? 'scale-125' : 'scale-100 opacity-50'
              )}
              style={{
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      </div>

      {/* Label */}
      <p className="mt-4 text-sm font-medium text-[#1D1D1F]/60 animate-fade-in">
        {item.name}
      </p>
    </div>
  );
}
