'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ScriptGeneratorProps {
  brandId: string;
  brandName: string;
}

export function ScriptGenerator({ brandId, brandName }: ScriptGeneratorProps) {
  const [productDescription, setProductDescription] = useState('');
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scripts, setScripts] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!productDescription.trim()) {
      setError('Veuillez décrire votre produit');
      return;
    }

    setIsGenerating(true);
    setError('');
    setScripts([]);

    try {
      const response = await fetch('/api/ugc/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          brandName,
          productDescription,
          count,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setScripts(data.scripts || []);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (script: string) => {
    navigator.clipboard.writeText(script);
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="text-xl font-light tracking-wide">
            Script Generator
          </CardTitle>
          <CardDescription className="font-light">
            Générez des scripts UGC viraux de 15 secondes pour TikTok et Instagram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Description du produit *
            </label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Ex: Hoodie oversized en coton 400GSM, coupe streetwear, logo brodé..."
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[100px]"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Nombre de scripts à générer
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 5)}
              disabled={isGenerating}
            />
            <div className="text-xs text-stone-500 mt-1 font-light">
              Maximum 10 scripts par génération
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !productDescription.trim()}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-3"
          >
            {isGenerating ? 'Génération en cours...' : `Générer ${count} script${count > 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {scripts.length > 0 && (
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-xl font-light tracking-wide">
              Scripts générés ({scripts.length})
            </CardTitle>
            <CardDescription className="font-light">
              Structure : Problème → Solution → Preuve → CTA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scripts.map((script, index) => (
              <div
                key={index}
                className="border border-stone-200 rounded-lg p-4 bg-stone-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-stone-500 font-light">
                    Script {index + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(script)}
                    className="border-stone-300 text-stone-700 font-light text-xs py-1 px-3"
                  >
                    Copier
                  </Button>
                </div>
                <p className="text-sm text-stone-900 font-light whitespace-pre-wrap">
                  {script}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
