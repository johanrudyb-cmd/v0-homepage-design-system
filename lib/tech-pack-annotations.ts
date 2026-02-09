/**
 * Générateur de Tech Pack - Coordonnées d'annotation
 * Retourne les coordonnées X/Y pour placer la flèche et le label sur le SVG du vêtement (Flat Sketch).
 * Vue : Face (0-50%) | Dos (50-100%) dans un viewBox 0 0 100 100.
 */

export type AnnotationView = 'front' | 'back';

export interface AnnotationCoordinates {
  /** Point sur le vêtement (où la flèche touche le dessin) - en coordonnées locales de la vue (0-50 x pour face, 0-50 x pour dos) */
  pointOnGarment: { x: number; y: number };
  /** Position du label lettré (A, B, C) - en coordonnées locales */
  letterPosition: { x: number; y: number };
  /** Vue concernée (face ou dos) */
  view: AnnotationView;
  /** Couleur de la flèche : rouge pour logo principal, bleu pour détails secondaires */
  color: 'red' | 'blue';
}

/**
 * Mapping des emplacements vers les coordonnées sur le Flat Sketch.
 * Coordonnées précises : garment = point sur le vêtement, letter = position du label (proche du point pour éviter chevauchement).
 * Chaque vue (Face / Dos) a son propre viewBox 0 0 100 100.
 */
const PLACEMENT_COORDS: Record<string, { garment: [number, number]; letter: [number, number]; view: AnnotationView; color: 'red' | 'blue' }> = {
  // === FACE ===
  'Poitrine (centre)': { garment: [50, 40], letter: [50, 18], view: 'front', color: 'red' },
  'Poitrine (gauche)': { garment: [38, 40], letter: [22, 28], view: 'front', color: 'red' },
  'Poitrine (droite)': { garment: [62, 40], letter: [78, 28], view: 'front', color: 'red' },
  /* Neck tag / étiquette de cou : garment = col précis, lettre à gauche pour ne pas masquer */
  'Col': { garment: [50, 12], letter: [24, 10], view: 'front', color: 'blue' },
  'Étiquette de cou': { garment: [50, 12], letter: [24, 10], view: 'front', color: 'blue' },
  'Étiquette de col': { garment: [50, 12], letter: [24, 10], view: 'front', color: 'blue' },
  'Neck tag': { garment: [50, 12], letter: [24, 10], view: 'front', color: 'blue' },
  'Épaule': { garment: [50, 20], letter: [50, 10], view: 'front', color: 'blue' },
  'Manche gauche': { garment: [18, 36], letter: [6, 36], view: 'front', color: 'blue' },
  'Manche droite': { garment: [82, 36], letter: [94, 36], view: 'front', color: 'blue' },
  'Poche poitrine': { garment: [50, 47], letter: [50, 58], view: 'front', color: 'blue' },
  'Bas (devant)': { garment: [50, 84], letter: [50, 94], view: 'front', color: 'blue' },
  'Devant (bas)': { garment: [50, 84], letter: [50, 94], view: 'front', color: 'blue' },
  'Étiquette d\'ourlet': { garment: [50, 86], letter: [50, 94], view: 'front', color: 'blue' },
  'Hem label': { garment: [50, 86], letter: [50, 94], view: 'front', color: 'blue' },
  'Ourlet': { garment: [50, 86], letter: [50, 94], view: 'front', color: 'blue' },

  // === DOS ===
  'Dos': { garment: [50, 40], letter: [50, 18], view: 'back', color: 'red' },
  'Dos complet': { garment: [50, 45], letter: [50, 12], view: 'back', color: 'red' },
  'Capuche (dos)': { garment: [50, 10], letter: [50, 4], view: 'back', color: 'blue' },
  'Poche arrière': { garment: [50, 55], letter: [50, 66], view: 'back', color: 'blue' },
  'Bas (dos)': { garment: [50, 84], letter: [50, 94], view: 'back', color: 'blue' },
  'Poche kangourou': { garment: [50, 52], letter: [50, 62], view: 'front', color: 'blue' },
  'Ceinture': { garment: [50, 60], letter: [50, 70], view: 'front', color: 'blue' },
  'Cuisse (côté)': { garment: [50, 72], letter: [28, 76], view: 'front', color: 'blue' },
  'Bas de jambe': { garment: [50, 90], letter: [50, 96], view: 'front', color: 'blue' },
};

