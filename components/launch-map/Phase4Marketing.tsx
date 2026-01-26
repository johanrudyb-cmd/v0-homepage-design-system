'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Phase4MarketingProps {
  brandId: string;
  onComplete: () => void;
  isCompleted: boolean;
}

export function Phase4Marketing({ brandId, onComplete, isCompleted }: Phase4MarketingProps) {
  const [scriptsCount, setScriptsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkScripts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/ugc/scripts?brandId=${brandId}`);
        if (response.ok) {
          const data = await response.json();
          const count = data.count || 0;
          setScriptsCount(count);
          if (count >= 5 && !isCompleted) {
            onComplete(); // Marquer la phase comme complétée si 5 scripts existent
          }
        }
      } catch (error) {
        console.error('Error checking scripts:', error);
      } finally {
        setLoading(false);
      }
    };

    checkScripts();
  }, [brandId, onComplete, isCompleted]);

  if (loading) {
    return (
      <div className="text-stone-700 font-light">Chargement de l'état des scripts...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-stone-700 font-light">
        <p className="mb-4">
          Pour valider cette phase, vous devez générer 5 scripts de clips UGC avec l'IA.
        </p>
        <p className="text-sm text-stone-600">
          Vous avez actuellement généré {scriptsCount} script(s).
        </p>
        <p className="text-sm text-stone-600 mt-2">
          Les scripts UGC incluent :
        </p>
        <ul className="list-disc list-inside text-sm text-stone-600 mt-2 space-y-1">
          <li>Structure : Problème → Solution → Preuve → CTA</li>
          <li>Format optimisé pour TikTok et Instagram (15 secondes)</li>
          <li>Hooks viraux du moment</li>
        </ul>
      </div>

      {scriptsCount >= 5 ? (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ {scriptsCount} scripts générés ! Cette phase est validée.
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/ugc">
            <Button className="bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-3 px-6">
              Accéder au UGC AI Lab
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
