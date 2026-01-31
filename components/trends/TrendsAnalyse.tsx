'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { TrendsSubNav } from './TrendsSubNav';

interface TrendsAnalyseProps {
  userId: string;
}

export function TrendsAnalyse({ userId }: TrendsAnalyseProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gptTest, setGptTest] = useState<{ ok: boolean; message?: string } | null>(null);
  const [gptTestLoading, setGptTestLoading] = useState(false);

  const loadAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trends/analyse-ia');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'analyse');
      setAnalysis(data.analysis || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const testGptConnection = async () => {
    setGptTestLoading(true);
    setGptTest(null);
    try {
      const res = await fetch('/api/health/gpt');
      const data = await res.json();
      if (res.ok) setGptTest({ ok: true, message: data.message ?? 'API GPT opérationnelle' });
      else setGptTest({ ok: false, message: data.error ?? 'Erreur' });
    } catch (e) {
      setGptTest({ ok: false, message: e instanceof Error ? e.message : 'Erreur réseau' });
    } finally {
      setGptTestLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TrendsSubNav active="rapport" />
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Génération de l&apos;analyse IA en cours…</p>
            <p className="text-sm text-muted-foreground">Prévisions France, tendances à venir, recommandations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <TrendsSubNav active="rapport" />
        <Card className="border-destructive/50">
          <CardContent className="py-8">
            <p className="text-destructive font-medium">Erreur</p>
            <p className="text-muted-foreground mt-1">{error}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={testGptConnection} variant="outline" size="sm" disabled={gptTestLoading} title="Vérifier que la clé API GPT est configurée">
                {gptTestLoading ? 'Test…' : 'Tester l\'API GPT'}
              </Button>
              {gptTest && (
                <span className={`text-xs px-2 py-1 rounded self-center ${gptTest.ok ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                  {gptTest.ok ? gptTest.message : gptTest.message}
                </span>
              )}
              <Button onClick={loadAnalysis} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TrendsSubNav active="rapport" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7" />
            Rapport IA
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            Synthèse texte des tendances : prévisions France, tendances à venir, recommandations. Généré par l’IA à partir des données du classement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 items-center">
          <Button variant="outline" size="sm" className="gap-2" onClick={testGptConnection} disabled={gptTestLoading} title="Vérifier que la clé API GPT est configurée et répond">
            {gptTestLoading ? 'Test…' : 'Tester l\'API GPT'}
          </Button>
          {gptTest && (
            <span className={`text-xs px-2 py-1 rounded ${gptTest.ok ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
              {gptTest.ok ? gptTest.message : gptTest.message}
            </span>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={loadAnalysis}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapport d&apos;analyse IA</CardTitle>
          <CardDescription>
            Synthèse des tendances, prévisions pour la France et pistes d&apos;action générées par l&apos;IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-semibold">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">{analysis ?? ''}</div>
          </div>
          {analysis && (
            <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
              <p>
                Analyse générée à partir des tendances confirmées et des statistiques par pays, style et type de
                produit. Pour des prévisions détaillées par phase (émergence, croissance, pic), utilisez la page
                <Link href="/trends/predictions" className="mx-1 underline hover:text-foreground">
                  Prédictions IA
                </Link>
                .
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
