'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Upload, TrendingUp, ImageIcon, FileText, Building2, Check, RefreshCw, Copy, ArrowLeft, X, History, Download } from 'lucide-react';
import type { BrandIdentity } from './LaunchMapStepper';
import { getViewAngleForPlacement, type MockupQuestionnaireAnswers } from '@/lib/mockup-and-techpack-types';
import { PreviewWatermark } from '@/components/ui/preview-watermark';
import { GenerationLoadingPopup } from '@/components/ui/generation-loading-popup';
import { GenerationCostBadge } from '@/components/ui/generation-cost-badge';
import { cn } from '@/lib/utils';
import { getRecommendedGarmentColors } from '@/lib/constants/garment-colors-by-audience';

const PRODUCT_TYPES = [
  { id: 'tshirt', label: 'T-shirt', apiLabel: 'T-shirt' },
  { id: 'hoodie', label: 'Hoodie', apiLabel: 'Hoodie' },
  { id: 'veste', label: 'Veste', apiLabel: 'Veste' },
  { id: 'pantalon', label: 'Pantalon', apiLabel: 'Pantalon' },
] as const;

const CUTS = ['Regular', 'Oversized', 'Slim', 'Droite', 'Relaxed'];
const NECKLINES = ['Crew (col rond)', 'Col V', 'Col montant', 'Bateau'];
const SLEEVES = ['Sans manches', 'Courtes', 'Manches 3/4', 'Longues'];
/** Grammage selon type de vêtement — cohérence marché (g/m²) */
const WEIGHT_BY_PRODUCT: Record<string, { value: string; label: string; note: string }[]> = {
  tshirt: [
    { value: '140 g/m²', label: '140 g/m²', note: 'Léger, été' },
    { value: '160 g/m²', label: '160 g/m²', note: 'Très courant' },
    { value: '180 g/m²', label: '180 g/m²', note: 'Standard marché' },
    { value: '200 g/m²', label: '200 g/m²', note: 'Qualité premium' },
    { value: '220 g/m²', label: '220 g/m²', note: 'Épais, hiver' },
  ],
  hoodie: [
    { value: '250 g/m²', label: '250 g/m²', note: 'Léger' },
    { value: '280 g/m²', label: '280 g/m²', note: 'Standard' },
    { value: '300 g/m²', label: '300 g/m²', note: 'Très courant marché' },
    { value: '350 g/m²', label: '350 g/m²', note: 'Premium' },
    { value: '400 g/m²', label: '400 g/m²', note: 'Lourd, confort' },
  ],
  veste: [
    { value: '200 g/m²', label: '200 g/m²', note: 'Légère' },
    { value: '250 g/m²', label: '250 g/m²', note: 'Mi-saison' },
    { value: '300 g/m²', label: '300 g/m²', note: 'Standard' },
    { value: '350 g/m²', label: '350 g/m²', note: 'Chaud' },
  ],
  pantalon: [
    { value: '250 g/m²', label: '250 g/m²', note: 'Léger' },
    { value: '300 g/m²', label: '300 g/m²', note: 'Standard' },
    { value: '350 g/m²', label: '350 g/m²', note: 'Jean / durable' },
    { value: '400 g/m²', label: '400 g/m²', note: 'Hiver' },
  ],
};
/** Raccourcis couleur (pastilles rapides) */
const COLOR_PRESETS = ['#1a1a1a', '#ffffff', '#2d2d2d', '#6b7280', '#1e3a5f', '#2563eb', '#b91c1c', '#14532d', '#d6d3c4', '#c19a6b', '#78350f', '#ca8a04', '#c2410c', '#be185d', '#7c3aed'];

function isHexColor(s: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s);
}
function normalizeHex(s: string): string {
  const t = s.replace(/^#/, '').trim();
  if (t.length === 3) return '#' + t.split('').map((c) => c + c).join('');
  if (t.length === 6 && /^[0-9A-Fa-f]+$/.test(t)) return '#' + t;
  return s;
}
/** Emplacements d’impression selon le type de vêtement (sélection multiple). */
const PLACEMENTS_BY_PRODUCT: Record<string, string[]> = {
  tshirt: ['Poitrine (centre)', 'Poitrine (gauche)', 'Dos', 'Dos complet', 'Manche gauche', 'Manche droite', 'Épaule', 'Bas (devant)', 'Bas (dos)'],
  hoodie: ['Poitrine (centre)', 'Poitrine (gauche)', 'Dos', 'Dos complet', 'Capuche (dos)', 'Manche gauche', 'Manche droite', 'Poche kangourou'],
  veste: ['Poitrine (centre)', 'Dos', 'Dos complet', 'Col', 'Manche gauche', 'Manche droite', 'Poche poitrine'],
  pantalon: ['Cuisse (côté)', 'Bas de jambe', 'Poche arrière', 'Ceinture', 'Devant (bas)'],
};
const LOGO_PLACEMENTS = PLACEMENTS_BY_PRODUCT.tshirt; // fallback pour mockup (étape 2)
/** Positions (x, y en %, scale en %) pour composer chaque design sur le mockup selon l’emplacement. */
const PLACEMENT_POSITIONS: Record<string, { x: number; y: number; scale: number }> = {
  'Poitrine (centre)': { x: 50, y: 32, scale: 42 },
  'Poitrine (gauche)': { x: 72, y: 34, scale: 36 },
  Dos: { x: 50, y: 55, scale: 45 },
  'Dos complet': { x: 50, y: 50, scale: 55 },
  'Manche gauche': { x: 18, y: 42, scale: 28 },
  'Manche droite': { x: 82, y: 42, scale: 28 },
  Épaule: { x: 50, y: 22, scale: 25 },
  'Bas (devant)': { x: 50, y: 78, scale: 30 },
  'Bas (dos)': { x: 50, y: 80, scale: 32 },
  'Capuche (dos)': { x: 50, y: 28, scale: 35 },
  'Poche kangourou': { x: 50, y: 48, scale: 28 },
  Col: { x: 50, y: 18, scale: 22 },
  'Poche poitrine': { x: 50, y: 38, scale: 20 },
  'Cuisse (côté)': { x: 35, y: 55, scale: 35 },
  'Bas de jambe': { x: 50, y: 85, scale: 28 },
  'Poche arrière': { x: 50, y: 62, scale: 18 },
  Ceinture: { x: 50, y: 42, scale: 25 },
  'Devant (bas)': { x: 50, y: 75, scale: 30 },
};
const DEFAULT_PLACEMENT_POS = { x: 50, y: 42, scale: 100 };
const SEAMS_OPTIONS = ['Surpiqures classiques', 'Coutures visibles (contrastées)', 'Overlock', 'Finition overlock + surpiqure', 'Coutures cachées', 'Autre (préciser en notes)'];
const PRINT_TECHNIQUES = ['Sérigraphie', 'DTF', 'Broderie', 'Flock', 'Flex', 'Sublimation', 'Transfert', 'Autre'];
const FITS = ['Regular', 'Relaxed', 'Fitted', 'Oversized', 'Slim'];
const TARGET_GENDERS = ['Homme', 'Femme', 'Unisexe', 'Enfant'];

interface LaunchMapData {
  phase1Data?: { productType?: string; weight?: string } | null;
  baseMockupByProductType?: Record<string, string> | null;
}

interface Phase2DesignProps {
  brandId: string;
  brand?: BrandIdentity | null;
  launchMap?: LaunchMapData | null;
  onComplete: () => void;
}

type DesignMode = 'sticker' | 'upload' | 'trend';
/** Source du design sticker : IA seule, logo seul (sans génération), ou logo + cadre IA */
type StickerSource = 'ai' | 'logo_only' | 'logo_plus_ai';

function proxyImageUrl(url: string): string {
  if (typeof window === 'undefined') return url;
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (new URL(url).origin !== window.location.origin) {
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
      }
    }
  } catch {
    // ignore
  }
  return url;
}

