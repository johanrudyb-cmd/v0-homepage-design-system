'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Calculator } from 'lucide-react';

export function MarginCalculator() {
  const [isVisible, setIsVisible] = useState(false);
  const [cost, setCost] = useState(25);
  const [price, setPrice] = useState(79);
  const margin = price - cost;
  const marginPercentage = price > 0 ? Math.round((margin / price) * 100) : 0;

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

    const element = document.getElementById('margin-calculator');
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
    <section id="margin-calculator" className="py-24 bg-[#F5F5F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'bg-white rounded-[32px] p-12 border border-[#F2F2F2] shadow-sm',
            'transition-all duration-500',
            'hover:shadow-lg',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center">
              <Calculator className="w-7 h-7 text-[#FF9500]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#000000]">
                Calculateur de marge
              </h2>
              <p className="text-sm text-[#6e6e73] font-normal mt-1">
                Calculez rapidement votre marge bénéficiaire
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-3">
                Prix de revient
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="flex-1 px-4 py-3 bg-[#F5F5F7] rounded-xl border border-[#E5E5E7] text-[#000000] font-bold text-lg focus:outline-none focus:border-[#007AFF] transition-colors"
                />
                <span className="text-lg font-bold text-[#000000]">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-3">
                Prix de vente
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="flex-1 px-4 py-3 bg-[#F5F5F7] rounded-xl border border-[#E5E5E7] text-[#000000] font-bold text-lg focus:outline-none focus:border-[#007AFF] transition-colors"
                />
                <span className="text-lg font-bold text-[#000000]">€</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E5E5E7]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-[#6e6e73] font-normal mb-1">Marge</div>
                <div className="text-3xl font-bold text-[#000000]">
                  {margin.toFixed(2)} €
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#6e6e73] font-normal mb-1">Marge %</div>
                <div className="text-3xl font-bold text-[#000000]">
                  {marginPercentage}%
                </div>
              </div>
            </div>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#000000] text-white rounded-full font-medium hover:bg-[#1a1a1a] transition-all duration-200 group"
            >
              Calculer en détail
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
