'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { FASHION_STYLES } from '@/lib/constants/fashion-styles';

interface BrandIdentityStep1Props {
  concept: string;
  setConcept: (value: string) => void;
  style: string;
  setStyle: (value: string) => void;
  target: string;
  setTarget: (value: string) => void;
  onNext: () => void;
}

export function BrandIdentityStep1({
  concept,
  setConcept,
  style,
  setStyle,
  target,
  setTarget,
  onNext,
}: BrandIdentityStep1Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          Concept de votre marque *
        </label>
        <Input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Ex: Streetwear minimaliste pour jeunes urbains"
          className="border-2"
        />
        <p className="text-xs text-muted-foreground font-medium">
          Décrivez votre marque en quelques mots. L'IA utilisera cette description pour générer votre identité.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Style (optionnel)
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full h-11 px-4 py-2.5 text-sm bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          >
            <option value="">Sélectionnez un style</option>
            {FASHION_STYLES.map((style) => (
              <option key={style} value={style.toLowerCase()}>
                {style}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Public cible (optionnel)
          </label>
          <Input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Ex: Jeunes 18-30 ans"
            className="border-2"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!concept.trim()}
          className="shadow-modern-lg"
        >
          Générer avec IA
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