/** Normalise un libellé d'emplacement pour la recherche */
function normalizePlacement(placement: string): string {
  return placement
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/['']/g, "'");
}

/** Liste des emplacements pour le sélecteur utilisateur */
export const PLACEMENT_OPTIONS = [
  'Poitrine (centre)',
  'Poitrine (gauche)',
  'Poitrine (droite)',
  'Dos',
  'Dos complet',
  'Col',
  'Étiquette de cou',
  'Étiquette d\'ourlet',
  'Manche gauche',
  'Manche droite',
  'Épaule',
  'Bas (devant)',
  'Bas (dos)',
  'Capuche (dos)',
  'Poche poitrine',
  'Poche arrière',
  'Poche kangourou',
  'Ceinture',
] as const;

/** Cherche une correspondance partielle dans les clés */
function findMatchingPlacement(placement: string): string | null {
  const normalized = normalizePlacement(placement);
  const keys = Object.keys(PLACEMENT_COORDS);
  const exact = keys.find((k) => normalizePlacement(k) === normalized);
  if (exact) return exact;
  const partial = keys.find((k) => normalizePlacement(k).includes(normalized) || normalized.includes(normalizePlacement(k)));
  return partial ?? null;
}

/**
 * Retourne les coordonnées pour placer la flèche et le label sur le SVG du vêtement.
 * @param placement - Emplacement sélectionné (ex: "Poitrine (gauche)", "Étiquette de cou")
 * @param letterIndex - 0 = A (logo principal, rouge), 1 = B (étiquette/secondaire, bleu), etc.
 */
export function getAnnotationCoordinates(
  placement: string,
  letterIndex: number = 0
): AnnotationCoordinates {
  const key = findMatchingPlacement(placement);
  const coords = key ? PLACEMENT_COORDS[key] : null;

  if (coords) {
    const color: 'red' | 'blue' = letterIndex === 0 ? 'red' : 'blue';
    return {
      pointOnGarment: { x: coords.garment[0], y: coords.garment[1] },
      letterPosition: { x: coords.letter[0], y: coords.letter[1] },
      view: coords.view,
      color: coords.color,
    };
  }

  // Fallback selon l'index : A = poitrine centre, B = étiquette de col
  if (letterIndex === 0) {
    return {
      pointOnGarment: { x: 50, y: 40 },
      letterPosition: { x: 50, y: 18 },
      view: 'front',
      color: 'red',
    };
  }
  return {
    pointOnGarment: { x: 50, y: 12 },
    letterPosition: { x: 24, y: 10 },
    view: 'front',
    color: 'blue',
  };
}

/**
 * Coordonnées pour une vue unifiée (devant + dos sur le même document).
 * ViewBox 0 0 200 100 : gauche = devant (0–100), droite = dos (100–200).
 */
export interface UnifiedAnnotationCoordinates {
  pointOnGarment: { x: number; y: number };
  letterPosition: { x: number; y: number };
  color: 'red' | 'blue';
}

export function getAnnotationCoordinatesUnified(
  placement: string,
  letterIndex: number = 0
): UnifiedAnnotationCoordinates {
  const base = getAnnotationCoordinates(placement, letterIndex);
  const isFront = base.view === 'front';
  // ViewBox 200x100 : gauche (0–100) = devant, droite (100–200) = dos
  const offsetX = isFront ? 0 : 100;

  return {
    pointOnGarment: {
      x: offsetX + base.pointOnGarment.x,
      y: base.pointOnGarment.y,
    },
    letterPosition: {
      x: offsetX + base.letterPosition.x,
      y: base.letterPosition.y,
    },
    color: letterIndex === 0 ? 'red' : 'blue',
  };
}
