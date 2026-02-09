'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const stats = [
  { value: '150+', label: 'Créateurs actifs' },
  { value: '15,000+', label: 'Références analysées' },
  { value: '500+', label: 'Marques créées' },
  { value: '4.9/5', label: 'Note moyenne' },
];

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section id="stats-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'text-center transition-all duration-700',
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              )}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="text-5xl lg:text-6xl font-bold text-[#000000] mb-2">
                {stat.value}
              </div>
              <div className="text-base text-[#6e6e73] font-normal">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
