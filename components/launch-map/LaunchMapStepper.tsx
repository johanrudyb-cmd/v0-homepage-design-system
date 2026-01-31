'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phase0Identity } from './Phase0Identity';
import { Phase1Calculator } from './Phase1Calculator';
import { Phase2Design } from './Phase2Design';
import { Phase3Sourcing } from './Phase3Sourcing';
import { Phase4Marketing } from './Phase4Marketing';
import Link from 'next/link';

interface LaunchMapData {
  id: string;
  phase1: boolean;
  phase2: boolean;
  phase3: boolean;
  phase4: boolean;
  phase1Data: any;
}

interface Brand {
  id: string;
  name: string;
  logo?: string | null;
  colorPalette?: any;
}

interface LaunchMapStepperProps {
  brandId: string;
  launchMap: LaunchMapData | null;
  brand?: Brand;
  hasIdentity?: boolean;
}

const phases = [
  {
    id: 0,
    title: 'Identité',
    subtitle: 'Créez votre identité de marque',
    description: 'Nom, logo et identité visuelle de votre marque',
  },
  {
    id: 1,
    title: 'Fondations',
    subtitle: 'Calculateur de rentabilité',
    description: 'Calculez votre marge nette et validez la viabilité de votre projet',
  },
  {
    id: 2,
    title: 'Design',
    subtitle: 'Validation du Tech Pack',
    description: 'Créez votre premier design avec le Design Studio IA',
  },
  {
    id: 3,
    title: 'Sourcing',
    subtitle: 'Demande de devis',
    description: 'Contactez au moins 2 usines du Hub pour obtenir des devis',
  },
  {
    id: 4,
    title: 'Go-to-Market',
    subtitle: 'Génération scripts UGC',
    description: 'Générez vos 5 premiers scripts de clips UGC avec l\'IA',
  },
];

export function LaunchMapStepper({ brandId, launchMap, brand, hasIdentity = false }: LaunchMapStepperProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState({
    phase0: hasIdentity, // Phase 0 = identité complétée
    phase1: launchMap?.phase1 || false,
    phase2: launchMap?.phase2 || false,
    phase3: launchMap?.phase3 || false,
    phase4: launchMap?.phase4 || false,
  });

  // Déterminer la phase actuelle (première non complétée)
  useEffect(() => {
    if (!progress.phase0) setCurrentPhase(0);
    else if (!progress.phase1) setCurrentPhase(1);
    else if (!progress.phase2) setCurrentPhase(2);
    else if (!progress.phase3) setCurrentPhase(3);
    else if (!progress.phase4) setCurrentPhase(4);
    else setCurrentPhase(4); // Toutes complétées, afficher la dernière
  }, [progress]);

  const completedPhases = Object.values(progress).filter(Boolean).length;
  const progressPercentage = (completedPhases / 5) * 100;

  const handlePhaseComplete = (phase: number) => {
    setProgress((prev) => ({
      ...prev,
      [`phase${phase}`]: true,
    }));
    
    // Passer à la phase suivante si disponible
    if (phase < 4) {
      setTimeout(() => setCurrentPhase(phase + 1), 500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Barre de progression */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Progression globale
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                {completedPhases} sur 5 phases complétées
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="gradient-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stepper visuel */}
      <div className="grid grid-cols-5 gap-4">
        {phases.map((phase, index) => {
          const isCompleted = progress[`phase${phase.id}` as keyof typeof progress];
          const isCurrent = currentPhase === phase.id;
          const isAccessible = phase.id === 0 || progress[`phase${phase.id - 1}` as keyof typeof progress];

          return (
            <button
              key={phase.id}
              onClick={() => isAccessible && setCurrentPhase(phase.id)}
              disabled={!isAccessible}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isCurrent
                  ? 'border-primary bg-primary/10 shadow-modern'
                  : isCompleted
                  ? 'border-success bg-success/10'
                  : isAccessible
                  ? 'border-border bg-card hover:border-primary/50 hover:shadow-modern'
                  : 'border-border bg-muted opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isCompleted
                      ? 'gradient-primary text-white shadow-modern'
                      : isCurrent
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? '✓' : phase.id}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-foreground">
                    {phase.title}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {phase.subtitle}
                  </div>
                </div>
              </div>
              {index < phases.length - 1 && (
                <div
                  className={`absolute top-1/2 -right-2 w-4 h-0.5 ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Contenu de la phase actuelle */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Phase {currentPhase === 0 ? '0' : currentPhase} : {phases.find(p => p.id === currentPhase)?.title || 'Identité'}
          </CardTitle>
          <CardDescription className="font-medium">
            {phases.find(p => p.id === currentPhase)?.description || 'Créez l\'identité de votre marque'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPhase === 0 && (
            <Phase0Identity
              brandId={brandId}
              onComplete={() => {
                setProgress((prev) => ({ ...prev, phase0: true }));
                setCurrentPhase(1);
              }}
            />
          )}
          {currentPhase === 1 && (
            <Phase1Calculator
              brandId={brandId}
              initialData={launchMap?.phase1Data}
              onComplete={() => handlePhaseComplete(1)}
            />
          )}
          {currentPhase === 2 && (
            <Phase2Design
              brandId={brandId}
              onComplete={() => handlePhaseComplete(2)}
            />
          )}
          {currentPhase === 3 && (
            <Phase3Sourcing
              brandId={brandId}
              onComplete={() => handlePhaseComplete(3)}
            />
          )}
          {currentPhase === 4 && (
            <Phase4Marketing
              brandId={brandId}
              onComplete={() => handlePhaseComplete(4)}
              isCompleted={progress.phase4}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
