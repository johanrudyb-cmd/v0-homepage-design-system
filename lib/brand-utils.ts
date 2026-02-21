import { isRetailerBrand, safeDisplayBrand } from '@/lib/constants/retailer-exclusion';
import { stripPriceFromTitle, stripAllPromoPhrases } from '@/lib/utils';

const POPULAR_BRANDS = Array.from(new Set([
  'Alexander McQueen', 'Alpha Industries', 'Bottega Veneta', 'Calvin Klein', 'Canada Goose',
  'Dolce & Gabbana', 'Massimo Dutti', 'New Balance', 'Ralph Lauren', 'Saint Laurent',
  'Stone Island', 'The North Face', 'Tommy Hilfiger', 'Under Armour', 'Zadig & Voltaire',
  'Acne Studios', 'Axel Arigato', 'Birkenstock', 'CP Company', 'Fred Perry', 'Heron Preston',
  'Isabel Marant', 'North Face', 'Palm Angels', 'Pull & Bear', 'Stradivarius', 'Ted Baker',
  'Timberland', 'Adidas', 'adidas Originals', 'AllSaints', 'Arcteryx', "Arc'teryx",
  'Asics', 'Autry', 'Ba&sh', 'Balenciaga', 'Barbour', 'Bershka', 'Champion', 'Columbia',
  'Converse', 'Diesel', 'Ellesse', 'Ferragamo', 'Givenchy', 'Gant', 'Gucci', 'Hackett',
  'Hugo Boss', 'Jacquemus', 'Jordan', 'Kappa', 'Kenzo', 'Lacoste', "Levi's®", "Levi's",
  'Levis', 'Loewe', 'Maje', 'Mango', 'Miu Miu', 'Miumiu', 'Moncler', 'Moschino',
  'Napapijri', 'Nike', 'Off-White', 'Patagonia', 'Paul Smith', 'Prada', 'Puma',
  'Reebok', 'Reiss', 'Rick Owens', 'Sandro', 'Schott', 'Supreme', 'Stüssy', 'The Kooples',
  'Uniqlo', 'Valentino', 'Vans', 'Versace', 'Veja', 'Y3', 'Celine', 'Dior', 'Fendi', 'Fila',
  'Gap', 'Iro', 'A.P.C.', 'Ami', 'Sacai', 'Kapital', 'Corteiz', 'Crtz', 'Hellstar', 'Sp5der',
  'Denim Tears', 'Weekday', 'Terranova', 'Pinko', 'Marella', 'Mother', 'Les Deux',
  'Han Kjøbenhavn', 'Elisabetta Franchi', 'MM6 Maison Margiela', 'Maison Margiela', 'Umbro',
  'FAVELA', "aim'n", "aim'n®", '032c', 'Carhartt WIP', 'Carhartt', 'Dickies', 'Guess',
  'Dr. Martens', 'Superdry', 'Burberry', 'Armani', 'Claudie Pierlot', 'Sézane', 'Sezane',
  'Rouje', 'Musier', 'Sessun', 'Des Petits Hauts', 'Vanessa Bruno', 'Gerard Darel',
  'Gérard Darel', 'Comptoir des Cotonniers', 'Petit Bateau', 'Jacadi', 'Soeur',
  'Pull&Bear', 'Lioness', 'JDY', 'Phoenix', 'Firebird', 'Adibreak',
  // Marques Zalando fréquentes
  'Munthe', 'Adolfo Dominguez', 'Cinq à Sept', 'Samsøe Samsøe', 'Gestuz',
  'Baum und Pferdgarten', 'Atelier de roupa', "Don't Waste Culture", 'Volcom', 'Burocs',
  'Fabienne Chapot', 'Rotate', 'Ganni', 'Stine Goya', 'Remain', 'Envii', 'Pieces',
  'Only', 'Vero Moda', 'Object', 'Selected Femme', 'Selected', 'Jack & Jones', 'Vila',
  'Noisy May', 'Y.A.S', 'Moss Copenhagen', 'Scotch & Soda', 'Tommy Jeans',
  'Polo Ralph Lauren', 'Emporio Armani', 'EA7', 'Karl Lagerfeld',
  'Liu Jo', 'Patrizia Pepe', 'Twinset', 'Max Mara', 'Weekend Max Mara',
  'Sportmax', 'Iceberg', 'Blauer', 'Herno', 'Jaded London', 'Vivienne Westwood',
  'Marine Serre', 'By Far', 'Nümph', 'Ichi', 'b.young', 'Naf Naf',
  'MISBHV', 'Paco Rabanne', 'Courrèges', 'Nanushka', 'Toteme', 'Aeron',
  'Filippa K', 'Tiger of Sweden', 'Nudie Jeans', 'Arket', 'COS', 'Monki',
])).sort((a, b) => b.length - a.length);

/**
 * Utilitaires pour l'extraction et la normalisation des marques produit.
 */

