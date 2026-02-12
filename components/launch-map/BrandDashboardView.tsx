'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Copy,
  Lightbulb,
  Palette,
  Target,
  Calculator,
  Video,
  FileText,
  Truck,
  Megaphone,
  Store,
  ExternalLink,
  Minus,
  Pencil,
  X,
} from 'lucide-react';
import { StrategyPresentationView } from './StrategyPresentationView';
import { getSeasonalRecommendation, getProductTypeLabel } from '@/lib/seasonal-recommendation';
import { LaunchMapStepper, type BrandIdentity } from './LaunchMapStepper';
import { LAUNCH_MAP_PHASES } from '@/lib/launch-map-constants';
import type { LaunchMapData } from './LaunchMapStepper';

/** Fournisseur (usine) avec lequel la marque a des devis */
export interface SupplierRecap {
  id: string;
  name: string;
  country: string;
  moq?: number;
  leadTime?: number;
  quoteCount: number;
}

interface BrandDashboardViewProps {
  brand: {
    id: string;
    name: string;
    logo?: string | null;
  };
  launchMap: LaunchMapData | null;
  brandFull: BrandIdentity;
  hasIdentity: boolean;
  designCount: number;
  quoteCount: number;
  ugcCount: number;
  progressPercentage: number;
  suppliers?: SupplierRecap[];
}

const PHASE_ICONS = [Palette, Target, Calculator, Video, FileText, Truck, Megaphone, Store] as const;

/** Présentation par phase : intro + objectifs pour la page de chaque onglet */
export const PHASE_PRESENTATIONS: Record<number, { intro: string; objectives: string[] }> = {
  0: {
    intro: 'Donnez un nom à votre marque et définissez le produit principal que vous souhaitez lancer. Cette base servira à toutes les étapes suivantes.',
    objectives: [
      'Définir le nom de la marque (2 caractères minimum)',
      'Valider le type de produit (t-shirt, hoodie, etc.)',
      'Optionnel : logo et identité visuelle',
    ],
  },
  1: {
    intro: 'Inspirez-vous d’une grande marque dans votre univers pour aligner votre stratégie (positionnement, cible, identité visuelle) sur un modèle qui fonctionne.',
    objectives: [
      'Choisir une marque de référence dans votre style',
      'Récupérer une stratégie marketing adaptée',
      'Valider le positionnement et la cible',
    ],
  },
  2: {
    intro: 'Calculez la rentabilité de votre projet : prix de vente, coût de production et frais marketing pour obtenir votre marge nette et valider la viabilité.',
    objectives: [
      'Saisir le prix de vente cible',
      'Estimer les coûts de production et marketing',
      'Obtenir la marge nette et le seuil de rentabilité',
    ],
  },
  3: {
    intro: 'Apprenez à créer votre design professionnel grâce au tutoriel vidéo, téléchargez votre pack de mockup et découvrez des recommandations IA personnalisées.',
    objectives: [
      'Regarder le tutoriel vidéo sur la création de design',
      'Télécharger le pack de mockup',
      'Consulter les recommandations IA pour votre vêtement',
    ],
  },
  4: {
    intro: 'Transformez votre mockup en fiche technique fournisseur. Choisissez le design, indiquez si vous souhaitez modifier les dimensions du vêtement, puis enregistrez.',
    objectives: [
      'Sélectionner le mockup à transformer en tech pack',
      'Choisir de modifier ou non les dimensions (manches, tour de poitrine, etc.)',
      'Enregistrer le tech pack pour le fournisseur',
    ],
  },
  5: {
    intro: 'Contactez des usines qualifiées depuis le Sourcing Hub et obtenez au moins 2 devis pour comparer les prix et délais.',
    objectives: [
      'Explorer le Hub et filtrer par type de produit',
      'Envoyer des demandes de devis à 2 usines minimum',
      'Comparer les réponses pour choisir un partenaire',
    ],
  },
  6: {
    intro: 'Générez des posts structurés (accroche, corps, CTA, hashtags) par IA à partir de votre stratégie et planifiez-les dans le calendrier.',
    objectives: [
      'Accéder à la création de contenu (Post structuré)',
      'Générer un post par plateforme avec l’IA',
      'Planifier le post dans le calendrier pour valider la phase',
    ],
  },
  7: {
    intro: 'Connectez votre boutique Shopify pour valider cette étape. Une fois connectée, vous pourrez créer des posts adaptés à chaque plateforme depuis votre stratégie de contenu et les planifier dans le Calendrier.',
    objectives: [
      'Saisir le domaine de votre boutique Shopify',
      'Valider la connexion pour débloquer la création de posts',
    ],
  },
};

