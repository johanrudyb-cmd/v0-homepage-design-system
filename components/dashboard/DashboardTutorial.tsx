'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Compass } from 'lucide-react';

function getTutorialDone(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

const TUTORIAL_STEPS: { target: string; title: string; body: string }[] = [
  { target: 'tour-dashboard', title: 'Dashboard', body: 'Vue d\'ensemble de votre activité : stats, parcours et accès rapide aux outils.' },
  { target: 'tour-trends', title: 'Tendances de la semaine', body: 'Les nouveautés chaque semaine pour rester inspiré.' },
  { target: 'tour-brands', title: 'Marques tendances', body: 'Découvrez les marques les plus tendances du moment.' },
  { target: 'tour-spy', title: 'Analyseur de tendances', body: 'Analysez les tendances et prévisions avec l\'IA.' },
  { target: 'tour-analyze-brand', title: 'Analyse de marque', body: 'Analyse IA par recherche : marketing et opportunités.' },
  { target: 'tour-design-studio', title: 'Design Studio', body: 'Créez vos tech packs et designs avec l\'IA.' },
  { target: 'tour-ugc', title: 'UGC Lab', body: 'Générez vos contenus marketing et scripts UGC avec l\'IA.' },
  { target: 'tour-launch-map', title: 'Gérer ma marque', body: 'Guide complet de lancement : stratégie, identité, design, sourcing, marketing.' },
  { target: 'tour-dashboard-content', title: 'Contenu principal', body: 'Ici : votre parcours vers la première vente, statistiques et accès rapide aux outils.' },
];

const STORAGE_KEY = 'dashboard_tutorial_done';

export function DashboardTutorial() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [skipRender, setSkipRender] = useState(false);

  useEffect(() => {
    if (getTutorialDone()) {
      router.replace('/dashboard');
      setSkipRender(true);
    }
  }, [router]);

  const currentStep = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  const updateTargetRect = useCallback(() => {
    if (typeof document === 'undefined' || !currentStep) return;
    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !currentStep) return;
    updateTargetRect();
    const resizeObserver = new ResizeObserver(updateTargetRect);
    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (el) resizeObserver.observe(el);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [mounted, step, currentStep, updateTargetRect]);

  const handleNext = () => {
    if (isLast) {
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch (_) {}
      router.replace('/dashboard');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (_) {}
    router.replace('/dashboard');
  };

  if (skipRender || !mounted || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none [&>*]:pointer-events-auto">
      {/* Fond sombre */}
      <div className="absolute inset-0 bg-black/95 transition-opacity" aria-hidden />
      {/* Anneau de focus autour de la cible */}
      {targetRect && (
        <div
          className="absolute border-2 border-primary rounded-xl ring-4 ring-primary/30 pointer-events-none transition-all duration-200"
          style={{
            left: Math.max(0, targetRect.left - 4),
            top: Math.max(0, targetRect.top - 4),
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}
      {/* Tooltip fixe en bas au centre */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <div className="bg-card border-2 border-primary rounded-xl shadow-modern-lg p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Compass className="w-5 h-5 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wide">Visite guidée</span>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={handleSkip} aria-label="Passer">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStep.body}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {step + 1} / {TUTORIAL_STEPS.length}
            </span>
            <Button onClick={handleNext} className="gap-2">
              {isLast ? 'Terminer' : 'Suivant'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function shouldShowTutorial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}
