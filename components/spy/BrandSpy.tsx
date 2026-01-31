'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from './AnalysisResult';
import { AnalysisHistory } from './AnalysisHistory';
import { BrandComparison } from './BrandComparison';

interface Analysis {
  id: string;
  shopifyUrl: string;
  estimatedRevenue?: number | null;
  estimatedMonthlyRevenue?: number | null;
  stack: any;
  theme: string | null;
  adStrategy: any;
  createdAt: Date;
}

interface BrandSpyProps {
  userId: string;
  analyses: Analysis[];
}

export function BrandSpy({ userId, analyses }: BrandSpyProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Veuillez saisir une URL Shopify');
      return;
    }

    // Validation basique de l'URL
    try {
      new URL(url); // Vérifier que l'URL est valide
      // La validation Shopify se fera côté serveur
    } catch {
      setError('URL invalide');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setCurrentAnalysis(null);

    try {
      const response = await fetch('/api/spy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      setCurrentAnalysis(data.analysis);
      setUrl(''); // Réinitialiser le champ
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulaire de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Analyser une marque
          </CardTitle>
          <CardDescription>
            Saisissez l'URL d'une boutique Shopify pour découvrir leur stratégie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://exemple.myshopify.com ou https://exemple.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button
              onClick={handleAnalyze}
              variant="default"
              disabled={isAnalyzing || !url.trim()}
            >
              {isAnalyzing ? 'Analyse...' : 'Analyser'}
            </Button>
          </div>

          {error && (
            <div className="p-4 text-sm text-error bg-error/10 border-2 border-error/20 rounded-lg font-medium">
              {error}
            </div>
          )}

          {analyses.length > 0 && (
            <div className="pt-4 border-t-2 border-border flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowHistory(!showHistory);
                  setShowComparison(false);
                }}
                className="border-2"
              >
                {showHistory ? 'Masquer' : 'Afficher'} l'historique ({analyses.length})
              </Button>
              {analyses.length >= 2 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowComparison(!showComparison);
                    setShowHistory(false);
                  }}
                  className="border-2"
                >
                  {showComparison ? 'Masquer' : 'Comparer'} les marques
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique */}
      {showHistory && analyses.length > 0 && (
        <AnalysisHistory analyses={analyses} />
      )}

      {/* Comparaison */}
      {showComparison && analyses.length >= 2 && (
        <BrandComparison userId={userId} />
      )}

      {/* Résultat de l'analyse */}
      {currentAnalysis && (
        <AnalysisResult 
          analysis={currentAnalysis} 
          onBack={() => setCurrentAnalysis(null)}
        />
      )}
    </div>
  );
}