/** Extrait la marque du nom produit. Gère les cas "Marque - Produit" et "MarqueProduit". */
export function getProductBrand(name: string | null, sourceBrand: string | null): string | null {
  if (!name || !name.trim()) return safeDisplayBrand(sourceBrand);
  const n = name.trim();

  // 1. Essayer de découper par séparateur (Nike - Sweat)
  const parts = n.split(/\s*[–\-|:]\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 0) {
    const first = parts[0];
    if (isRetailerBrand(first) && parts.length > 1) {
      return safeDisplayBrand(parts[1].split(/\s+/)[0]) || safeDisplayBrand(sourceBrand);
    }
    // Cas Zalando: "Claudie PierlotTEE" → marque connue collée à un nom de modèle
    const firstLower = first.toLowerCase();
    for (const brand of POPULAR_BRANDS) {
      const bLower = brand.toLowerCase();
      if (firstLower.startsWith(bLower) && firstLower.length > bLower.length) {
        // La marque est suivie d'un nom de modèle collé sans espace → retourner juste la marque
        return brand;
      }
    }
    const display = safeDisplayBrand(first);
    if (display) return display;
  }

  // 2. Essayer de détecter une marque au début du nom (DieselBLESS -> Diesel)
  const nLower = n.toLowerCase();
  for (const brand of POPULAR_BRANDS) {
    const bLower = brand.toLowerCase();
    // Si le nom commence exactement par la marque (ex: Diesel...)
    if (nLower.startsWith(bLower)) {
      // Retourner le nom propre de la marque depuis notre liste POPULAR_BRANDS
      return brand;
    }
  }

  // 3. Fallback sur le premier mot
  const firstWord = n.split(/\s+/)[0];
  return safeDisplayBrand(firstWord) || safeDisplayBrand(sourceBrand);
}

/** Extrait le nom de modèle collé à la marque (ex: "Claudie PierlotTEE" → "TEE") */
export function extractModelName(rawBrandPlusModel: string, brand: string): string | null {
  const b = brand.trim();
  const raw = rawBrandPlusModel.trim();
  if (!raw.toLowerCase().startsWith(b.toLowerCase())) return null;
  const suffix = raw.slice(b.length).trim();
  // Le suffix est le nom de modèle si c'est du texte non vide et pas juste de la ponctuation
  if (suffix && !/^[-–|:\s]+$/.test(suffix)) return suffix;
  return null;
}

/** Nettoie le nom du produit en retirant la marque et les prix.
 *  Si un nom de modèle est collé à la marque (ex: "Claudie PierlotTEE - T-shirt"),
 *  il est conservé en préfixe du titre final → "TEE - T-shirt à manches longues".
 */
export function cleanProductName(name: string, brand: string | null): string {
  if (!name) return '';

  // 1. Supprimer les prix
  let out = stripPriceFromTitle(name);
  if (!out) return '';

  if (!brand || brand === 'Elite') return out;

  const b = brand.trim();
  const escaped = b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Détecter si le premier segment contient "MarqueNomModèle" collé (ex: "Claudie PierlotTEE")
  const firstSegment = out.split(/\s*[-–|:]\s*/)[0]?.trim() ?? '';
  const modelName = extractModelName(firstSegment, b);

  // Enlever la marque (+ nom de modèle collé) du début
  const reWithModel = new RegExp(`^\\s*${escaped}\\S*\\s*[-–|:]\\s*`, 'gi');
  const reClean = new RegExp(`^\\s*${escaped}\\s*[-–|:]\\s*|\\s*[-–|:]\\s*${escaped}\\s*$|^\\s*${escaped}\\s*`, 'gi');

  if (modelName) {
    // Cas 1 : "MarqueModèle - Type produit" → enlever "MarqueModèle - " et préfixer avec "Modèle - "
    const reWithModelAndSep = new RegExp(`^\\s*${escaped}\\S*\\s*[-–|:]\\s*`, 'gi');
    const hasSeperator = /[-–|:]/.test(out);

    if (hasSeperator) {
      out = out.replace(reWithModelAndSep, '');
      if (modelName.length > 1 && out.toLowerCase() !== modelName.toLowerCase()) {
        out = `${modelName} - ${out}`;
      }
    } else {
      // Cas 2 : "MarqueModèle" sans séparateur → juste le modèle
      out = modelName;
    }
  } else {
    out = out.replace(reClean, ' ');
    // Cas "NIKEjogging" : si ça commence encore par la marque sans séparateur
    if (out.toLowerCase().startsWith(b.toLowerCase())) {
      out = out.slice(b.length);
    }
  }

  // 2. Supprimer les phrases promo (ASOS etc.)
  out = stripAllPromoPhrases(out);

  return out.replace(/\s+/g, ' ').trim() || name;
}

/** Clé normalisée pour regroupement (insensible à la casse). */
export function getBrandKey(brand: string): string {
  return brand.trim().toLowerCase();
}

/** Vérifie si deux noms de marque correspondent (insensible à la casse). */
export function brandsMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return getBrandKey(a) === getBrandKey(b);
}
