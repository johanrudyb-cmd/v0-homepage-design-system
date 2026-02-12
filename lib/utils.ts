import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Noms de fournisseurs IA à ne jamais exposer côté client. */
const AI_PROVIDER_NAMES = [
  'ChatGPT', 'OpenAI', 'GPT-4', 'GPT-4o', 'Claude', 'Anthropic',
  'Ideogram', 'Higgsfield', 'DALL-E', 'CHATGPT_API_KEY', 'ANTHROPIC_API_KEY', 'OPENAI',
];

/**
 * Neutralise les noms d'IA dans un message d'erreur avant envoi au client.
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message || typeof message !== 'string') return message;
  let out = message;
  for (const name of AI_PROVIDER_NAMES) {
    const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, 'IA');
  }
  return out;
}

/**
 * Retire tout prix présent dans le titre (ex. "Sweat Nike 49,99 €" → "Sweat Nike").
 */
export function stripPriceFromTitle(title: string): string {
  if (!title || typeof title !== 'string') return title;
  let out = title.trim();
  // Prix : 49,99 € | 29.99€ | À partir de 29,99 € | from 19.99 £ | (49,99)
  out = out
    .replace(/\s*[-–|·]\s*\d{1,4}[,.]\d{2}\s*[€$£]?\s*(?:EUR|USD|GBP)?\s*$/i, '')
    .replace(/^\s*[-–|·]\s*\d{1,4}[,.]\d{2}\s*[€$£]?\s*(?:EUR|USD|GBP)?\s*/i, '')
    .replace(/(?:à partir de|a partir de|from)\s*\d{1,4}[,.]\d{2}\s*[€$£]?\s*/gi, '')
    .replace(/\d{1,4}[,.]\d{2}\s*[€$£]\s*(?:EUR|USD|GBP)?/gi, '')
    .replace(/\d{1,4}[,.]\d{2}\s*(?:EUR|USD|GBP)/gi, '')
    .replace(/[([]\s*\d{1,4}[,.]\d{2}\s*[€$£]?\s*[)\]]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[-–|·]\s*|\s*[-–|·]\s*$/g, '')
    .trim();
  return out.slice(0, 500);
}

/** Phrases promo / urgence à retirer (titre au-dessus du prix uniquement — Homme et Femme). */
const TITLE_PROMO_PHRASES = [
  'CA PART VITE',
  'ÇA PART VITE',
  'PLUS DE COULEURS',
  'MIX AND MATCH',
  'MIX & MATCH',
  'À PARTIR DE',
  'A PARTIR DE',
  'DERNIÈRES PIÈCES',
  'DERNIERES PIECES',
  'STOCK LIMITÉ',
  'STOCK LIMITE',
  'QUANTITÉ LIMITÉE',
  'QUANTITE LIMITEE',
  'EN RUPTURE',
  'BESTSELLER',
  'NOUVEAU',
  'NEW',
  'SOLDES',
  'PROMO',
  'OFFRE LIMITÉE',
  'OFFRE LIMITEE',
];

/** Couleurs courantes à retirer en fin de titre (après " - "). */
const TITLE_COLOR_WORDS = [
  'NOIR', 'BLANC', 'BLEU', 'ROUGE', 'VERT', 'JAUNE', 'MARRON', 'GRIS', 'ROSE', 'ORANGE', 'VIOLET', 'BEIGE',
  'NAVY', 'KAKI', 'CAMEL', 'BORDEAUX', 'MARINE', 'TURQUOISE', 'CORAL', 'CREAM', 'IVORY', 'CHARCOAL',
  'MULTI', 'MULTICOLORE', 'UNI', 'DENIM',
];

/**
 * Retire les phrases promo quand elles apparaissent en fin de titre (avec ou sans " - " devant).
 * Ex. "... PLUS DE COULEURS ÇA PART VITE" ou "... - ÇA PART VITE"
 */
function stripTrailingPromoPhrases(title: string): string {
  if (!title || typeof title !== 'string') return title;
  let out = title.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const phrase of TITLE_PROMO_PHRASES) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\s*[-–|]?\\s*${escaped}\\s*$`, 'gi');
      if (re.test(out)) {
        out = out.replace(re, '').trim();
        changed = true;
        break;
      }
    }
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Retire en fin de titre : couleur (ex. " - Noir") et phrases promo (ex. " - CA PART VITE", " - PLUS DE COULEURS").
 * Puis retire toute phrase promo restante en fin de chaîne.
 * Garde uniquement nom de marque et intitulé de l'article (titre au-dessus du prix).
 */
export function stripColorAndPromoFromTitle(title: string): string {
  if (!title || typeof title !== 'string') return title;
  let out = title.trim();
  if (!out) return out;
  let changed = true;
  while (changed) {
    changed = false;
    const match = out.match(/\s*[-–|]\s*([^-–|]+)\s*$/);
    if (!match) break;
    const segment = match[1].trim().toUpperCase();
    if (!segment) break;
    const isPromo = TITLE_PROMO_PHRASES.some((p) => segment === p || segment.startsWith(p + ' ') || segment.endsWith(' ' + p));
    const isColor = TITLE_COLOR_WORDS.some((c) => segment === c || segment.startsWith(c + ' ') || segment.endsWith(' ' + c));
    if (isPromo || isColor) {
      out = out.slice(0, match.index).replace(/\s*[-–|]\s*$/, '').trim();
      changed = true;
    } else break;
  }
  out = stripTrailingPromoPhrases(out);
  return out.replace(/\s{2,}/g, ' ').trim().slice(0, 500);
}

/**
 * Retourne l'URL de base de l'application. 
 * En production, utilise NEXT_PUBLIC_APP_URL.
 * Sinon, essaie de deviner ou fallback sur localhost.
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''; // Browser should use relative path
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

/**
 * Nettoie un titre produit : prix, puis couleur et phrases promo.
 */
export function cleanProductTitle(title: string): string {
  if (!title || typeof title !== 'string') return title;
  return stripColorAndPromoFromTitle(stripPriceFromTitle(title)) || title.trim().slice(0, 500);
}
