'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface ProductDetailRecommendationsProps {
  productId: string;
  productName: string;
  initialAnalysis: string | null;
}

async function fetchAnalysis(productId: string): Promise<{ analysis: string | null; error?: string }> {
  const res = await fetch('/api/trends/hybrid-radar/business-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  const data = await res.json();
  if (!res.ok) return { analysis: null, error: data.error || 'Erreur' };
  return { analysis: data.businessAnalysis ?? null };
}

export function ProductDetailRecommendations({
  productId,
  productName,
  initialAnalysis,
}: ProductDetailRecommendationsProps) {
  const [analysis, setAnalysis] = useState<string | null>(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasAutoFetched = useRef(false);

  const load = async () => {
    setLoading(true);
    setError('');
    const { analysis: a, error: e } = await fetchAnalysis(productId);
    setAnalysis(a);
    setError(e ?? '');
    setLoading(false);
  };

  // Synchroniser avec les props quand on change de produit
  useEffect(() => {
    setAnalysis(initialAnalysis);
    setError('');
    hasAutoFetched.current = false;
  }, [productId, initialAnalysis]);

  // Affichage direct : si pas d'analyse en base, génération automatique au chargement
  useEffect(() => {
    const hasAnalysis = analysis != null && analysis.trim() !== '';
    if (!hasAnalysis && !hasAutoFetched.current) {
      hasAutoFetched.current = true;
      load();
    }
  }, [productId, analysis]);

  const handleRegenerate = () => {
    hasAutoFetched.current = true;
    load();
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Recommandations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyse business et recommandations pour développer ton article ou ton offre sur ce vêtement.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !analysis ? (
          <div className="rounded-lg bg-muted/50 border p-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Chargement des recommandations…</span>
          </div>
        ) : analysis ? (
          <div className="rounded-lg bg-background border p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground italic">
            {error === 'CHATGPT_API_KEY requise.' || error.includes('requise pour') || error.includes('503')
              ? 'Recommandations non disponibles (configuration API manquante).'
              : `Impossible de charger les recommandations : ${error}`}
          </p>
        ) : null}
        {analysis && (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Régénérer les recommandations
          </button>
        )}
      </CardContent>
    </Card>
  );
}
