'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from './AnalysisResult';
import { AnalysisHistory } from './AnalysisHistory';

interface Analysis {
  id: string;
  shopifyUrl: string;
  estimatedRevenue: number | null;
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

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Veuillez saisir une URL Shopify');
      return;
    }

    // Validation basique de l'URL
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('myshopify.com') && !urlObj.hostname.includes('shopify')) {
        setError('Veuillez saisir une URL Shopify valide');
        return;
      }
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
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Analyser une marque
          </CardTitle>
          <CardDescription className="font-medium">
            Saisissez l'URL d'une boutique Shopify pour obtenir une analyse complète
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
              className="shadow-modern"
              disabled={isAnalyzing || !url.trim()}
            >
              {isAnalyzing ? 'Analyse en cours...' : 'Analyser'}
            </Button>
          </div>

          {error && (
            <div className="p-4 text-sm text-error bg-error/10 border-2 border-error/20 rounded-lg font-medium">
              {error}
            </div>
          )}

          {analyses.length > 0 && (
            <div className="pt-4 border-t-2 border-border">
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="border-2"
              >
                {showHistory ? 'Masquer' : 'Afficher'} l'historique ({analyses.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique */}
      {showHistory && analyses.length > 0 && (
        <AnalysisHistory analyses={analyses} />
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