export function Phase2Design({ brandId, brand, launchMap, onComplete }: Phase2DesignProps) {
  const router = useRouter();
  const productType = launchMap?.phase1Data?.productType || 'tshirt';
  const productLabel = PRODUCT_TYPES.find((p) => p.id === productType)?.label || 'T-shirt';
  const productApiLabel = PRODUCT_TYPES.find((p) => p.id === productType)?.apiLabel || 'T-shirt';
  const phase1Weight = launchMap?.phase1Data?.weight;

  const [mode, setMode] = useState<DesignMode | null>(null);
  const [designImageUrl, setDesignImageUrl] = useState<string | null>(null);

  const [mockupAnswers, setMockupAnswers] = useState<Partial<MockupQuestionnaireAnswers>>({
    productType: productApiLabel,
    cut: 'Regular',
    material: 'Coton',
    colorMain: '#ffffff',
    neckline: 'Crew (col rond)',
    sleeves: 'Courtes',
    designPlacement: 'Poitrine (centre)',
    colorSpecifics: '',
    seams: '',
    weight: phase1Weight || '180 g/m²',
    length: '',
    hem: 'Droit',
    designTechnique: 'Sérigraphie',
    fit: 'Regular',
    targetGender: '',
    inspiration: '',
    notes: '',
  });
  const [mockupImageUrl, setMockupImageUrl] = useState<string | null>(null);
  /** Un mockup par emplacement (design appliqué sur la base) quand plusieurs emplacements. */
  const [mockupImagesByPlacement, setMockupImagesByPlacement] = useState<Array<{ placement: string; url: string }>>([]);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  /** Sélection multiple des emplacements pour le mockup (reprise de l’étape design, modifiable). */
  const [mockupPlacements, setMockupPlacements] = useState<string[]>(['Poitrine (centre)']);
  const [stickerDescription, setStickerDescription] = useState('');
  const [textByPlacement, setTextByPlacement] = useState<Record<string, string>>({});
  const [garmentColorForDesign, setGarmentColorForDesign] = useState<string>('#ffffff');
  const [designStyleKeywords, setDesignStyleKeywords] = useState('');
  const [designAvoid, setDesignAvoid] = useState('');
  const [designInspiration, setDesignInspiration] = useState('');
  const [stickerSource, setStickerSource] = useState<StickerSource>('ai');
  const [stickerPlacements, setStickerPlacements] = useState<string[]>(['Poitrine (centre)']);
  const [designHistory, setDesignHistory] = useState<Array<{ id: string; imageUrl: string; placement: string | null; source: string | null; createdAt: string }>>([]);
  const [designHistoryLoading, setDesignHistoryLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalImageUrl, setPreviewModalImageUrl] = useState<string | null>(null);
  const [designSet, setDesignSet] = useState<Array<{ placement: string; imageUrl: string; rationale: string }> | null>(null);
  /** Quand on a plusieurs emplacements : clic sur "Choisir dans l'historique" pour cet emplacement → on assigne le draft cliqué à cet emplacement. */
  const [selectingForPlacement, setSelectingForPlacement] = useState<string | null>(null);
  const [mockupModification, setMockupModification] = useState('');

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [placement] = useState({ x: 50, y: 42, scale: 100 });
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [isGeneratingTechPack, setIsGeneratingTechPack] = useState(false);
  const [techPackGenerated, setTechPackGenerated] = useState(false);
  const [productDescription, setProductDescription] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phaseCompleted, setPhaseCompleted] = useState(false);

  const [designStepValidated, setDesignStepValidated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  /** Quand on génère plusieurs designs (1 par 1), indique l’étape en cours pour le loader. */
  const [generatingDesignStep, setGeneratingDesignStep] = useState<{ current: number; total: number; placement: string } | null>(null);
  const [trends, setTrends] = useState<Array<{ productName: string; productType: string; cut?: string | null; material?: string | null; color?: string | null; style?: string | null; imageUrl?: string | null; generatedImageUrl?: string | null }>>([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendGenerating, setTrendGenerating] = useState<string | null>(null);

  const sg = brand?.styleGuide && typeof brand.styleGuide === 'object' ? (brand.styleGuide as Record<string, unknown>) : null;
  const brandStyle = (sg?.preferredStyle as string) || (sg?.positioning as string) || '';
  const brandTargetAudience = (sg?.targetAudience as string) || '';
  const recommendedGarmentColors = getRecommendedGarmentColors(brandTargetAudience, brandStyle);

  const segmentFromCible = (cible: string): 'femme' | 'homme' | 'enfant' | null => {
    if (!cible || typeof cible !== 'string') return null;
    const lower = cible.toLowerCase();
    if (/\bfemme(s)?\b|woman|women|\bfille(s)?\b/.test(lower)) return 'femme';
    if (/\bhomme(s)?\b|man|men|\bgarçon(s)?\b/.test(lower)) return 'homme';
    if (/\benfant(s)?\b|kid(s)?|child|junior/.test(lower)) return 'enfant';
    return null;
  };
  const cibleSegment = segmentFromCible(brandTargetAudience);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const lastSentTextByPlacementRef = useRef<Record<string, string>>({});

  useEffect(() => {
    setMockupAnswers((a) => ({
      ...a,
      productType: productApiLabel,
      ...(phase1Weight && { weight: phase1Weight }),
    }));
  }, [productApiLabel, phase1Weight]);

  useEffect(() => {
    const checkDesign = async () => {
      try {
        const res = await fetch(`/api/designs?brandId=${brandId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.designs?.length > 0) {
            setPhaseCompleted(true);
            onComplete();
          }
        }
      } catch {
        // ignore
      }
    };
    checkDesign();
  }, [brandId, onComplete]);

  const fetchDesignHistory = useCallback(async () => {
    if (!brandId) return;
    setDesignHistoryLoading(true);
    try {
      const res = await fetch(`/api/launch-map/design/history?brandId=${encodeURIComponent(brandId)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.drafts)) setDesignHistory(data.drafts);
    } finally {
      setDesignHistoryLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchDesignHistory();
  }, [fetchDesignHistory]);

  const placementsForProduct = PLACEMENTS_BY_PRODUCT[productType] ?? PLACEMENTS_BY_PRODUCT.tshirt;
  useEffect(() => {
    setStickerPlacements((prev) => {
      const valid = prev.filter((p) => placementsForProduct.includes(p));
      if (valid.length > 0) return valid;
      return [placementsForProduct[0] ?? 'Poitrine (centre)'];
    });
  }, [productType]);

  const toggleStickerPlacement = (p: string) => {
    setStickerPlacements((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const updateMockup = (partial: Partial<MockupQuestionnaireAnswers>) => {
    setMockupAnswers((a) => ({ ...a, ...partial }));
    setError(null);
  };

  /** Image actuelle pour un emplacement (designSet ou designImageUrl si un seul emplacement). */
  const getImageForPlacement = (placement: string): string | null => {
    const fromSet = designSet?.find((d) => d.placement === placement)?.imageUrl;
    if (fromSet) return fromSet;
    if (stickerPlacements.length === 1 && stickerPlacements[0] === placement) return designImageUrl;
    return null;
  };

  /** Assigne un design de l'historique à un emplacement (mode multi-emplacements). */
  const assignHistoryToPlacement = (placement: string, imageUrl: string, draftPlacement: string | null) => {
    const rationale = draftPlacement ? `Provenance : historique (généré pour ${draftPlacement})` : 'Historique';
    const prev = designSet ?? [];
    const arr = prev.filter((d) => d.placement !== placement);
    arr.push({ placement, imageUrl, rationale });
    arr.sort((a, b) => stickerPlacements.indexOf(a.placement) - stickerPlacements.indexOf(b.placement));
    setDesignSet(arr);
    const firstEntry = arr.find((d) => d.placement === stickerPlacements[0]);
    if (firstEntry) setDesignImageUrl(firstEntry.imageUrl);
    setSelectingForPlacement(null);
    setMode('sticker');
  };

  /** Valider le design : enregistrer le design actuel (pour ne pas le perdre), préremplir le mockup (couleur, emplacements), puis afficher l’étape mockup. */
  const handleDownloadDesign = async (d: { id: string; imageUrl: string; placement: string | null }) => {
    try {
      const url = d.imageUrl.startsWith('http') ? proxyImageUrl(d.imageUrl) : (typeof window !== 'undefined' ? `${window.location.origin}${d.imageUrl}` : d.imageUrl);
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `design-${d.placement ? d.placement.replace(/\s+/g, '-') : d.id}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Téléchargement impossible');
    }
  };

  /** Sauvegarder directement le design sans passer par le mockup */
  const handleSaveDesignDirectly = async () => {
    setError(null);

    // Vérifier qu'on a un design
    if (!designImageUrl) {
      setError('Aucun design à sauvegarder. Créez ou importez d\'abord un design.');
      return;
    }

    setIsSaving(true);
    const placementsForMockup = PLACEMENTS_BY_PRODUCT[productType] ?? PLACEMENTS_BY_PRODUCT.tshirt;
    const placementToUse = stickerPlacements.length > 0 && placementsForMockup.includes(stickerPlacements[0]!)
      ? stickerPlacements[0]!
      : placementsForMockup[0] ?? 'Poitrine (centre)';

    try {
      // Sauvegarder le design (upload si blob)
      let finalDesignUrl = designImageUrl;
      if (designImageUrl.startsWith('blob:')) {
        const blob = await fetch(designImageUrl).then((r) => r.blob());
        const formData = new FormData();
        formData.append('file', new File([blob], 'design-actuel.png', { type: 'image/png' }));
        formData.append('brandId', brandId);
        const uploadRes = await fetch('/api/ugc/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) throw new Error('Échec upload du design');
        finalDesignUrl = typeof window !== 'undefined' ? `${window.location.origin}${uploadData.url}` : uploadData.url;

        // Enregistrer dans l'historique
        await fetch('/api/launch-map/design/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId,
            imageUrl: finalDesignUrl,
            placement: stickerPlacements.join(', ') || placementToUse,
            source: stickerSource === 'logo_only' ? 'logo_only' : stickerSource === 'logo_plus_ai' ? 'logo_plus_ai' : 'ai',
          }),
        });
        setDesignImageUrl(finalDesignUrl);
        fetchDesignHistory();
      } else if (!designImageUrl.startsWith('http') && !designImageUrl.startsWith('/')) {
        // Si ce n'est ni un blob ni une URL valide, erreur
        throw new Error('URL du design invalide');
      }

      // Vérifier que finalDesignUrl est valide
      if (!finalDesignUrl) {
        throw new Error('Impossible de déterminer l\'URL du design');
      }

      // Sauvegarder le design dans la base de données
      const colorLocked = isHexColor(garmentColorForDesign) ? normalizeHex(garmentColorForDesign.replace(/^#?/, '#')) : garmentColorForDesign || '#ffffff';
      const placementsInitial = stickerPlacements.length > 0 ? [...stickerPlacements] : [placementToUse];

      const saveRes = await fetch('/api/launch-map/design/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          productType,
          designImageUrl: finalDesignUrl,
          stickerUrl: finalDesignUrl,
          placement: { x: 50, y: 42, scale: 100 },
          mockupSpec: {
            productType: productApiLabel,
            colorMain: colorLocked,
            designPlacement: placementsInitial.join(', '),
          },
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || 'Erreur sauvegarde');
      setSavedDesignId(saveData.design?.id ?? null);
      setDesignStepValidated(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };


  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const urlToLoad = src.startsWith('blob:') ? src : proxyImageUrl(src);
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Erreur chargement image'));
      img.src = urlToLoad;
    });
  }, []);

  /** Composite : dessine le cadre (frame) puis le logo centré par-dessus (logo à ~50% de la taille). */
  const compositeLogoOnFrame = useCallback(
    async (frameUrl: string, logoUrl: string): Promise<string> => {
      const [frameImg, logoImg] = await Promise.all([loadImage(frameUrl), loadImage(logoUrl)]);
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas non disponible');
      ctx.drawImage(frameImg, 0, 0, size, size);
      const logoSize = Math.round(size * 0.5);
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      ctx.drawImage(logoImg, x, y, logoSize, logoSize);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png', 0.92));
      if (!blob) throw new Error('Export impossible');
      return URL.createObjectURL(blob);
    },
    [loadImage]
  );

  const handleUseLogoOnly = async () => {
    if (!brand?.logo?.trim()) {
      setError('Aucun logo enregistré. Enregistrez d’abord un logo (phase Identité).');
      return;
    }
    setMode('sticker');
    setError(null);
    setMockupImageUrl(null);
    setPreviewImageUrl(null);
    const url = brand.logo.startsWith('http') ? proxyImageUrl(brand.logo) : brand.logo;
    setDesignImageUrl(url);
    try {
      await fetch('/api/launch-map/design/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, imageUrl: brand.logo, placement: stickerPlacements.join(', '), source: 'logo_only' }),
      });
      fetchDesignHistory();
    } catch {
      // ignore
    }
  };

  const handleGenerateSticker = async (userDesc?: string, useLogoFrame = false) => {
    const desc = typeof userDesc === 'string' && userDesc.trim() ? userDesc.trim() : undefined;
    setMode('sticker');
    setError(null);
    setMockupImageUrl(null);
    setPreviewImageUrl(null);
    setIsGenerating(true);
    setGeneratingDesignStep(null);
    try {
      const placements = stickerPlacements.length ? stickerPlacements : [placementsForProduct[0]];
      const textByPlacementPayload: Record<string, string> = {};
      placements.forEach((p) => {
        const fromState = (textByPlacement[p] ?? (placements.length === 1 ? stickerDescription : '')).trim();
        textByPlacementPayload[p] = fromState || (lastSentTextByPlacementRef.current[p] ?? '').trim() || '';
      });
      const hasAnyText = placements.some((p) => (textByPlacementPayload[p] ?? '').length > 0);
      if (!hasAnyText && stickerSource === 'ai') {
        setError('Indiquez le texte à afficher pour chaque emplacement ci-dessus avant de régénérer.');
        setIsGenerating(false);
        return;
      }

      const baseBody: {
        brandId: string;
        productType?: string;
        userDescription?: string;
        logoUrl?: string;
        placement?: string[];
        source?: string;
        textByPlacement?: Record<string, string>;
        garmentColor?: string;
        designStyleKeywords?: string;
        designAvoid?: string;
        inspiration?: string;
      } = {
        brandId,
        productType,
        userDescription: desc,
        source: useLogoFrame ? 'logo_plus_ai' : 'ai',
        garmentColor: isHexColor(garmentColorForDesign) ? normalizeHex(garmentColorForDesign.replace(/^#?/, '#')) : '#ffffff',
      };
      if (designStyleKeywords.trim()) baseBody.designStyleKeywords = designStyleKeywords.trim();
      if (designAvoid.trim()) baseBody.designAvoid = designAvoid.trim();
      if (designInspiration.trim()) baseBody.inspiration = designInspiration.trim();
      if (useLogoFrame && brand?.logo?.trim()) baseBody.logoUrl = brand.logo.trim();

      /** Génération 1 par 1 : une requête API par emplacement pour éviter que le 2e design dérape (vêtement, texte inventé). */
      if (placements.length > 1) {
        const designs: Array<{ placement: string; imageUrl: string; rationale: string }> = [];
        const logoUrlForComposite = useLogoFrame && brand?.logo?.trim() ? (brand.logo.startsWith('http') ? proxyImageUrl(brand.logo) : brand.logo) : null;
        for (let i = 0; i < placements.length; i++) {
          const p = placements[i]!;
          setGeneratingDesignStep({ current: i + 1, total: placements.length, placement: p });
          const bodySingle = {
            ...baseBody,
            placement: [p],
            textByPlacement: { [p]: textByPlacementPayload[p] ?? '' },
          };
          const res = await fetch('/api/launch-map/design/generate-sticker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodySingle),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Erreur génération');
          let imageUrl = data.imageUrl as string;
          if (logoUrlForComposite) imageUrl = await compositeLogoOnFrame(imageUrl, logoUrlForComposite);
          const rationale = typeof data.rationale === 'string' && data.rationale.trim() ? data.rationale.trim() : '';
          designs.push({ placement: p, imageUrl, rationale });
          setDesignSet([...designs]);
          setDesignImageUrl(designs[0].imageUrl);
        }
        setGeneratingDesignStep(null);
        setSelectedHistoryId(null);
        for (const d of designs) {
          let urlToSave = d.imageUrl;
          if (d.imageUrl.startsWith('blob:') && useLogoFrame && brand?.logo?.trim()) {
            try {
              const blob = await fetch(d.imageUrl).then((r) => r.blob());
              const formData = new FormData();
              formData.append('file', new File([blob], 'design-logo-cadre.png', { type: 'image/png' }));
              formData.append('brandId', brandId);
              const uploadRes = await fetch('/api/ugc/upload', { method: 'POST', body: formData });
              const uploadData = await uploadRes.json();
              if (uploadRes.ok && uploadData.url) urlToSave = typeof window !== 'undefined' ? `${window.location.origin}${uploadData.url}` : uploadData.url;
            } catch {
              // skip
            }
          }
          if (!urlToSave.startsWith('blob:')) {
            try {
              await fetch('/api/launch-map/design/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandId, imageUrl: urlToSave, placement: d.placement, source: useLogoFrame ? 'logo_plus_ai' : 'ai' }),
              });
            } catch {
              // ignore
            }
          }
        }
        if (hasAnyText) lastSentTextByPlacementRef.current = { ...textByPlacementPayload };
        if (stickerSource === 'logo_plus_ai' && desc) setStickerDescription('');
        fetchDesignHistory();
        return;
      }

      const body = { ...baseBody, placement: placements, textByPlacement: textByPlacementPayload };
      const res = await fetch('/api/launch-map/design/generate-sticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération');

      const rawDesigns = data.designs as Array<{ placement: string; imageUrl: string; rationale: string }> | undefined;
      if (Array.isArray(rawDesigns) && rawDesigns.length > 0) {
        let designs = rawDesigns;
        if (useLogoFrame && brand?.logo?.trim()) {
          const logoUrlForComposite = brand.logo.startsWith('http') ? proxyImageUrl(brand.logo) : brand.logo;
          designs = await Promise.all(
            rawDesigns.map(async (d) => ({
              placement: d.placement,
              imageUrl: await compositeLogoOnFrame(d.imageUrl, logoUrlForComposite),
              rationale: d.rationale,
            }))
          );
        }
        setDesignSet(designs);
        setDesignImageUrl(designs[0].imageUrl);
        setSelectedHistoryId(null);
        for (const d of designs) {
          let urlToSave = d.imageUrl;
          if (d.imageUrl.startsWith('blob:') && useLogoFrame && brand?.logo?.trim()) {
            try {
              const blob = await fetch(d.imageUrl).then((r) => r.blob());
              const formData = new FormData();
              formData.append('file', new File([blob], 'design-logo-cadre.png', { type: 'image/png' }));
              formData.append('brandId', brandId);
              const uploadRes = await fetch('/api/ugc/upload', { method: 'POST', body: formData });
              const uploadData = await uploadRes.json();
              if (uploadRes.ok && uploadData.url) urlToSave = typeof window !== 'undefined' ? `${window.location.origin}${uploadData.url}` : uploadData.url;
            } catch {
              // skip this one
            }
          }
          if (!urlToSave.startsWith('blob:')) {
            try {
              await fetch('/api/launch-map/design/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandId, imageUrl: urlToSave, placement: d.placement, source: useLogoFrame ? 'logo_plus_ai' : 'ai' }),
              });
            } catch {
              // ignore
            }
          }
        }
      } else {
        const rationale = typeof data.rationale === 'string' && data.rationale.trim() ? data.rationale.trim() : null;
        setDesignSet(
          rationale
            ? [{ placement: stickerPlacements.join(', ') || '—', imageUrl: data.imageUrl as string, rationale }]
            : null
        );
        let imageUrl = data.imageUrl as string;
        if (useLogoFrame && brand?.logo?.trim()) {
          imageUrl = await compositeLogoOnFrame(imageUrl, brand.logo.startsWith('http') ? proxyImageUrl(brand.logo) : brand.logo);
          if (imageUrl.startsWith('blob:')) {
            try {
              const blob = await fetch(imageUrl).then((r) => r.blob());
              const formData = new FormData();
              formData.append('file', new File([blob], 'design-logo-cadre.png', { type: 'image/png' }));
              formData.append('brandId', brandId);
              const uploadRes = await fetch('/api/ugc/upload', { method: 'POST', body: formData });
              const uploadData = await uploadRes.json();
              if (uploadRes.ok && uploadData.url) {
                const storedUrl = typeof window !== 'undefined' ? `${window.location.origin}${uploadData.url}` : uploadData.url;
                await fetch('/api/launch-map/design/history', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ brandId, imageUrl: storedUrl, placement: stickerPlacements.join(', '), source: 'logo_plus_ai' }),
                });
              }
            } catch {
              // ignore
            }
          }
        }
        setDesignImageUrl(imageUrl);
        setSelectedHistoryId(null);
      }
      if (hasAnyText) lastSentTextByPlacementRef.current = { ...textByPlacementPayload };
      if (stickerSource === 'logo_plus_ai' && desc) setStickerDescription('');
      fetchDesignHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération');
      setGeneratingDesignStep(null);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleRegenerateSticker = () => {
    setError(null);
    handleGenerateSticker(stickerSource === 'logo_plus_ai' ? stickerDescription : undefined, stickerSource === 'logo_plus_ai');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMode('upload');
    setError(null);
    setMockupImageUrl(null);
    setPreviewImageUrl(null);
    setDesignSet(null);
    setSelectedHistoryId(null);
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setDesignImageUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleGenerateMockup = async (modificationText?: string) => {
    setError(null);
    setIsGeneratingMockup(true);
    setMockupImagesByPlacement([]);
    try {
      const placementList = mockupPlacements.length > 0 ? mockupPlacements : ['Poitrine (centre)'];
      const designsToApply: Array<{ placement: string; imageUrl: string }> = [];
      if (designSet?.length) {
        designSet.forEach((d) => {
          if (placementList.includes(d.placement)) designsToApply.push({ placement: d.placement, imageUrl: d.imageUrl });
        });
      } else if (designImageUrl && placementList.length > 0) {
        designsToApply.push({ placement: placementList[0], imageUrl: designImageUrl });
      }

      if (designsToApply.length === 0) {
        setError('Aucun design à appliquer. Validez d’abord un design par emplacement.');
        return;
      }

      const designUrlsToSend: Array<{ placement: string; imageUrl: string }> = [];
      for (const { placement, imageUrl } of designsToApply) {
        let url = imageUrl;
        if (imageUrl.startsWith('blob:')) {
          const blob = await fetch(imageUrl).then((r) => r.blob());
          const formData = new FormData();
          formData.append('file', new File([blob], 'design.png', { type: 'image/png' }));
          formData.append('brandId', brandId);
          const uploadRes = await fetch('/api/ugc/upload', { method: 'POST', body: formData });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok || !uploadData.url) throw new Error('Échec upload du design');
          url = typeof window !== 'undefined' ? `${window.location.origin}${uploadData.url}` : uploadData.url;
        } else if (imageUrl.startsWith('http') && !imageUrl.startsWith(typeof window !== 'undefined' ? window.location.origin : '')) {
          url = imageUrl;
        } else if (imageUrl.startsWith('/')) {
          url = typeof window !== 'undefined' ? `${window.location.origin}${imageUrl}` : imageUrl;
        }
        designUrlsToSend.push({ placement, imageUrl: url });
      }

      const questionnaire: MockupQuestionnaireAnswers = {
        productType: mockupAnswers.productType || productApiLabel,
        cut: mockupAnswers.cut || 'Regular',
        material: mockupAnswers.material || 'Coton',
        colorMain: mockupAnswers.colorMain || 'Blanc',
        neckline: mockupAnswers.neckline || 'Crew (col rond)',
        sleeves: mockupAnswers.sleeves || 'Courtes',
        designType: 'illustration',
        designPlacement: mockupAnswers.designPlacement || placementList.join(', '),
        designDescription: 'Custom graphic print',
        colorSpecifics: mockupAnswers.colorSpecifics,
        seams: mockupAnswers.seams,
        weight: mockupAnswers.weight || undefined,
        length: mockupAnswers.length || undefined,
        hem: mockupAnswers.hem || undefined,
        designTechnique: mockupAnswers.designTechnique || undefined,
        fit: mockupAnswers.fit || undefined,
        targetGender: mockupAnswers.targetGender || undefined,
        viewAngle: 'front',
        brandName: brand?.name || '',
        inspiration: mockupAnswers.inspiration || '',
        notes: mockupAnswers.notes || undefined,
        backgroundStyle: 'white',
        photoStyle: 'ecommerce',
      };

      const res = await fetch('/api/launch-map/design/generate-mockup-with-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          questionnaire,
          designsByPlacement: designUrlsToSend,
          modificationRequest: modificationText?.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération mockup');

      const results = (data.imagesByPlacement as Array<{ placement: string; url: string }>) || [];
      setMockupImagesByPlacement(results);
      if (results.length > 0) {
        setMockupImageUrl(results[0].url);
        setPreviewImageUrl(results[0].url);
      }
      if (modificationText) setMockupModification('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur génération mockup');
    } finally {
      setIsGeneratingMockup(false);
    }
  };
  const handleRegenerateMockup = () => handleGenerateMockup(mockupModification);

  const handleGeneratePreview = async () => {
    if (!designImageUrl || !mockupImageUrl) return;
    setError(null);
    setIsGeneratingPreview(true);
    try {
      const [baseImg, designImg] = await Promise.all([
        loadImage(mockupImageUrl),
        loadImage(designImageUrl),
      ]);
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas non disponible');
      ctx.drawImage(baseImg, 0, 0, size, size);
      const scalePct = placement.scale / 100;
      const designSize = Math.round(size * 0.45 * scalePct);
      const x = Math.round((size - designSize) * (placement.x / 100));
      const y = Math.round((size - designSize) * (placement.y / 100));
      ctx.drawImage(designImg, x, y, designSize, designSize);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png', 0.92));
      if (!blob) throw new Error('Export preview impossible');
      const formData = new FormData();
      formData.append('file', blob, `preview-${productType}-${Date.now()}.png`);
      formData.append('brandId', brandId);
      const uploadRes = await fetch('/api/ugc/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Erreur upload');
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      setPreviewImageUrl(uploadData.url ? `${base}${uploadData.url}` : uploadData.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur génération preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSavePreview = async () => {
    if (!previewImageUrl) return;
    const phase1Product = launchMap?.phase1Data?.productType ?? 'tshirt';
    const phase1Weight = launchMap?.phase1Data?.weight ?? '180 g/m²';
    const productChanged = productType !== phase1Product || (mockupAnswers.weight ?? '') !== phase1Weight;
    if (productChanged && !window.confirm('Vous avez modifié le produit principal ou le grammage par rapport à la phase Identité / Calculatrice. Confirmer l\'enregistrement du design ?')) {
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const saveRes = await fetch('/api/launch-map/design/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          productType,
          designImageUrl: previewImageUrl,
          stickerUrl: designImageUrl || undefined,
          placement: { x: placement.x, y: placement.y, scale: placement.scale },
          mockupSpec: {
            productType,
            ...mockupAnswers,
            placement: { x: placement.x, y: placement.y, scale: placement.scale },
            stickerUrl: designImageUrl || undefined,
            imagesByPlacement: mockupImagesByPlacement.length > 0 ? mockupImagesByPlacement : undefined,
          },
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || 'Erreur sauvegarde');
      setSavedDesignId(saveData.design?.id ?? null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateTechPack = async () => {
    if (!savedDesignId) return;
    setError(null);
    setIsGeneratingTechPack(true);
    try {
      const tpRes = await fetch(`/api/designs/${savedDesignId}/generate-tech-pack`, { method: 'POST' });
      if (!tpRes.ok) {
        const tpData = await tpRes.json().catch(() => ({}));
        throw new Error(tpData.error || 'Erreur génération tech pack');
      }
      setTechPackGenerated(true);
      // Générer la description produit sur base marque + stratégie + identité
      setIsGeneratingDescription(true);
      try {
        const descRes = await fetch(`/api/designs/${savedDesignId}/generate-product-description`, { method: 'POST' });
        if (descRes.ok) {
          const data = await descRes.json();
          if (data.productDescription) setProductDescription(data.productDescription);
        }
      } catch {
        // Ne pas bloquer si la description échoue
      } finally {
        setIsGeneratingDescription(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur Tech Pack');
    } finally {
      setIsGeneratingTechPack(false);
    }
  };

  const handleCompletePhase = async () => {
    setPhaseCompleted(true);
    // Petit délai pour permettre l'animation avant de changer de phase
    await new Promise(resolve => setTimeout(resolve, 200));
    onComplete();
  };

  useEffect(() => {
    if (mode !== 'trend') return;
    setTrendsLoading(true);
    const segment = segmentFromCible(brandTargetAudience);
    const hasPositioning = !!brandStyle.trim();
    const doFetch = (params: URLSearchParams) =>
      fetch(`/api/trends/confirmed?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : { trends: [] }))
        .then((data) => data.trends || [])
        .catch(() => []);
    if (hasPositioning) {
      const paramsStyle = new URLSearchParams({ limit: '24', style: brandStyle.trim() });
      doFetch(paramsStyle).then((list) => {
        if (list.length > 0) {
          setTrends(list);
        } else if (segment) {
          doFetch(new URLSearchParams({ limit: '24', segment })).then(setTrends);
        } else {
          setTrends([]);
        }
      }).finally(() => setTrendsLoading(false));
      return;
    }
    if (segment) {
      doFetch(new URLSearchParams({ limit: '24', segment })).then(setTrends).finally(() => setTrendsLoading(false));
      return;
    }
    doFetch(new URLSearchParams({ limit: '24' })).then(setTrends).finally(() => setTrendsLoading(false));
  }, [mode, brandStyle, brandTargetAudience]);

  const trendKey = (t: typeof trends[0]) => `${t.productType}|${t.cut ?? ''}|${t.material ?? ''}`;
  const trendImageSrc = (url: string | null | undefined) => (url && url.startsWith('http')) ? `/api/proxy-image?url=${encodeURIComponent(url)}` : null;

  const handleSelectTrend = async (trend: typeof trends[0]) => {
    setError(null);
    setMockupImageUrl(null);
    setPreviewImageUrl(null);
    setTrendGenerating(trendKey(trend));
    try {
      const res = await fetch('/api/trends/generate-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: trend.productName,
          productType: trend.productType,
          cut: trend.cut ?? undefined,
          material: trend.material ?? undefined,
          color: trend.color ?? undefined,
          style: trend.style ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur génération');
      setDesignImageUrl(data.imageUrl);
      setSelectedHistoryId(null);
      setMode(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur génération');
    } finally {
      setTrendGenerating(null);
    }
  };

  if (phaseCompleted) {
    return (
      <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
        <p className="font-medium text-foreground">✓ Design et Tech Pack enregistrés</p>
        <p className="text-sm text-muted-foreground mt-1">Vous pouvez passer à la phase Sourcing.</p>
      </div>
    );
  }

  const isGeneratingSomething =
    isGenerating ||
    !!trendGenerating ||
    isGeneratingMockup ||
    isGeneratingPreview ||
    isGeneratingTechPack ||
    isGeneratingDescription;
  const generatingTitle =
    isGeneratingTechPack
      ? 'Génération du Tech Pack…'
      : isGeneratingMockup
        ? 'Génération de la photo produit…'
        : isGeneratingPreview
          ? 'Génération de l’aperçu…'
          : isGeneratingDescription
            ? 'Génération de la description…'
            : trendGenerating
              ? 'Génération de l’image depuis la tendance…'
              : isGenerating
                ? generatingDesignStep
                  ? `Génération ${generatingDesignStep.current}/${generatingDesignStep.total} — ${generatingDesignStep.placement}…`
                  : 'Analyse de votre stratégie et génération du design unique…'
                : 'Génération du design…';

  return (
    <div className="space-y-6">
      <GenerationLoadingPopup open={!!isGeneratingSomething} title={generatingTitle} />
      <p className="text-sm text-muted-foreground">
        Produit : <strong className="text-foreground">{productLabel}</strong>. Créez votre design via IA, téléchargez-le, puis passez à l'étape suivante pour générer le Tech Pack.
      </p>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ——— Étape 1 : Générer ou importer un design (visible uniquement si pas encore validé) ——— */}
      {!designStepValidated && (
        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              Générer ou importer un design
            </CardTitle>
            <CardDescription>Créez votre visuel d&apos;impression (IA, import ou tendance). Validez pour passer aux spécifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-foreground">Comment voulez-vous créer votre design ?</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={stickerSource === 'ai' ? 'default' : 'outline'} size="sm" onClick={() => setStickerSource('ai')}>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Mot ou phrase = logo
              </Button>
              <Button type="button" variant={stickerSource === 'logo_only' ? 'default' : 'outline'} size="sm" onClick={() => setStickerSource('logo_only')} disabled={!brand?.logo?.trim()} title={!brand?.logo?.trim() ? 'Enregistrez d\'abord un logo (phase Identité)' : undefined}>
                <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                Mon logo uniquement
              </Button>
              <Button type="button" variant={stickerSource === 'logo_plus_ai' ? 'default' : 'outline'} size="sm" onClick={() => setStickerSource('logo_plus_ai')} disabled={!brand?.logo?.trim()} title={!brand?.logo?.trim() ? 'Enregistrez d\'abord un logo (phase Identité)' : undefined}>
                <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                Créer un design à partir de mon logo
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Emplacement(s) du design sur le vêtement ({productLabel})</p>
              <p className="text-xs text-muted-foreground">Sélection multiple : cliquez pour ajouter ou retirer.</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {placementsForProduct.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={stickerPlacements.includes(p) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStickerPlacement(p)}
                    className="h-auto py-1.5 px-3 whitespace-normal text-left break-words max-w-[140px] sm:max-w-none text-[11px] sm:text-xs leading-tight"
                  >
                    {p}
                  </Button>
                ))}
              </div>
              {stickerPlacements.length > 0 && (
                <p className="text-[11px] sm:text-xs text-muted-foreground break-words">{stickerPlacements.length} emplacement(s) sélectionné(s) : {stickerPlacements.join(', ')}</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Couleur du vêtement</p>
              <p className="text-xs text-muted-foreground">Le design sera adapté pour bien ressortir sur cette couleur. Recommandations selon votre cible.</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={isHexColor(garmentColorForDesign) ? normalizeHex(garmentColorForDesign.replace(/^#?/, '#')) : '#ffffff'}
                  onChange={(e) => setGarmentColorForDesign(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-border bg-transparent"
                />
                <Input
                  value={garmentColorForDesign}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || v.startsWith('#')) setGarmentColorForDesign(v || '#ffffff');
                    else if (isHexColor('#' + v)) setGarmentColorForDesign('#' + v);
                  }}
                  placeholder="#ffffff"
                  className="w-24 font-mono text-sm"
                />
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-1">Recommandé pour votre cible</p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedGarmentColors.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setGarmentColorForDesign(hex)}
                    className={cn(
                      'w-7 h-7 rounded-md border-2 shrink-0 transition-all',
                      garmentColorForDesign.toLowerCase() === hex.toLowerCase() ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                    )}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
            {(stickerSource === 'ai' || stickerSource === 'logo_plus_ai') && (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Style du design (optionnel)</Label>
                    <Input
                      value={designStyleKeywords}
                      onChange={(e) => setDesignStyleKeywords(e.target.value)}
                      placeholder="ex. minimal, brut, typo bold, sans dégradé"
                      className="min-h-9"
                    />
                    <p className="text-[10px] text-muted-foreground">Mots-clés pour coller à votre identité.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">À éviter dans le design (optionnel)</Label>
                    <Input
                      value={designAvoid}
                      onChange={(e) => setDesignAvoid(e.target.value)}
                      placeholder="ex. dessin animé, néon, fioritures"
                      className="min-h-9"
                    />
                    <p className="text-[10px] text-muted-foreground">Ce que le design ne doit pas contenir.</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Ce que j&apos;aimerais / inspiration (optionnel)</Label>
                  <Textarea
                    value={designInspiration}
                    onChange={(e) => setDesignInspiration(e.target.value)}
                    placeholder="ex. style vintage années 90, typo très bold, couleurs pastel, référence à un artiste..."
                    className="min-h-[72px]"
                    rows={3}
                  />
                  <p className="text-[10px] text-muted-foreground">Décrivez votre inspiration : l’IA l’intègre dans le prompt pour améliorer la créativité du design.</p>
                </div>
                {stickerSource === 'ai' ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Indiquez ce que vous voulez écrire sur chaque emplacement. L&apos;IA génère un design lisible (nom de marque, slogan, etc.) pour chaque zone.
                    </p>
                    {stickerPlacements.map((p) => (
                      <div key={p} className="space-y-1">
                        <Label className="text-xs font-medium">Texte pour « {p} »</Label>
                        <Input
                          value={textByPlacement[p] ?? ''}
                          onChange={(e) => setTextByPlacement((prev) => ({ ...prev, [p]: e.target.value }))}
                          placeholder="ex. BIANGORY, slogan, mot..."
                          className="min-h-9"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Optionnel : décrivez le cadre autour du logo (ex. motif géométrique, bordure épaisse).</p>
                    <Textarea value={stickerDescription} onChange={(e) => setStickerDescription(e.target.value)} placeholder="ex. Bordure géométrique, couleurs de la marque" className="min-h-[72px]" />
                  </>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {stickerSource === 'logo_only' && (
                <Button type="button" variant="default" size="sm" onClick={handleUseLogoOnly} className="gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Utiliser mon logo
                </Button>
              )}
              {(stickerSource === 'ai' || stickerSource === 'logo_plus_ai') && (
                <Button type="button" variant="default" size="sm" onClick={() => handleGenerateSticker(stickerDescription, stickerSource === 'logo_plus_ai')} disabled={isGenerating} className="gap-2">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {stickerSource === 'logo_plus_ai' ? 'Générer un design à partir de mon logo' : 'Générer un design IA'}
                  <GenerationCostBadge feature="design_generate_sticker" />
                </Button>
              )}
              <Button type="button" variant={mode === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => uploadInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Importer mon design
              </Button>
              <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <Button type="button" variant={mode === 'trend' ? 'default' : 'outline'} size="sm" onClick={() => setMode('trend')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Depuis une tendance
              </Button>
            </div>
          </CardContent>
          {stickerPlacements.length > 1 && (
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm font-medium text-foreground">Design par emplacement</p>
              <p className="text-xs text-muted-foreground">Choisissez un design dans l’historique pour chaque emplacement (autant que d’emplacements sélectionnés).</p>
              {selectingForPlacement && (
                <div className="rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm text-foreground">
                  Cliquez sur un design dans l’historique ci-dessous pour l’assigner à : <strong>{selectingForPlacement}</strong>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stickerPlacements.map((placement) => {
                  const img = getImageForPlacement(placement);
                  const rationale = designSet?.find((d) => d.placement === placement)?.rationale;
                  return (
                    <div
                      key={placement}
                      className={cn(
                        'rounded-xl border-2 overflow-hidden bg-muted/20',
                        selectingForPlacement === placement ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                      )}
                    >
                      <div className="aspect-square bg-muted/30 relative">
                        {img ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewModalImageUrl(img.startsWith('blob:') ? img : proxyImageUrl(img));
                              setPreviewModalOpen(true);
                            }}
                            className="block w-full h-full cursor-pointer hover:ring-2 hover:ring-primary/30"
                          >
                            <PreviewWatermark src={img.startsWith('blob:') ? img : proxyImageUrl(img)} alt={placement} className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Aucun design</div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="font-medium text-sm text-foreground">Emplacement : {placement}</p>
                        {rationale && <p className="text-xs text-muted-foreground leading-snug">{rationale}</p>}
                        <Button type="button" variant="outline" size="sm" className="w-full gap-1.5" onClick={() => setSelectingForPlacement(placement)}>
                          <History className="w-3.5 h-3.5" />
                          Choisir dans l’historique
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
          {designImageUrl && (
            <CardContent className="pt-0 space-y-4">
              {stickerPlacements.length === 1 && (
                <p className="text-sm font-medium text-foreground">
                  {designSet && designSet.length > 1 ? `Designs sur le vêtement (${designSet.length} emplacements)` : 'Design actuel'}
                </p>
              )}
              {stickerPlacements.length === 1 && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setPreviewModalImageUrl(null);
                    setPreviewModalOpen(true);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setPreviewModalOpen(true)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="block rounded-xl overflow-hidden border border-border bg-muted/30 aspect-square max-w-[200px] cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow select-none"
                  title="Cliquer pour agrandir (preview sur le site)"
                >
                  <PreviewWatermark src={designImageUrl.startsWith('blob:') ? designImageUrl : proxyImageUrl(designImageUrl)} alt="Design" className="w-full h-full pointer-events-none" />
                </div>
              )}
              {stickerPlacements.length === 1 && designSet && designSet.length === 1 && designSet[0].rationale && (
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Pourquoi ce logo</p>
                  <p className="text-xs text-muted-foreground leading-snug">{designSet[0].rationale}</p>
                </div>
              )}
              {stickerPlacements.length === 1 && designSet && designSet.length > 1 && (
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Designs sur le même vêtement</p>
                  <p className="text-xs text-muted-foreground">Tous ces visuels sont appliqués sur un seul vêtement : un design par emplacement (ex. poitrine + dos). Cliquez sur une image pour l’agrandir.</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {designSet.map((d, i) => (
                      <div
                        key={`${d.placement}-${i}`}
                        className="rounded-xl border-2 border-border overflow-hidden bg-muted/20"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewModalImageUrl(d.imageUrl.startsWith('blob:') ? d.imageUrl : proxyImageUrl(d.imageUrl));
                            setPreviewModalOpen(true);
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          className="block w-full aspect-square relative cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow"
                        >
                          <PreviewWatermark src={d.imageUrl.startsWith('blob:') ? d.imageUrl : proxyImageUrl(d.imageUrl)} alt={d.placement} className="w-full h-full object-cover pointer-events-none" />
                        </button>
                        <div className="p-3 space-y-2">
                          <p className="font-medium text-sm text-foreground">Emplacement : {d.placement}</p>
                          <p className="text-xs font-semibold text-foreground">Pourquoi ce logo</p>
                          <p className="text-xs text-muted-foreground leading-snug">{d.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previewModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                  onClick={() => { setPreviewModalOpen(false); setPreviewModalImageUrl(null); }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Aperçu du design"
                >
                  <div
                    className="relative max-w-full max-h-full rounded-xl overflow-hidden bg-muted shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <PreviewWatermark src={(() => { const u = previewModalImageUrl ?? designImageUrl; return u?.startsWith('blob:') ? u : proxyImageUrl(u ?? ''); })()} alt="Design" className="max-h-[85vh] w-auto object-contain" />
                    <Button type="button" variant="secondary" size="icon" className="absolute top-2 right-2 rounded-full" onClick={() => { setPreviewModalOpen(false); setPreviewModalImageUrl(null); }} aria-label="Fermer">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
              {(stickerSource === 'ai' || stickerSource === 'logo_plus_ai') && (
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pas satisfait ?</p>
                  {stickerSource === 'ai' ? (
                    <p className="text-xs text-muted-foreground">Modifiez les textes ci-dessus pour chaque emplacement puis régénérez.</p>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">Décrivez le cadre que vous voulez autour du logo.</p>
                      <Textarea value={stickerDescription} onChange={(e) => setStickerDescription(e.target.value)} placeholder="ex. Bordure géométrique, couleurs de la marque" className="min-h-[80px]" />
                    </>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={handleRegenerateSticker} disabled={isGenerating} className="gap-2">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {stickerSource === 'logo_plus_ai' ? 'Régénérer le cadre avec cette description' : 'Régénérer le design'}
                  </Button>
                </div>
              )}
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs text-muted-foreground mb-2">Votre design sera enregistré. Vous pourrez le télécharger et passer ensuite à l'étape suivante pour télécharger un pack de mockup.</p>
                {stickerPlacements.length > 1 && (!designSet || designSet.length < stickerPlacements.length) && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">Assignez un design à chaque emplacement pour pouvoir valider.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleSaveDesignDirectly}
                    className="gap-2"
                    disabled={stickerPlacements.length > 1 && (!designSet || designSet.length < stickerPlacements.length) || isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Sauvegarder le design
                  </Button>
                  {designImageUrl && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const d = designSet && designSet.length > 0
                          ? { id: 'current', imageUrl: designSet[0].imageUrl, placement: designSet[0].placement }
                          : { id: 'current', imageUrl: designImageUrl, placement: null };
                        handleDownloadDesign(d);
                      }}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger le design
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          )}
          <CardContent className={cn('border-t pt-4', !designImageUrl && 'pt-4')}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <History className="w-4 h-4" />
                Historique des designs (7 jours)
              </p>
              <p className="text-xs text-muted-foreground">
                {stickerPlacements.length > 1
                  ? "Cliquez sur « Choisir dans l'historique » pour un emplacement, puis sur un design pour l'y assigner. Chaque design indique l'emplacement pour lequel il a été généré."
                  : "Consultez vos designs récents. Cliquez sur un design pour l’utiliser comme design actuel, puis validez pour le tech pack."}
              </p>
              {designHistoryLoading ? (
                <p className="text-xs text-muted-foreground">Chargement…</p>
              ) : designHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucun design enregistré. Générez ou importez un design pour le retrouver ici.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {designHistory.map((d) => (
                    <div
                      key={d.id}
                      className={cn(
                        'rounded-lg border-2 overflow-hidden shrink-0 transition-all flex flex-col w-20 relative',
                        selectedHistoryId === d.id && !selectingForPlacement ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const url = d.imageUrl.startsWith('http') ? proxyImageUrl(d.imageUrl) : d.imageUrl;
                          if (selectingForPlacement) {
                            assignHistoryToPlacement(selectingForPlacement, url, d.placement);
                          } else {
                            setDesignImageUrl(url);
                            setDesignSet(null);
                            setSelectedHistoryId(d.id);
                            setMode('sticker');
                          }
                        }}
                        className="flex flex-col w-full text-left p-0"
                        title={selectingForPlacement ? `Assigner à ${selectingForPlacement}` : 'Utiliser ce design'}
                      >
                        <div className="aspect-square w-full relative">
                          <img src={d.imageUrl.startsWith('http') ? proxyImageUrl(d.imageUrl) : d.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      </button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-6 right-0.5 h-6 w-6 opacity-90 hover:opacity-100"
                        title="Télécharger le design"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDownloadDesign(d);
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      {d.placement && (
                        <span className="text-[10px] text-muted-foreground px-1 py-0.5 truncate block" title={`Généré pour : ${d.placement}`}>
                          Généré pour : {d.placement}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {mode === 'trend' && !designStepValidated && (
        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Choisir une tendance</CardTitle>
            <CardDescription>
              {brandStyle ? <>Style : <strong>{brandStyle}</strong></> : <>Cible : {brandTargetAudience || '—'}</>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : trends.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Aucune tendance. Scannez-en depuis le radar.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                {trends.map((t, i) => {
                  const src = trendImageSrc((t.generatedImageUrl || t.imageUrl) ?? undefined);
                  return (
                    <button
                      key={`${t.productType}-${i}`}
                      type="button"
                      disabled={!!trendGenerating}
                      onClick={() => handleSelectTrend(t)}
                      className="rounded-lg border-2 border-border bg-muted/30 p-3 text-left hover:border-primary/50"
                    >
                      {src ? <img src={src} alt="" className="w-full aspect-square object-cover rounded mb-2" /> : <div className="w-full aspect-square rounded mb-2 bg-muted flex items-center justify-center">{trendGenerating === trendKey(t) ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Cliquer pour générer'}</div>}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium truncate">{t.productName}</span>
                        {!src && <GenerationCostBadge feature="trends_generate_image" className="shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ——— Étape 2 : Spécifications pour le tech pack + mockup (remplace l’étape 1 une fois validée, avec Retour) ——— */}
      {false && designImageUrl && designStepValidated && (
        <Card className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Spécifications pour le Tech Pack (mockup) - DÉSACTIVÉE
                </CardTitle>
                <CardDescription className="mt-1">Ces infos alimentent le Tech Pack (matières, coupe, encolure, manches, couleur). L&apos;IA génère une image produit à partir de ces specs pour illustrer le Tech Pack.</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setDesignStepValidated(false)} className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground mb-2">Logo / design validé (phase précédente)</p>
              <p className="text-xs text-muted-foreground mb-3">Ce visuel est repris dans le prompt et intégré à l’image du mockup lors de la génération.</p>
              {(designSet?.length ?? 0) > 1 ? (
                <div className="flex flex-wrap gap-3">
                  {(designSet ?? []).map((d) => (
                    <div key={d.placement} className="flex flex-col items-center gap-1">
                      <div className="rounded-lg overflow-hidden border border-border aspect-square w-20 h-20 bg-muted/30">
                        <PreviewWatermark src={d.imageUrl.startsWith('blob:') ? d.imageUrl : proxyImageUrl(d.imageUrl)} alt={d.placement} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{d.placement}</span>
                    </div>
                  ))}
                </div>
              ) : designImageUrl ? (
                <div className="rounded-lg overflow-hidden border border-border aspect-square max-w-[120px] bg-muted/30">
                  <PreviewWatermark src={designImageUrl!.startsWith('blob:') ? designImageUrl! : proxyImageUrl(designImageUrl!)} alt="Logo validé" className="w-full h-full object-contain" />
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Coupe</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {CUTS.map((c) => (
                    <Button key={c} type="button" variant={mockupAnswers.cut === c ? 'default' : 'outline'} size="sm" onClick={() => updateMockup({ cut: c })}>{c}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Encolure</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {NECKLINES.map((n) => (
                    <Button key={n} type="button" variant={mockupAnswers.neckline === n ? 'default' : 'outline'} size="sm" onClick={() => updateMockup({ neckline: n })}>{n}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Manches</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {SLEEVES.map((s) => (
                    <Button key={s} type="button" variant={mockupAnswers.sleeves === s ? 'default' : 'outline'} size="sm" onClick={() => updateMockup({ sleeves: s })}>{s}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="material">Matière</Label>
                <Input id="material" value={mockupAnswers.material ?? ''} onChange={(e) => updateMockup({ material: e.target.value })} placeholder="ex. Coton" className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Couleur principale</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">Verrouillée (reprise de l’étape design).</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 opacity-90">
                  <div className="flex items-center gap-2 pointer-events-none">
                    <input
                      type="color"
                      readOnly
                      tabIndex={-1}
                      value={isHexColor(mockupAnswers.colorMain ?? '') ? normalizeHex((mockupAnswers.colorMain as string).replace(/^#?/, '#')) : '#ffffff'}
                      className="w-10 h-10 rounded-lg border border-border bg-transparent"
                    />
                    <Input
                      readOnly
                      tabIndex={-1}
                      value={isHexColor(mockupAnswers.colorMain ?? '') ? normalizeHex((mockupAnswers.colorMain as string).replace(/^#?/, '#')) : (mockupAnswers.colorMain ?? '#ffffff')}
                      className="font-mono w-28 bg-muted"
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label>Placement du logo / visuel</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1">Repris depuis l’étape design (non modifiable).</p>
                <div className="mt-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {mockupPlacements.length > 0 ? mockupPlacements.join(' · ') : '—'}
                  </p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="colorSpecifics">Spécificités couleurs (impression / visuel)</Label>
                <Input id="colorSpecifics" value={mockupAnswers.colorSpecifics ?? ''} onChange={(e) => updateMockup({ colorSpecifics: e.target.value })} placeholder="ex. Pantone 185 C, 2 couleurs, sérigraphie 3 tons" className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Coutures et finitions</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {SEAMS_OPTIONS.map((s) => (
                    <Button key={s} type="button" variant={mockupAnswers.seams === s ? 'default' : 'outline'} size="sm" onClick={() => updateMockup({ seams: s })}>{s}</Button>
                  ))}
                </div>
                <Input value={mockupAnswers.seams && !SEAMS_OPTIONS.includes(mockupAnswers.seams ?? '') ? mockupAnswers.seams : ''} onChange={(e) => updateMockup({ seams: e.target.value?.trim() || '' })} placeholder="Ou précisez (ex. surpiqure 2 mm)" className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label>Grammage tissu</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">Propositions selon le vêtement et la cohérence marché</p>
                <div className="flex flex-wrap gap-2">
                  {(WEIGHT_BY_PRODUCT[productType] ?? WEIGHT_BY_PRODUCT.tshirt).map((w) => (
                    <div key={w.value} className="flex flex-col items-center">
                      <Button
                        type="button"
                        variant={mockupAnswers.weight === w.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateMockup({ weight: w.value })}
                      >
                        {w.label}
                      </Button>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{w.note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="length">Longueur (optionnel)</Label>
                <Input id="length" value={mockupAnswers.length ?? ''} onChange={(e) => updateMockup({ length: e.target.value })} placeholder="ex. mi-long, crop" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="hem">Ourlet / bas</Label>
                <Input id="hem" value={mockupAnswers.hem ?? ''} onChange={(e) => updateMockup({ hem: e.target.value })} placeholder="ex. Droit, fendu" className="mt-1" />
              </div>
              <div>
                <Label>Technique d&apos;impression</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {PRINT_TECHNIQUES.map((t) => (
                    <Button key={t} type="button" variant={mockupAnswers.designTechnique === t ? 'default' : 'outline'} size="sm" onClick={() => updateMockup({ designTechnique: t })}>{t}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Fit</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {FITS.map((f) => (
                    <Button key={f} type="button" variant={mockupAnswers.fit === f ? 'default' : 'outline'} size="sm" onClick={() => updateMockup({ fit: f })}>{f}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Cible</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {TARGET_GENDERS.map((g) => (
                    <Button key={g} type="button" variant={mockupAnswers.targetGender === g ? 'default' : 'outline'} size="sm" onClick={() => updateMockup({ targetGender: g })}>{g}</Button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="inspiration">Inspiration / mood (optionnel)</Label>
                <Input id="inspiration" value={mockupAnswers.inspiration ?? ''} onChange={(e) => updateMockup({ inspiration: e.target.value })} placeholder="ex. streetwear minimal, été" className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Détails supplémentaires (optionnel)</Label>
                <Textarea id="notes" value={mockupAnswers.notes ?? ''} onChange={(e) => updateMockup({ notes: e.target.value })} placeholder="Texture, finition, style précis…" className="mt-1 min-h-[60px]" />
              </div>
            </div>
            <Button onClick={() => handleGenerateMockup()} disabled={isGeneratingMockup} className="gap-2">
              {isGeneratingMockup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Générer le mockup (base du Tech Pack)
              <GenerationCostBadge feature="design_base_mockup" />
            </Button>
            {mockupImageUrl && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  {mockupImagesByPlacement.length > 1
                    ? 'Une image par emplacement (vue cohérente : face pour poitrine, dos pour dos). Cliquez sur une image pour l’agrandir.'
                    : 'Cliquez pour agrandir.'}
                </p>
                {mockupImagesByPlacement.length > 1 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mockupImagesByPlacement.map(({ placement, url }) => (
                      <button
                        key={placement}
                        type="button"
                        onClick={() => {
                          setPreviewModalImageUrl(proxyImageUrl(url));
                          setPreviewModalOpen(true);
                        }}
                        className="rounded-xl overflow-hidden border border-border bg-muted/30 aspect-square relative text-left cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <PreviewWatermark src={proxyImageUrl(url)} alt={`Mockup ${placement}`} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                        <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-medium px-2 py-1.5 truncate">{placement}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (mockupImageUrl) {
                        setPreviewModalImageUrl(proxyImageUrl(mockupImageUrl));
                        setPreviewModalOpen(true);
                      }
                    }}
                    className="rounded-xl overflow-hidden border border-border bg-muted/30 aspect-square max-w-[280px] relative block w-full cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <PreviewWatermark src={proxyImageUrl(mockupImageUrl ?? '')} alt="Mockup Tech Pack" className="w-full h-full object-cover" />
                  </button>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pas satisfait du mockup ?</p>
                  <p className="text-xs text-muted-foreground">Décrivez ce que vous voulez modifier (ex. coupe plus oversize, couleur plus foncée, manches plus longues…).</p>
                  <Textarea value={mockupModification} onChange={(e) => setMockupModification(e.target.value)} placeholder="ex. Couleur bleu marine au lieu de noir, coupe plus large" className="min-h-[80px]" />
                  <Button type="button" variant="outline" size="sm" onClick={handleRegenerateMockup} disabled={isGeneratingMockup} className="gap-2">
                    {isGeneratingMockup ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Régénérer le mockup avec ces modifications
                    <GenerationCostBadge feature="design_base_mockup" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ——— Étape 3 : Preview (DÉSACTIVÉE) ——— */}
      {false && designImageUrl && mockupImageUrl && (
        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              Preview (visuel final pour le tech pack)
            </CardTitle>
            <CardDescription>
              {mockupImagesByPlacement.length > 1
                ? 'Design(s) appliqué(s) sur le mockup : une image par emplacement. Validez pour enregistrer et passer au Tech Pack.'
                : 'Design appliqué sur le mockup : cette image sera la photo produit du Tech Pack. Validez pour enregistrer et passer à la génération du Tech Pack.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!previewImageUrl ? (
              <>
                <Button onClick={handleGeneratePreview} disabled={isGeneratingPreview} className="gap-2">
                  {isGeneratingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  Générer la preview
                  <GenerationCostBadge feature="design_base_mockup" />
                </Button>
              </>
            ) : (
              <>
                {mockupImagesByPlacement.length > 1 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mockupImagesByPlacement.map(({ placement, url }) => (
                      <button
                        key={placement}
                        type="button"
                        onClick={() => {
                          setPreviewModalImageUrl(proxyImageUrl(url));
                          setPreviewModalOpen(true);
                        }}
                        className="rounded-xl overflow-hidden border border-border bg-muted/30 aspect-square relative text-left cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <PreviewWatermark src={proxyImageUrl(url)} alt={`Preview ${placement}`} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                        <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-medium px-2 py-1.5 truncate">{placement}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (previewImageUrl) {
                        setPreviewModalImageUrl(previewImageUrl.startsWith('blob:') ? previewImageUrl : proxyImageUrl(previewImageUrl));
                        setPreviewModalOpen(true);
                      }
                    }}
                    className="rounded-xl overflow-hidden border border-border bg-muted/30 aspect-square max-w-sm mx-auto relative block w-full cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <PreviewWatermark src={previewImageUrl ?? ''} alt="Preview" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                  </button>
                )}
                <Button onClick={handleSavePreview} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Valider la preview
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ——— Étape 2 : Tech pack + récap (après sauvegarde du design) ——— */}
      {savedDesignId && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              Récap et réalisation du Tech Pack
            </CardTitle>
            <CardDescription>Générez le Tech Pack détaillé (matières, mesures, construction, impression) à partir de votre design. Vous pourrez ensuite télécharger un pack de mockup pour utiliser sur Canva, Illustrator ou Procreate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Votre design</h4>
                <div className="rounded-xl overflow-hidden border border-border bg-muted/30 aspect-square max-w-[200px]">
                  {designImageUrl && (
                    <PreviewWatermark src={designImageUrl.startsWith('blob:') ? designImageUrl : proxyImageUrl(designImageUrl)} alt="Design" className="w-full h-full" validated={!!savedDesignId} />
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1"><Building2 className="w-4 h-4" /> Infos marque</h4>
                <dl className="text-sm space-y-1 rounded-lg bg-muted/50 p-3">
                  <dt className="text-muted-foreground">Marque</dt>
                  <dd className="font-medium">{brand?.name || '—'}</dd>
                  {brandStyle && (
                    <>
                      <dt className="text-muted-foreground mt-2">Style / positionnement</dt>
                      <dd className="font-medium">{brandStyle}</dd>
                    </>
                  )}
                  {brandTargetAudience && (
                    <>
                      <dt className="text-muted-foreground mt-2">Cible</dt>
                      <dd className="font-medium">{brandTargetAudience}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerateTechPack} disabled={isGeneratingTechPack || techPackGenerated} className="gap-2">
                {isGeneratingTechPack ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {techPackGenerated ? 'Tech Pack généré' : 'Générer le Tech Pack'}
                <GenerationCostBadge feature="design_tech_pack" />
              </Button>
              {savedDesignId && (
                <Link
                  href={`/designs/${savedDesignId}/tech-pack`}
                  className="inline-flex items-center justify-center rounded-lg font-semibold h-10 px-5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border bg-background hover:bg-muted hover:border-primary/50"
                >
                  Voir le tech pack
                </Link>
              )}
              <Button onClick={handleCompletePhase} variant="default" className="gap-2">
                <Check className="w-4 h-4" />
                Terminer et passer au Sourcing
              </Button>
            </div>
            {isGeneratingDescription && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Création de la description produit (marque + stratégie + identité)…
              </p>
            )}
            {productDescription && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description produit
                  </CardTitle>
                  <CardDescription>
                    Générée à partir de votre marque, stratégie et phase identité. Utilisez-la sur votre fiche produit ou boutique.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap rounded-lg bg-background/80 p-4 border border-border">
                    {productDescription}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                    onClick={() => {
                      void navigator.clipboard.writeText(productDescription);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    Copier la description
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Design basé sur la marque &quot;{brand?.name || '—'}&quot; et votre stratégie. Vous pouvez importer un visuel ou en générer un depuis une tendance.
      </p>
    </div>
  );
}
