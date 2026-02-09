/**
 * Mapping des types de mockup (dossiers public/mockups) vers :
 * - Les emplacements pertinents pour le tech pack
 * - La clé de dimensions à utiliser
 * - Les coordonnées d'annotation adaptées aux flat sketches
 * Les types doivent correspondre aux noms des dossiers dans public/mockups.
 */

import type { ProductTypeKey } from './techpack-base-dimensions';
import { getAnnotationCoordinatesUnified } from './tech-pack-annotations';

/** Emplacements disponibles par type de vêtement (alignés avec les mockups fournis) */
export const PLACEMENTS_BY_MOCKUP_TYPE: Record<string, string[]> = {
  // Hauts à manches
  'T-shirt': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Col',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'T-shirt court': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Col',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Sweat': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Capuche (dos)',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Poche kangourou',
    'Poche poitrine',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Sweat oversize': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Capuche (dos)',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Poche kangourou',
    'Poche poitrine',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Hoodie': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Capuche (dos)',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Poche kangourou',
    'Poche poitrine',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Débardeur': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Col',
    'Étiquette de cou',
    'Épaule',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Crop top': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Col',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Bas (devant)',
    'Bas (dos)',
  ],
  'Cagoules': [
    'Poitrine (centre)',
    'Dos',
    'Dos complet',
    'Capuche (dos)',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Bas (devant)',
    'Bas (dos)',
  ],
  'Doudounes': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Capuche (dos)',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Poche poitrine',
    'Poche arrière',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Maillot de foot': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Col',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Patte d_eph': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Col',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Doubles t-shirts': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Col',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],
  'Jogging': [
    'Poitrine (centre)',
    'Poitrine (gauche)',
    'Poitrine (droite)',
    'Dos',
    'Dos complet',
    'Étiquette de cou',
    'Manche gauche',
    'Manche droite',
    'Épaule',
    'Poche kangourou',
    'Poche poitrine',
    'Bas (devant)',
    'Bas (dos)',
    'Étiquette d\'ourlet',
  ],

  // Bas
  'Pantalon': [
    'Ceinture',
    'Poche arrière',
    'Poche poitrine',
    'Cuisse (côté)',
    'Bas de jambe',
    'Étiquette d\'ourlet',
  ],
  'Cargos': [
    'Ceinture',
    'Poche arrière',
    'Poche poitrine',
    'Cuisse (côté)',
    'Bas de jambe',
    'Étiquette d\'ourlet',
  ],
  'Jeans': [
    'Ceinture',
    'Poche arrière',
    'Poche poitrine',
    'Cuisse (côté)',
    'Bas de jambe',
    'Étiquette d\'ourlet',
  ],
  'Shorts - Bermudas': [
    'Ceinture',
    'Poche arrière',
    'Poche poitrine',
    'Cuisse (côté)',
    'Bas de jambe',
    'Étiquette d\'ourlet',
  ],
  'Shorts leggings': [
    'Ceinture',
    'Poche arrière',
    'Cuisse (côté)',
    'Bas de jambe',
    'Étiquette d\'ourlet',
  ],
  'Bas femme': [
    'Ceinture',
    'Poche arrière',
    'Cuisse (côté)',
    'Bas de jambe',
    'Étiquette d\'ourlet',
  ],
  'Bas homme': [
    'Ceinture',
    'Poche arrière',
    'Poche poitrine',
    'Cuisse (côté)',
    'Bas de jambe',
    'Étiquette d\'ourlet',
  ],
  'Jupe': [
    'Ceinture',
    'Poche arrière',
    'Poche poitrine',
    'Cuisse (côté)',
    'Bas de jambe',
    'Étiquette d\'ourlet',
  ],

  // Accessoires
  'ACCESSOIRES': [
    'Étiquette de cou',
    'Étiquette d\'ourlet',
  ],
};

