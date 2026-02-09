/**
 * Dimensions de base par type de vêtement (tailles standard).
 * Utilisées pour pré-remplir le tech pack quand l'utilisateur souhaite modifier les dimensions.
 */

export type ProductTypeKey = 'tshirt' | 'hoodie' | 'sweat' | 'polo' | 'veste' | 'pantalon';

export interface GarmentDimensions {
  /** Longueur totale (cm) */
  longueur?: number;
  /** Tour de poitrine (cm) */
  tourPoitrine?: number;
  /** Tour d'épaule (cm) */
  tourEpaule?: number;
  /** Longueur de manche (cm) */
  longueurManche?: number;
  /** Tour de manche (cm) */
  tourManche?: number;
  /** Tour de cou (cm) */
  tourCou?: number;
  /** Largeur d'encolure (cm) */
  largeurEncolure?: number;
  /** Longueur dos (cm) */
  longueurDos?: number;
  /** Tour de taille (cm) - pantalon */
  tourTaille?: number;
  /** Tour de hanches (cm) - pantalon */
  tourHanches?: number;
  /** Longueur de jambe (cm) - pantalon */
  longueurJambe?: number;
  /** Tour de bas (cm) */
  tourBas?: number;
}

/** Tailles standard affichées dans l'app (mockup / tech pack) */
export const GARMENT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const BASE_DIMENSIONS_BY_PRODUCT: Record<ProductTypeKey, Record<string, GarmentDimensions>> = {
  tshirt: {
    XS: { longueur: 65, tourPoitrine: 90, tourEpaule: 40, longueurManche: 16, tourManche: 40, tourCou: 36, largeurEncolure: 17, longueurDos: 63, tourBas: 90 },
    S: { longueur: 68, tourPoitrine: 96, tourEpaule: 42, longueurManche: 18, tourManche: 42, tourCou: 38, largeurEncolure: 18, longueurDos: 66, tourBas: 96 },
    M: { longueur: 71, tourPoitrine: 102, tourEpaule: 44, longueurManche: 20, tourManche: 45, tourCou: 40, largeurEncolure: 19, longueurDos: 69, tourBas: 102 },
    L: { longueur: 74, tourPoitrine: 108, tourEpaule: 46, longueurManche: 22, tourManche: 48, tourCou: 42, largeurEncolure: 20, longueurDos: 72, tourBas: 108 },
    XL: { longueur: 77, tourPoitrine: 116, tourEpaule: 49, longueurManche: 24, tourManche: 52, tourCou: 45, largeurEncolure: 21, longueurDos: 75, tourBas: 116 },
    XXL: { longueur: 80, tourPoitrine: 124, tourEpaule: 52, longueurManche: 26, tourManche: 55, tourCou: 48, largeurEncolure: 22, longueurDos: 78, tourBas: 124 },
  },
  hoodie: {
    XS: { longueur: 63, tourPoitrine: 98, tourEpaule: 46, longueurManche: 60, tourManche: 50, tourCou: 46, largeurEncolure: 21, longueurDos: 61, tourBas: 98 },
    S: { longueur: 66, tourPoitrine: 104, tourEpaule: 48, longueurManche: 62, tourManche: 52, tourCou: 48, largeurEncolure: 22, longueurDos: 64, tourBas: 104 },
    M: { longueur: 69, tourPoitrine: 112, tourEpaule: 50, longueurManche: 64, tourManche: 55, tourCou: 50, largeurEncolure: 23, longueurDos: 67, tourBas: 112 },
    L: { longueur: 72, tourPoitrine: 120, tourEpaule: 52, longueurManche: 66, tourManche: 58, tourCou: 52, largeurEncolure: 24, longueurDos: 70, tourBas: 120 },
    XL: { longueur: 75, tourPoitrine: 128, tourEpaule: 55, longueurManche: 68, tourManche: 61, tourCou: 55, largeurEncolure: 25, longueurDos: 73, tourBas: 128 },
    XXL: { longueur: 78, tourPoitrine: 136, tourEpaule: 58, longueurManche: 70, tourManche: 64, tourCou: 58, largeurEncolure: 26, longueurDos: 76, tourBas: 136 },
  },
  sweat: {
    XS: { longueur: 64, tourPoitrine: 94, tourEpaule: 44, longueurManche: 56, tourManche: 48, tourCou: 42, largeurEncolure: 19, longueurDos: 62, tourBas: 94 },
    S: { longueur: 67, tourPoitrine: 100, tourEpaule: 46, longueurManche: 58, tourManche: 50, tourCou: 44, largeurEncolure: 20, longueurDos: 65, tourBas: 100 },
    M: { longueur: 70, tourPoitrine: 108, tourEpaule: 48, longueurManche: 60, tourManche: 52, tourCou: 46, largeurEncolure: 21, longueurDos: 68, tourBas: 108 },
    L: { longueur: 73, tourPoitrine: 116, tourEpaule: 50, longueurManche: 62, tourManche: 55, tourCou: 48, largeurEncolure: 22, longueurDos: 71, tourBas: 116 },
    XL: { longueur: 76, tourPoitrine: 124, tourEpaule: 53, longueurManche: 64, tourManche: 58, tourCou: 51, largeurEncolure: 23, longueurDos: 74, tourBas: 124 },
    XXL: { longueur: 79, tourPoitrine: 132, tourEpaule: 56, longueurManche: 66, tourManche: 61, tourCou: 54, largeurEncolure: 24, longueurDos: 77, tourBas: 132 },
  },
  polo: {
    XS: { longueur: 65, tourPoitrine: 92, tourEpaule: 41, longueurManche: 20, tourManche: 40, tourCou: 38, largeurEncolure: 19, longueurDos: 63, tourBas: 92 },
    S: { longueur: 68, tourPoitrine: 98, tourEpaule: 43, longueurManche: 22, tourManche: 42, tourCou: 40, largeurEncolure: 20, longueurDos: 66, tourBas: 98 },
    M: { longueur: 71, tourPoitrine: 104, tourEpaule: 45, longueurManche: 24, tourManche: 45, tourCou: 42, largeurEncolure: 21, longueurDos: 69, tourBas: 104 },
    L: { longueur: 74, tourPoitrine: 110, tourEpaule: 47, longueurManche: 26, tourManche: 48, tourCou: 44, largeurEncolure: 22, longueurDos: 72, tourBas: 110 },
    XL: { longueur: 77, tourPoitrine: 118, tourEpaule: 50, longueurManche: 28, tourManche: 51, tourCou: 47, largeurEncolure: 23, longueurDos: 75, tourBas: 118 },
    XXL: { longueur: 80, tourPoitrine: 126, tourEpaule: 53, longueurManche: 30, tourManche: 54, tourCou: 50, largeurEncolure: 24, longueurDos: 78, tourBas: 126 },
  },
  veste: {
    XS: { longueur: 59, tourPoitrine: 94, tourEpaule: 42, longueurManche: 58, tourManche: 46, tourCou: 40, largeurEncolure: 21, longueurDos: 57, tourBas: 94 },
    S: { longueur: 62, tourPoitrine: 100, tourEpaule: 44, longueurManche: 60, tourManche: 48, tourCou: 42, largeurEncolure: 22, longueurDos: 60, tourBas: 100 },
    M: { longueur: 65, tourPoitrine: 108, tourEpaule: 46, longueurManche: 62, tourManche: 50, tourCou: 44, largeurEncolure: 23, longueurDos: 63, tourBas: 108 },
    L: { longueur: 68, tourPoitrine: 116, tourEpaule: 48, longueurManche: 64, tourManche: 53, tourCou: 46, largeurEncolure: 24, longueurDos: 66, tourBas: 116 },
    XL: { longueur: 71, tourPoitrine: 124, tourEpaule: 51, longueurManche: 66, tourManche: 56, tourCou: 49, largeurEncolure: 25, longueurDos: 69, tourBas: 124 },
    XXL: { longueur: 74, tourPoitrine: 132, tourEpaule: 54, longueurManche: 68, tourManche: 59, tourCou: 52, largeurEncolure: 26, longueurDos: 72, tourBas: 132 },
  },
  pantalon: {
    XS: { longueurJambe: 95, tourTaille: 72, tourHanches: 92, tourBas: 40 },
    S: { longueurJambe: 98, tourTaille: 76, tourHanches: 96, tourBas: 42 },
    M: { longueurJambe: 101, tourTaille: 80, tourHanches: 100, tourBas: 44 },
    L: { longueurJambe: 104, tourTaille: 84, tourHanches: 104, tourBas: 46 },
    XL: { longueurJambe: 107, tourTaille: 88, tourHanches: 108, tourBas: 48 },
    XXL: { longueurJambe: 110, tourTaille: 92, tourHanches: 112, tourBas: 50 },
  },
};

