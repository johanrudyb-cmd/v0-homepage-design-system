'use client';

import { useEffect, useState } from 'react';
import { UGCLab } from '@/components/ugc/UGCLab';

interface Phase4MarketingProps {
  brandId: string;
  brandName: string;
  brand?: { id: string; name: string; logo?: string | null; colorPalette?: unknown; typography?: unknown; styleGuide?: unknown } | null;
  onComplete?: () => void;
  isCompleted: boolean;
  userPlan?: string;
}

interface DesignItem {
  id: string;
  type: string;
  flatSketchUrl: string | null;
}

export function Phase4Marketing({ brandId, brandName, brand, onComplete, isCompleted, userPlan = 'free' }: Phase4MarketingProps) {
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [scriptsCount, setScriptsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Phase 5 validée quand au moins un post structuré est planifié dans le calendrier
  useEffect(() => {
    const checkStructuredPosts = async () => {
      try {
        const response = await fetch(`/api/launch-map/calendar?brandId=${encodeURIComponent(brandId)}`);
        if (response.ok) {
          const data = await response.json();
          const events = Array.isArray(data.events) ? data.events : [];
          const structuredCount = events.filter(
            (ev: { type?: string; structuredContent?: unknown }) =>
              ev.type === 'content' && ev.structuredContent && typeof ev.structuredContent === 'object'
          ).length;
          setScriptsCount(structuredCount);
          if (structuredCount >= 1 && !isCompleted) {
            if (onComplete) onComplete();
          }
        }
      } catch (error) {
        console.error('Error checking calendar structured posts:', error);
      }
    };

    checkStructuredPosts();
    const interval = setInterval(checkStructuredPosts, 10000);
    return () => clearInterval(interval);
  }, [brandId, onComplete, isCompleted]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/designs?brandId=${encodeURIComponent(brandId)}`)
      .then((res) => (res.ok ? res.json() : { designs: [] }))
      .then((data) => {
        if (cancelled) return;
        const list = (data.designs || []).slice(0, 10).map((d: { id: string; type: string; flatSketchUrl?: string | null }) => ({
          id: d.id,
          type: d.type,
          flatSketchUrl: d.flatSketchUrl ?? null,
        }));
        setDesigns(list);
      })
      .catch(() => {
        if (!cancelled) setDesigns([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [brandId]);

  if (loading && designs.length === 0) {
    return (
      <div className="text-stone-700 font-light">Chargement...</div>
    );
  }

  return (
    <div className="space-y-6">
      {scriptsCount >= 1 && !isCompleted && (
        <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
          ✅ Post structuré planifié dans le calendrier — cette phase est validée.
        </div>
      )}
      <UGCLab
        brandId={brandId}
        brandName={brandName}
        designs={designs}
        brand={brand || undefined}
        userPlan={userPlan}
      />
    </div>
  );
}