/** Clé de dimensions pour chaque type de mockup */
export const DIMENSION_KEY_BY_MOCKUP_TYPE: Record<string, ProductTypeKey> = {
  'T-shirt': 'tshirt',
  'T-shirt court': 'tshirt',
  'Sweat': 'sweat',
  'Sweat oversize': 'sweat',
  'Hoodie': 'hoodie',
  'Débardeur': 'tshirt',
  'Crop top': 'tshirt',
  'Cagoules': 'hoodie',
  'Doudounes': 'veste',
  'Maillot de foot': 'tshirt',
  'Patte d_eph': 'tshirt',
  'Doubles t-shirts': 'tshirt',
  'Jogging': 'sweat',
  'Pantalon': 'pantalon',
  'Cargos': 'pantalon',
  'Jeans': 'pantalon',
  'Shorts - Bermudas': 'pantalon',
  'Shorts leggings': 'pantalon',
  'Bas femme': 'pantalon',
  'Bas homme': 'pantalon',
  'Jupe': 'pantalon',
  'ACCESSOIRES': 'tshirt',
};

/** Retourne les emplacements pour un type de mockup (fallback si inconnu) */
export function getPlacementsForMockupType(mockupType: string): string[] {
  return (
    PLACEMENTS_BY_MOCKUP_TYPE[mockupType] ??
    PLACEMENTS_BY_MOCKUP_TYPE['T-shirt']
  );
}

/** Retourne la clé de dimensions pour un type de mockup */
export function getDimensionKeyForMockupType(mockupType: string): ProductTypeKey {
  return (
    DIMENSION_KEY_BY_MOCKUP_TYPE[mockupType] ?? 'tshirt'
  );
}

/**
 * Coordonnées unifiées adaptées aux mockups (devant gauche | dos droite).
 * ViewBox 0 0 200 100 : gauche 0–100 = devant, droite 100–200 = dos.
 * Calibré pour les flat sketches (T-shirt, Sweat, Pantalon).
 */
export type UnifiedCoord = { garment: [number, number]; letter: [number, number]; view: 'front' | 'back' };

/** Coordonnées par placement pour les mockups type T-shirt (flat sketch) */
const UNIFIED_COORDS_TSHIRT: Record<string, UnifiedCoord> = {
  'Poitrine (centre)': { garment: [50, 42], letter: [50, 18], view: 'front' },
  'Poitrine (gauche)': { garment: [38, 42], letter: [22, 30], view: 'front' },
  'Poitrine (droite)': { garment: [62, 42], letter: [78, 30], view: 'front' },
  'Col': { garment: [50, 14], letter: [24, 10], view: 'front' },
  'Étiquette de cou': { garment: [50, 14], letter: [24, 10], view: 'front' },
  'Étiquette de col': { garment: [50, 14], letter: [24, 10], view: 'front' },
  'Épaule': { garment: [50, 22], letter: [50, 10], view: 'front' },
  'Manche gauche': { garment: [18, 38], letter: [6, 38], view: 'front' },
  'Manche droite': { garment: [82, 38], letter: [94, 38], view: 'front' },
  'Bas (devant)': { garment: [50, 82], letter: [50, 92], view: 'front' },
  'Étiquette d\'ourlet': { garment: [50, 86], letter: [50, 92], view: 'front' },
  'Dos': { garment: [50, 42], letter: [50, 18], view: 'back' },
  'Dos complet': { garment: [50, 48], letter: [50, 12], view: 'back' },
  'Bas (dos)': { garment: [50, 82], letter: [50, 92], view: 'back' },
};

/** Coordonnées pour les mockups type Sweat/Hoodie (capuche) */
const UNIFIED_COORDS_SWEAT: Record<string, UnifiedCoord> = {
  ...UNIFIED_COORDS_TSHIRT,
  'Capuche (dos)': { garment: [50, 12], letter: [50, 4], view: 'back' },
  'Poche kangourou': { garment: [50, 54], letter: [50, 64], view: 'front' },
  'Poche poitrine': { garment: [50, 48], letter: [50, 58], view: 'front' },
};

/** Coordonnées pour les mockups type Pantalon (ceinture, poches, jambes) */
const UNIFIED_COORDS_PANTALON: Record<string, UnifiedCoord> = {
  'Ceinture': { garment: [50, 18], letter: [50, 8], view: 'front' },
  'Poche arrière': { garment: [50, 28], letter: [50, 38], view: 'back' },
  'Poche poitrine': { garment: [50, 22], letter: [50, 32], view: 'front' },
  'Cuisse (côté)': { garment: [50, 55], letter: [28, 60], view: 'front' },
  'Bas de jambe': { garment: [50, 88], letter: [50, 94], view: 'front' },
  'Étiquette d\'ourlet': { garment: [50, 92], letter: [50, 96], view: 'front' },
};