export const DIMENSION_LABELS: Record<keyof GarmentDimensions, string> = {
  longueur: 'Longueur totale (cm)',
  tourPoitrine: 'Tour de poitrine (cm)',
  tourEpaule: 'Tour d\'épaule (cm)',
  longueurManche: 'Longueur de manche (cm)',
  tourManche: 'Tour de manche (cm)',
  tourCou: 'Tour de cou (cm)',
  largeurEncolure: 'Largeur d\'encolure (cm)',
  longueurDos: 'Longueur dos (cm)',
  tourTaille: 'Tour de taille (cm)',
  tourHanches: 'Tour de hanches (cm)',
  longueurJambe: 'Longueur de jambe (cm)',
  tourBas: 'Tour de bas (cm)',
};

/** Ordre des dimensions à afficher par type de produit */
export const DIMENSION_KEYS_BY_PRODUCT: Record<ProductTypeKey, (keyof GarmentDimensions)[]> = {
  tshirt: ['longueur', 'tourPoitrine', 'tourEpaule', 'longueurManche', 'tourManche', 'tourCou', 'largeurEncolure', 'longueurDos', 'tourBas'],
  hoodie: ['longueur', 'tourPoitrine', 'tourEpaule', 'longueurManche', 'tourManche', 'tourCou', 'largeurEncolure', 'longueurDos', 'tourBas'],
  sweat: ['longueur', 'tourPoitrine', 'tourEpaule', 'longueurManche', 'tourManche', 'tourCou', 'largeurEncolure', 'longueurDos', 'tourBas'],
  polo: ['longueur', 'tourPoitrine', 'tourEpaule', 'longueurManche', 'tourManche', 'tourCou', 'largeurEncolure', 'longueurDos', 'tourBas'],
  veste: ['longueur', 'tourPoitrine', 'tourEpaule', 'longueurManche', 'tourManche', 'tourCou', 'largeurEncolure', 'longueurDos', 'tourBas'],
  pantalon: ['longueurJambe', 'tourTaille', 'tourHanches', 'tourBas'],
};

export function getProductTypeKey(type: string): ProductTypeKey {
  const t = (type || '').toLowerCase();
  if (t.includes('hoodie')) return 'hoodie';
  if (t.includes('sweat')) return 'sweat';
  if (t.includes('polo')) return 'polo';
  if (t.includes('veste') || t.includes('jacket')) return 'veste';
  if (t.includes('pantalon') || t.includes('pantalon')) return 'pantalon';
  return 'tshirt';
}
