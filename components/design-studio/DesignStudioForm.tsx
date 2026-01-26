'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DesignResult } from './DesignResult';
import { DesignGallery } from './DesignGallery';

interface Design {
  id: string;
  type: string;
  cut: string | null;
  material: string | null;
  flatSketchUrl: string | null;
  techPack: any;
  prompt: string | null;
  status: string;
  createdAt: Date;
}

interface DesignStudioFormProps {
  brandId: string;
  existingDesigns: Design[];
}

export function DesignStudioForm({ brandId, existingDesigns }: DesignStudioFormProps) {
  const [type, setType] = useState('');
  const [cut, setCut] = useState('');
  const [material, setMaterial] = useState('');
  const [details, setDetails] = useState({
    seams: false,
    pockets: false,
    zipper: false,
    buttons: false,
    hood: false,
    collar: false,
  });
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!type || !cut || !material) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);
    setError('');
    setCurrentDesign(null);

    try {
      const response = await fetch('/api/designs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          type,
          cut,
          material,
          details,
          customPrompt: customPrompt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setCurrentDesign(data.design);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulaire */}
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Créer un nouveau design
            </CardTitle>
            <CardDescription className="font-medium">
              Remplissez les informations pour générer votre Tech Pack
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type de vêtement */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Type de vêtement *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isGenerating}
              >
                <option value="">Sélectionner...</option>
                <option value="T-shirt">T-shirt</option>
                <option value="Hoodie">Hoodie</option>
                <option value="Sweatshirt">Sweatshirt</option>
                <option value="Pantalon">Pantalon</option>
                <option value="Cargo">Cargo</option>
                <option value="Short">Short</option>
                <option value="Veste">Veste</option>
              </select>
            </div>

            {/* Coupe */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Coupe *
              </label>
              <select
                value={cut}
                onChange={(e) => setCut(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isGenerating}
              >
                <option value="">Sélectionner...</option>
                <option value="oversized">Oversized</option>
                <option value="slim">Slim</option>
                <option value="regular">Regular</option>
                <option value="relaxed">Relaxed</option>
                <option value="fitted">Fitted</option>
              </select>
            </div>

            {/* Matière */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Matière principale *
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isGenerating}
              >
                <option value="">Sélectionner...</option>
                <option value="Coton 300GSM">Coton 300GSM</option>
                <option value="Coton 400GSM">Coton 400GSM</option>
                <option value="Coton 500GSM">Coton 500GSM</option>
                <option value="Denim">Denim</option>
                <option value="Polyester">Polyester</option>
                <option value="Coton/Polyester mix">Coton/Polyester mix</option>
                <option value="Jersey">Jersey</option>
              </select>
            </div>

            {/* Détails */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Détails
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(details).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 border-input hover:bg-muted hover:border-primary/50 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setDetails({ ...details, [key]: e.target.checked })
                      }
                      disabled={isGenerating}
                      className="rounded border-2 border-input text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="text-sm text-foreground font-medium capitalize">
                      {key === 'seams' ? 'Coutures' : key === 'pockets' ? 'Poches' : key === 'zipper' ? 'Fermeture éclair' : key === 'buttons' ? 'Boutons' : key === 'hood' ? 'Capuche' : 'Col'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prompt personnalisé (optionnel) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Prompt personnalisé (optionnel)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ajoutez des détails supplémentaires pour votre design..."
                className="w-full px-4 py-3 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] placeholder:text-muted-foreground/60"
                disabled={isGenerating}
              />
            </div>

            {error && (
              <div className="p-4 text-sm text-error bg-error/10 border-2 border-error/20 rounded-lg font-medium">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !type || !cut || !material}
              className="w-full shadow-modern-lg"
              variant="default"
            >
              {isGenerating ? 'Génération en cours...' : 'Générer le Tech Pack'}
            </Button>
          </CardContent>
        </Card>

        {/* Résultat */}
        {currentDesign && (
          <DesignResult design={currentDesign} />
        )}
      </div>

      {/* Galerie des designs existants */}
      <div>
        <DesignGallery designs={existingDesigns} />
      </div>
    </div>
  );
}