const UNIFIED_BY_MOCKUP_TYPE: Record<string, Record<string, UnifiedCoord>> = {
  'T-shirt': UNIFIED_COORDS_TSHIRT,
  'T-shirt court': UNIFIED_COORDS_TSHIRT,
  'Débardeur': UNIFIED_COORDS_TSHIRT,
  'Crop top': UNIFIED_COORDS_TSHIRT,
  'Maillot de foot': UNIFIED_COORDS_TSHIRT,
  'Patte d_eph': UNIFIED_COORDS_TSHIRT,
  'Doubles t-shirts': UNIFIED_COORDS_TSHIRT,
  'Sweat': UNIFIED_COORDS_SWEAT,
  'Sweat oversize': UNIFIED_COORDS_SWEAT,
  'Hoodie': UNIFIED_COORDS_SWEAT,
  'Cagoules': UNIFIED_COORDS_SWEAT,
  'Doudounes': UNIFIED_COORDS_SWEAT,
  'Jogging': UNIFIED_COORDS_SWEAT,
  'Pantalon': UNIFIED_COORDS_PANTALON,
  'Cargos': UNIFIED_COORDS_PANTALON,
  'Jeans': UNIFIED_COORDS_PANTALON,
  'Shorts - Bermudas': UNIFIED_COORDS_PANTALON,
  'Shorts leggings': UNIFIED_COORDS_PANTALON,
  'Bas femme': UNIFIED_COORDS_PANTALON,
  'Bas homme': UNIFIED_COORDS_PANTALON,
  'Jupe': UNIFIED_COORDS_PANTALON,
  'ACCESSOIRES': {
    'Étiquette de cou': { garment: [50, 14], letter: [24, 10], view: 'front' },
    'Étiquette d\'ourlet': { garment: [50, 86], letter: [50, 92], view: 'front' },
  },
};

function normalizePlacementForMatch(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[''`]/g, "'")
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a');
}

/** Retourne les coordonnées unifiées pour un placement et un type de mockup (ou fallback T-shirt) */
export function getUnifiedCoordsForMockup(
  placement: string,
  mockupType: string,
  letterIndex: number
): { pointOnGarment: { x: number; y: number }; letterPosition: { x: number; y: number }; color: 'red' | 'blue' } {
  const coordsMap = UNIFIED_BY_MOCKUP_TYPE[mockupType] ?? UNIFIED_COORDS_TSHIRT;
  const normalized = normalizePlacementForMatch(placement);
  const key = Object.keys(coordsMap).find(
    (k) => normalizePlacementForMatch(k) === normalized
  ) ?? Object.keys(coordsMap).find((k) => normalized.includes(normalizePlacementForMatch(k)) || normalizePlacementForMatch(k).includes(normalized));
  const c = key ? coordsMap[key] : null;

  if (c) {
    const offsetX = c.view === 'front' ? 0 : 100;
    const gx = offsetX + c.garment[0];
    const gy = c.garment[1];
    const lx = offsetX + c.letter[0];
    const ly = c.letter[1];
    // Raccourcir les flèches pour éviter qu'elles chevauchent d'autres emplacements
    const shortenFactor = 0.45;
    const letterX = gx + (lx - gx) * shortenFactor;
    const letterY = gy + (ly - gy) * shortenFactor;
    return {
      pointOnGarment: { x: gx, y: gy },
      letterPosition: { x: letterX, y: letterY },
      color: letterIndex === 0 ? 'red' : 'blue',
    };
  }

  // Fallback: utilise les coordonnées génériques (avec raccourcissement)
  const fallback = getAnnotationCoordinatesUnified(placement, letterIndex);
  const shortenFactor = 0.45;
  const gx = fallback.pointOnGarment.x;
  const gy = fallback.pointOnGarment.y;
  const lx = fallback.letterPosition.x;
  const ly = fallback.letterPosition.y;
  return {
    pointOnGarment: { x: gx, y: gy },
    letterPosition: {
      x: gx + (lx - gx) * shortenFactor,
      y: gy + (ly - gy) * shortenFactor,
    },
    color: fallback.color,
  };
}
