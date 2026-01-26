'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface AnalyzeBrandButtonProps {
  shopifyUrl: string;
  brandName: string;
}

export function AnalyzeBrandButton({ shopifyUrl, brandName }: AnalyzeBrandButtonProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/spy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: shopifyUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      // Rediriger vers la page de détail de l'analyse
      router.push(`/spy/${data.analysis.id}`);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1">
      <Button
        variant="outline"
        className="w-full border-2"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
      >
        <Search className="w-4 h-4 mr-2" />
        {isAnalyzing ? 'Analyse...' : 'Analyser'}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-error font-medium">{error}</p>
      )}
    </div>
  );
}