function formatProductType(key: string): string {
  const labels: Record<string, string> = {
    tshirt: 'T-shirt',
    hoodie: 'Hoodie',
    veste: 'Veste',
    pantalon: 'Pantalon',
  };
  return labels[key] || key;
}

function formatSlugAsName(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Récap détaillé en lecture seule (aligné sur les infos de chaque phase) */
export function PhaseRecap({
  phaseId,
  brandFull,
  launchMap,
  designCount,
  quoteCount,
  ugcCount,
  progress,
  suppliers = [],
}: {
  phaseId: number;
  brandFull: BrandIdentity;
  launchMap: LaunchMapData | null;
  designCount: number;
  quoteCount: number;
  ugcCount: number;
  progress: { phase0: boolean; phase1: boolean; phase2: boolean; phase3: boolean; phase4: boolean; phase5: boolean; phase6: boolean; phase7?: boolean };
  suppliers?: SupplierRecap[];
}) {
  const completed = phaseId === 0 ? progress.phase0 : progress[`phase${phaseId}` as keyof typeof progress];
  const sg = brandFull?.styleGuide && typeof brandFull.styleGuide === 'object' ? brandFull.styleGuide as Record<string, unknown> : null;
  const productType = (sg?.productType as string) || null;
  const productWeight = (sg?.productWeight as string) || null;
  const item = (label: string, value: string | number | null | undefined, fullWidth?: boolean) =>
    value != null && String(value).trim() !== '' ? (
      <div key={label} className={fullWidth ? 'sm:col-span-2' : undefined}>
        <dt className="text-muted-foreground font-medium">{label}</dt>
        <dd className="text-foreground mt-0.5">{value}</dd>
      </div>
    ) : null;

  if (phaseId === 0) {
    const sh = brandFull?.socialHandles && typeof brandFull.socialHandles === 'object' ? brandFull.socialHandles as Record<string, string> : null;
    const story = (sg?.story as string)?.trim();
    const tagline = (sg?.tagline as string)?.trim();
    const description = (sg?.description as string)?.trim();
    const stage = (sg?.stage as string)?.trim();
    const mainProduct = (sg?.mainProduct as string)?.trim();
    const domain = brandFull?.domain?.trim();
    const instagram = sh?.instagram?.trim();
    const twitter = sh?.twitter?.trim();
    const nonRenseigne = 'Non renseigné';
    const itemOrPlaceholder = (label: string, value: string | number | null | undefined, fullWidth?: boolean) => (
      <div key={label} className={fullWidth ? 'sm:col-span-2' : undefined}>
        <dt className="text-muted-foreground font-medium">{label}</dt>
        <dd className={cn('mt-0.5', (value == null || String(value).trim() === '') ? 'text-muted-foreground italic' : 'text-foreground')}>
          {value != null && String(value).trim() !== '' ? value : nonRenseigne}
        </dd>
      </div>
    );
    const blockOrPlaceholder = (label: string, value: string | null | undefined) => (
      <div key={label} className="sm:col-span-2">
        <dt className="text-muted-foreground font-medium">{label}</dt>
        <dd className={cn('mt-0.5', !value?.trim() ? 'text-muted-foreground italic' : 'text-foreground', value?.trim() && 'whitespace-pre-wrap')}>
          {value?.trim() || nonRenseigne}
        </dd>
      </div>
    );
    const logoLabel = brandFull?.logo ? 'Défini' : (sg?.noLogo ? 'Sans logo' : nonRenseigne);
    return (
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {itemOrPlaceholder('Nom de la marque', brandFull?.name ?? null)}
        {itemOrPlaceholder('Type de produit', productType ? formatProductType(productType) : null)}
        {itemOrPlaceholder('Grammage', productWeight ?? null)}
        {itemOrPlaceholder('Produit principal (libellé)', mainProduct || null)}
        <div>
          <dt className="text-muted-foreground font-medium">Logo</dt>
          <dd className={cn('mt-0.5', logoLabel === nonRenseigne ? 'text-muted-foreground italic' : 'text-foreground')}>{logoLabel}</dd>
        </div>
        {itemOrPlaceholder('Domaine / site', domain || null)}
        {itemOrPlaceholder('Instagram', instagram || null)}
        {itemOrPlaceholder('Twitter / X', twitter || null)}
        {itemOrPlaceholder('Étape / stade', stage || null)}
        {itemOrPlaceholder('Tagline', tagline || null)}
        {blockOrPlaceholder('Story', story || null)}
        {blockOrPlaceholder('Description', description || null)}
      </dl>
    );
  }

  if (phaseId === 1) {
    const slug = brandFull?.templateBrandSlug?.trim();
    const positioning = (sg?.preferredStyle as string)?.trim() || (sg?.positioning as string)?.trim();
    const targetAudience = (sg?.targetAudience as string)?.trim();
    return (
      <div className="space-y-3">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {item('Marque d\'inspiration', slug ? formatSlugAsName(slug) : null)}
          {item('Positionnement / style', positioning || null)}
          {item('Cible audience', targetAudience || null)}
          {!slug && !positioning && !targetAudience && (
            <p className="text-muted-foreground sm:col-span-2">Aucune stratégie enregistrée. Utilisez le bouton ci-dessous pour copier une stratégie depuis une marque d&apos;inspiration.</p>
          )}
        </dl>
        {(slug || positioning || targetAudience) && (
          <p className="text-muted-foreground text-xs sm:col-span-2">La stratégie ne se modifie pas à la main : pour la changer, copiez-en une autre.</p>
        )}
      </div>
    );
  }

  if (phaseId === 2) {
    const data = launchMap?.phase1Data as Record<string, unknown> | null | undefined;
    if (!completed || !data) {
      return (
        <p className="text-sm text-muted-foreground">
          Aucune donnée enregistrée. Utilisez le formulaire ci-dessous pour calculer votre rentabilité.
        </p>
      );
    }
    const sellingPrice = typeof data.sellingPrice === 'number' ? data.sellingPrice : null;
    const productionCost = typeof data.productionCost === 'number' ? data.productionCost : null;
    const marketingCost = typeof data.marketingCost === 'number' ? data.marketingCost : null;
    const quantity = typeof data.quantity === 'number' ? data.quantity : null;
    const pt = (data.productType as string) || null;
    const weight = (data.weight as string) || null;
    const grossMarginPercent = typeof data.grossMarginPercent === 'number' ? data.grossMarginPercent : null;
    const netMarginPercent = typeof data.netMarginPercent === 'number' ? data.netMarginPercent : null;
    const isViable = data.isViable === true;
    const costMatiere = typeof data.costMatiere === 'number' ? data.costMatiere : null;
    const costFabrication = typeof data.costFabrication === 'number' ? data.costFabrication : null;
    const costAccessoires = typeof data.costAccessoires === 'number' ? data.costAccessoires : null;
    const costPackaging = typeof data.costPackaging === 'number' ? data.costPackaging : null;
    const costTransport = typeof data.costTransport === 'number' ? data.costTransport : null;
    const hasBreakdown = costMatiere != null || costFabrication != null;
    return (
      <div className="space-y-4 text-sm">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sellingPrice != null && item('Prix de vente', `${sellingPrice} €`)}
          {productionCost != null && item('Coût de production', `${productionCost} €`)}
          {marketingCost != null && item('Coût marketing', `${marketingCost} €`)}
          {quantity != null && item('Quantité (dépôt)', `${quantity} pièces`)}
          {pt && item('Type de produit', formatProductType(pt))}
          {weight && item('Grammage', weight)}
          {grossMarginPercent != null && item('Marge brute', `${grossMarginPercent} %`)}
          {netMarginPercent != null && item('Marge nette', `${netMarginPercent} %`)}
          <div>
            <dt className="text-muted-foreground font-medium">Projet viable</dt>
            <dd className="text-foreground mt-0.5 font-medium">{isViable ? 'Oui' : 'Non'}</dd>
          </div>
        </dl>
        {hasBreakdown && (
          <>
            <p className="text-muted-foreground font-medium pt-2 border-t border-border">Détail des coûts</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {costMatiere != null && item('Matière', `${costMatiere} €`)}
              {costFabrication != null && item('Fabrication', `${costFabrication} €`)}
              {costAccessoires != null && item('Accessoires', `${costAccessoires} €`)}
              {costPackaging != null && item('Packaging', `${costPackaging} €`)}
              {costTransport != null && item('Transport', `${costTransport} €`)}
            </dl>
          </>
        )}
      </div>
    );
  }

  // Phase 3 = Création du mockup (nouvelle phase)
  if (phaseId === 3) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Regardez le tutoriel vidéo, téléchargez votre pack de mockup et consultez les recommandations IA pour créer votre design.
        </p>
      </div>
    );
  }

  // Phase 4 = Tech Pack
  if (phaseId === 4) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Transformez un mockup en fiche technique et enregistrez les dimensions du vêtement pour vos fournisseurs.
        </p>
      </div>
    );
  }

  // Phase 5 = Sourcing
  if (phaseId === 5) {
    return (
      <div className="space-y-3 text-sm">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <dt className="text-muted-foreground font-medium">Devis envoyés</dt>
            <dd className="text-foreground font-semibold mt-0.5">{quoteCount}</dd>
          </div>
        </dl>
        {suppliers && suppliers.length > 0 ? (
          <div className="pt-2 border-t border-border">
            <p className="text-muted-foreground font-medium mb-2">Fournisseurs avec qui vous travaillez</p>
            <ul className="space-y-2">
              {suppliers.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">{s.country}</span>
                  {s.moq != null && <span className="text-muted-foreground">MOQ {s.moq}</span>}
                  {s.leadTime != null && <span className="text-muted-foreground">Délai {s.leadTime} j</span>}
                  <span className="text-primary font-medium">{s.quoteCount} devis</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground">Aucun fournisseur enregistré. Envoyez des devis depuis le Sourcing Hub.</p>
        )}
        <Link href="/sourcing" className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium">
          <ExternalLink className="w-4 h-4" />
          Ouvrir le Sourcing Hub
        </Link>
      </div>
    );
  }

  // Phase 6 = Création de contenu
  if (phaseId === 6) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Générez des posts structurés (accroche, corps, CTA, hashtags) par IA et planifiez-les dans le calendrier.
        </p>
        <Link href="/launch-map/phase/6" className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium">
          <ExternalLink className="w-4 h-4" />
          Création de contenu — Post structuré
        </Link>
      </div>
    );
  }

  // Phase 7 = Création du site
  if (phaseId === 7) {
    const shopDomain = launchMap && 'shopifyShopDomain' in launchMap ? (launchMap as { shopifyShopDomain?: string | null }).shopifyShopDomain : null;
    return (
      <div className="space-y-3 text-sm">
        {shopDomain ? (
          <>
            <p className="text-muted-foreground">Boutique connectée</p>
            <p className="font-medium text-foreground">{shopDomain}</p>
          </>
        ) : (
          <p className="text-muted-foreground">Connectez votre boutique Shopify pour valider cette phase.</p>
        )}
      </div>
    );
  }

  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

