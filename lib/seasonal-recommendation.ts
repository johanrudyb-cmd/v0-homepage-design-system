/**
 * Recommandation produit + grammage selon la saison à venir (hémisphère nord).
 * Utilisé en Phase 0 Identité pour suggérer le type de vêtement qui se vendra le mieux.
 */

export type ProductTypeId = 'tshirt' | 'hoodie' | 'veste' | 'pantalon';

export interface SeasonalRecommendation {
  productType: ProductTypeId;
  weight: string;
  label: string;
  reason: string;
}

/** Grammages par type (alignés Phase 1 Calculator / Phase 2 Design) */
const WEIGHT_BY_PRODUCT: Record<ProductTypeId, string[]> = {
  tshirt: ['140 g/m²', '160 g/m²', '180 g/m²', '200 g/m²', '220 g/m²'],
  hoodie: ['250 g/m²', '280 g/m²', '300 g/m²', '350 g/m²', '400 g/m²'],
  veste: ['200 g/m²', '250 g/m²', '300 g/m²', '350 g/m²'],
  pantalon: ['250 g/m²', '300 g/m²', '350 g/m²', '400 g/m²'],
};

const PRODUCT_LABELS: Record<ProductTypeId, string> = {
  tshirt: 'T-shirt',
  hoodie: 'Hoodie',
  veste: 'Veste',
  pantalon: 'Pantalon',
};

/** Mois 1-12. Saison à venir dans ~2 mois pour décider quoi recommander. */
function getUpcomingSeason(month: number): 'summer' | 'autumn' | 'winter' | 'spring' {
  // Dans 2 mois : mois+2
  const inTwoMonths = ((month + 1) % 12) + 1; // 1-12
  if (inTwoMonths >= 6 && inTwoMonths <= 8) return 'summer';
  if (inTwoMonths >= 9 && inTwoMonths <= 11) return 'autumn';
  if (inTwoMonths === 12 || inTwoMonths <= 2) return 'winter';
  return 'spring';
}

/**
 * Retourne la recommandation saisonnière : type de produit + grammage adapté.
 * Basé sur le mois actuel (1-12) pour l'hémisphère nord.
 */
export function getSeasonalRecommendation(month?: number): SeasonalRecommendation {
  const m = month ?? new Date().getMonth() + 1; // 1-12
  const season = getUpcomingSeason(m);

  switch (season) {
    case 'summer':
      return {
        productType: 'tshirt',
        weight: '180 g/m²',
        label: 'T-shirt (grammage été)',
        reason: "Dans 2 mois nous entrerons en été. Les T-shirts se vendent le mieux ; un grammage 160–200 g/m² est idéal pour la saison.",
      };
    case 'autumn':
      return {
        productType: 'hoodie',
        weight: '300 g/m²',
        label: 'Hoodie (mi-saison)',
        reason: "L'automne approche. Les hoodies et sweats sont très demandés ; un grammage 280–350 g/m² convient parfaitement.",
      };
    case 'winter':
      return {
        productType: 'hoodie',
        weight: '350 g/m²',
        label: 'Hoodie / Veste (hiver)',
        reason: "L'hiver arrive. Privilégiez hoodies ou vestes avec un grammage plus élevé (300–400 g/m²) pour le froid.",
      };
    case 'spring':
      return {
        productType: 'tshirt',
        weight: '180 g/m²',
        label: 'T-shirt (pré-été)',
        reason: "Le printemps mène à l'été. Les T-shirts reprennent ; un grammage standard 160–200 g/m² est recommandé.",
      };
    default:
      return {
        productType: 'tshirt',
        weight: '180 g/m²',
        label: 'T-shirt',
        reason: "Recommandation par défaut : T-shirt grammage standard, adapté à la plupart des lancements.",
      };
  }
}

export function getWeightOptions(productType: ProductTypeId): { value: string; label: string }[] {
  const values = WEIGHT_BY_PRODUCT[productType] ?? WEIGHT_BY_PRODUCT.tshirt;
  return values.map((v) => ({ value: v, label: v.replace(' g/m²', '') }));
}

export function getProductTypeLabel(id: ProductTypeId): string {
  return PRODUCT_LABELS[id] ?? 'T-shirt';
}

export const PRODUCT_TYPE_IDS: ProductTypeId[] = ['tshirt', 'hoodie', 'veste', 'pantalon'];
