'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, CheckCircle2, Palette, Type } from 'lucide-react';
import { BrandIdentityStep1 } from './BrandIdentityStep1';
import { BrandIdentityStep2 } from './BrandIdentityStep2';
import { BrandIdentityStep3 } from './BrandIdentityStep3';

interface GeneratedIdentity {
  names: string[];
  logos: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    heading: string;
    body: string;
  };
}

export function BrandIdentityWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Étape 1 : Concept
  const [concept, setConcept] = useState('');
  const [style, setStyle] = useState('');
  const [target, setTarget] = useState('');

  // Étape 2 : Génération
  const [generatedIdentity, setGeneratedIdentity] = useState<GeneratedIdentity | null>(null);

  // Étape 3 : Sélection
  const [selectedName, setSelectedName] = useState('');
  const [selectedLogo, setSelectedLogo] = useState('');
  const [selectedColors, setSelectedColors] = useState<{
    primary: string;
    secondary: string;
    accent: string;
  } | null>(null);
  const [selectedTypography, setSelectedTypography] = useState<{
    heading: string;
    body: string;
  } | null>(null);

  const handleStep1Next = () => {
    if (!concept.trim()) {
      setError('Veuillez décrire votre concept de marque');
      return;
    }
    setError(null);
    setCurrentStep(2);
    handleGenerate();
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/brands/generate-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: concept.trim(),
          style: style || undefined,
          target: target || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la génération');
        setLoading(false);
        return;
      }

      setGeneratedIdentity(data);
      
      // Pré-sélectionner les premiers éléments
      if (data.names && data.names.length > 0) {
        setSelectedName(data.names[0]);
      }
      if (data.logos && data.logos.length > 0) {
        setSelectedLogo(data.logos[0]);
      }
      if (data.colorPalette) {
        setSelectedColors(data.colorPalette);
      }
      if (data.typography) {
        setSelectedTypography(data.typography);
      }

      setCurrentStep(3);
    } catch (err: any) {
      setError('Une erreur est survenue lors de la génération');
      console.error('Error generating identity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!selectedName) {
      setError('Veuillez sélectionner un nom de marque');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Créer la marque avec l'identité
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedName,
          logo: selectedLogo || null,
          logoVariations: selectedLogo ? { main: selectedLogo } : null,
          colorPalette: selectedColors,
          typography: selectedTypography,
          creationMode: 'quick',
          autoApplyIdentity: true,
          status: 'in_progress',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création de la marque');
        setLoading(false);
        return;
      }

      // Rediriger vers Launch Map
      router.push('/launch-map');
    } catch (err: any) {
      setError('Une erreur est survenue lors de la création');
      console.error('Error creating brand:', err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep > step
                  ? 'bg-primary text-primary-foreground'
                  : currentStep === step
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {currentStep > step ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 transition-all ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">
            {currentStep === 1 && 'Étape 1/3 : Concept de votre marque'}
            {currentStep === 2 && 'Étape 2/3 : Génération avec IA'}
            {currentStep === 3 && 'Étape 3/3 : Sélection et personnalisation'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Décrivez votre concept en quelques mots'}
            {currentStep === 2 && 'L\'IA génère votre identité de marque'}
            {currentStep === 3 && 'Choisissez et personnalisez les éléments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Étape 1 : Concept */}
          {currentStep === 1 && (
            <BrandIdentityStep1
              concept={concept}
              setConcept={setConcept}
              style={style}
              setStyle={setStyle}
              target={target}
              setTarget={setTarget}
              onNext={handleStep1Next}
            />
          )}

          {/* Étape 2 : Génération */}
          {currentStep === 2 && (
            <BrandIdentityStep2 loading={loading} />
          )}

          {/* Étape 3 : Sélection */}
          {currentStep === 3 && generatedIdentity && (
            <BrandIdentityStep3
              generatedIdentity={generatedIdentity}
              selectedName={selectedName}
              setSelectedName={setSelectedName}
              selectedLogo={selectedLogo}
              setSelectedLogo={setSelectedLogo}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedTypography={selectedTypography}
              setSelectedTypography={setSelectedTypography}
              onSubmit={handleStep3Submit}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error/10 border-2 border-error/20 rounded-lg">
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      {/* Navigation */}
      {currentStep > 1 && currentStep < 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="border-2"
          >
            ← Retour
          </Button>
        </div>
      )}
    </div>
  );
}