export function BrandDashboardView({
  brand,
  launchMap,
  brandFull,
  hasIdentity,
  designCount,
  quoteCount,
  ugcCount,
  progressPercentage,
  suppliers = [],
}: BrandDashboardViewProps) {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  /** Quand null : on affiche la présentation (phase 1) ou le récap. Sinon : on affiche le détail (formulaire). Phase 2 s'ouvre directement. */
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(null);
  const detailSectionRef = useRef<HTMLDivElement>(null);
  const [strategyText, setStrategyText] = useState<string | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const openDetailForPhase = (index: number) => (index === 2 ? index : null);

  useEffect(() => {
    if (activePhaseIndex === 1 && brand.id && !strategyLoading) {
      setStrategyLoading(true);
      fetch(`/api/brands/strategy/history?brandId=${encodeURIComponent(brand.id)}`)
        .then((r) => r.json())
        .then((data) => {
          const latest = data?.strategies?.[0];
          setStrategyText(latest?.strategyText ?? null);
        })
        .finally(() => setStrategyLoading(false));
    }
  }, [activePhaseIndex, brand.id]);

  useEffect(() => {
    if (editingPhaseIndex === activePhaseIndex && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingPhaseIndex, activePhaseIndex]);

  const phase = LAUNCH_MAP_PHASES[activePhaseIndex];
  const presentation = PHASE_PRESENTATIONS[phase.id];
  const PhaseIcon = PHASE_ICONS[phase.id];
  const isShowingDetail = editingPhaseIndex === phase.id;

  const progress = {
    phase0: hasIdentity,
    phase1: launchMap?.phase1 ?? false,
    phase2: launchMap?.phase2 ?? false,
    phase3: launchMap?.phase3 ?? false,
    phase4: launchMap?.phase4 ?? false,
    phase5: launchMap?.phase5 ?? false,
    phase6: launchMap?.phase6 ?? false,
    phase7: launchMap?.phase7 ?? false,
  };

  const completedPhases = [
    progress.phase0,
    progress.phase1,
    progress.phase2,
    progress.phase3,
    progress.phase4,
    progress.phase5,
    progress.phase6,
    progress.phase7,
  ].filter(Boolean).length;

  // Tous les onglets sont accessibles : à l'accès au dashboard, identité et stratégie sont déjà remplies.
  const isPhaseAccessible = () => true;

  const seasonalRec = getSeasonalRecommendation();
  const sg = brandFull?.styleGuide && typeof brandFull.styleGuide === 'object' ? brandFull.styleGuide as Record<string, unknown> : null;
  const brandProductType = (sg?.productType as string) || null;
  const brandSlug = brandFull?.templateBrandSlug?.trim();
  const targetAudience = (sg?.targetAudience as string)?.trim();
  const positioning = (sg?.preferredStyle as string)?.trim() || (sg?.positioning as string)?.trim();
  const firstIncompletePhase = LAUNCH_MAP_PHASES.find((_, i) => !progress[`phase${i}` as keyof typeof progress] && (i === 0 ? !hasIdentity : progress[`phase${i - 1}` as keyof typeof progress]));

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Vue d'ensemble : métriques + recommandations marché */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Vue d&apos;ensemble</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {brand.name} — métriques et recommandations par rapport à votre positionnement
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Métriques</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground font-medium">Designs créés</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{designCount}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground font-medium">Devis envoyés</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{quoteCount}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground font-medium">Progression</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{progressPercentage}%</p>
                  <p className="text-xs text-muted-foreground">{completedPhases} / 7 phases</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground font-medium">Fournisseurs</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{suppliers.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground font-medium">Scripts UGC</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{ugcCount}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Recommandations par rapport au marché
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-primary/5 p-4">
                  <p className="font-medium text-foreground text-sm">Saison à venir (hémisphère nord)</p>
                  <p className="text-sm text-muted-foreground mt-1">{seasonalRec.reason}</p>
                  <p className="text-sm text-foreground mt-2">
                    Produit recommandé : <strong>{getProductTypeLabel(seasonalRec.productType)}</strong> — {seasonalRec.weight}
                    {brandProductType && brandProductType !== seasonalRec.productType && (
                      <span className="text-muted-foreground ml-2">
                        (vous êtes actuellement en {formatProductType(brandProductType)})
                      </span>
                    )}
                  </p>
                </div>
                {(brandSlug || targetAudience || positioning) && (
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <p className="font-medium text-foreground text-sm">Votre positionnement</p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      {brandSlug && <li>Marque d&apos;inspiration : {formatSlugAsName(brandSlug)}</li>}
                      {positioning && <li>Style / positionnement : {positioning}</li>}
                      {targetAudience && <li>Cible : {targetAudience}</li>}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      Ce segment de marché reste porteur ; gardez une cohérence entre identité, prix et communication.
                    </p>
                  </div>
                )}
                {firstIncompletePhase && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <p className="font-medium text-foreground text-sm">Prochaine étape recommandée</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {firstIncompletePhase.id === 0
                        ? "Complétez l'identité de la marque (nom, type de produit, logo) pour débloquer les phases suivantes."
                        : `Passez à la phase « ${firstIncompletePhase.title} » : ${firstIncompletePhase.description}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Onglets : un par phase */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/80 border border-border overflow-x-auto">
          {LAUNCH_MAP_PHASES.map((p, originalIndex) => {
            const Icon = PHASE_ICONS[p.id];
            const completed = progress[`phase${p.id}` as keyof typeof progress] || (p.id === 0 && hasIdentity);
            const accessible = isPhaseAccessible();
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (!accessible) return;
                  setActivePhaseIndex(originalIndex);
                  setEditingPhaseIndex(openDetailForPhase(originalIndex));
                }}
                disabled={!accessible}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex-shrink-0',
                  activePhaseIndex === originalIndex
                    ? 'bg-background text-foreground shadow-sm'
                    : accessible
                      ? 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      : 'text-muted-foreground/60 cursor-not-allowed'
                )}
                title={p.subtitle}
              >
                {completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 flex-shrink-0" />
                )}
                <Icon className="w-4 h-4 hidden sm:block flex-shrink-0" />
                <span className="hidden md:inline">{p.title}</span>
                <span className="md:hidden">Phase {p.id}</span>
              </button>
            );
          })}
        </div>

        {/* Page de présentation de la phase active */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-border bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <PhaseIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                    Phase {phase.id} — {phase.subtitle}
                  </p>
                  <h2 className="text-xl font-bold text-foreground mb-2">{phase.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {presentation.intro}
                  </p>
                  <ul className="space-y-2">
                    {presentation.objectives.map((obj, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {phase.id === 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingPhaseIndex(1)}
                  className="shrink-0 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Changer la stratégie
                </Button>
              )}
            </div>
          </div>

          {/* Phase 1 : présentation de la stratégie (onglet cliqué) ou formulaire pour changer */}
          {phase.id === 1 && !isShowingDetail && (
            <div className="p-6 sm:p-8 border-b border-border bg-background">
              {strategyLoading ? (
                <p className="text-sm text-muted-foreground">Chargement de la stratégie…</p>
              ) : strategyText ? (
                <StrategyPresentationView
                  strategyText={strategyText}
                  brandName={brand.name}
                  titleMode="strategy"
                  visualIdentityLocked
                  onClose={() => { }}
                  embedded
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                  <p className="text-muted-foreground mb-4">Aucune stratégie enregistrée.</p>
                  <Button size="sm" onClick={() => setEditingPhaseIndex(1)} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copier une stratégie depuis une marque d&apos;inspiration
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Phase 1 en mode édition : formulaire pour copier une autre stratégie */}
          {phase.id === 1 && isShowingDetail && (
            <div className="px-6 sm:px-8 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Changer la stratégie
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPhaseIndex(null);
                    fetch(`/api/brands/strategy/history?brandId=${encodeURIComponent(brand.id)}`)
                      .then((r) => r.json())
                      .then((data) => {
                        const latest = data?.strategies?.[0];
                        setStrategyText(latest?.strategyText ?? null);
                      });
                  }}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Fermer et revenir à la présentation
                </Button>
              </div>
            </div>
          )}

          {/* Récap de la phase (lecture seule) + bouton Modifier — phase 0 uniquement (phase 1 gérée ci-dessus) */}
          {phase.id === 0 && (
            <div className="px-6 sm:px-8 py-5 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Récap de la phase
                </h3>
                {isShowingDetail ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPhaseIndex(null)}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Fermer le détail
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setEditingPhaseIndex(phase.id)}
                    className="gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Modifier
                  </Button>
                )}
              </div>
              <div className="mt-3">
                <PhaseRecap
                  phaseId={phase.id}
                  brandFull={brandFull}
                  launchMap={launchMap}
                  designCount={designCount}
                  quoteCount={quoteCount}
                  ugcCount={ugcCount}
                  progress={progress}
                  suppliers={suppliers}
                />
              </div>
            </div>
          )}

          {/* Détail (formulaire) : Calculatrice, Design, Sourcing… toujours affiché ; Phase 1 après clic sur Changer ; Phase 0 après Modifier */}
          {([2, 3, 4, 5, 6, 7].includes(phase.id) || (phase.id === 1 && isShowingDetail) || (phase.id === 0 && isShowingDetail)) && (
            <div ref={detailSectionRef} className="p-6 sm:p-8 bg-background">
              <LaunchMapStepper
                brandId={brand.id}
                launchMap={launchMap}
                brand={brandFull}
                hasIdentity={hasIdentity}
                focusedPhase={phase.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
