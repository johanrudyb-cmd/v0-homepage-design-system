/**
 * Générateur de messages email pour les fournisseurs
 * 
 * Crée des messages pré-remplis avec les infos de la tendance
 */

import { TrendSignal } from './trend-detector';
import { TrendPrediction } from './trend-predictor';

export interface SupplierEmailData {
  subject: string;
  body: string;
  productDetails: {
    type: string;
    cut: string | null;
    material: string | null;
    color: string | null;
    style: string | null;
    averagePrice: number;
    quantity?: number;
    targetPrice?: number;
  };
}

/**
 * Générer un email pour un fournisseur basé sur une tendance
 */
export function generateSupplierEmail(
  trend: TrendSignal | TrendPrediction,
  options?: {
    quantity?: number;
    targetPrice?: number;
    customMessage?: string;
    factoryName?: string;
  }
): SupplierEmailData {
  const productDetails = {
    type: trend.productType,
    cut: trend.cut || null,
    material: trend.material || null,
    color: trend.color || null,
    style: trend.style || null,
    averagePrice: 'averagePrice' in trend ? trend.averagePrice : 0,
    quantity: options?.quantity,
    targetPrice: options?.targetPrice,
  };

  const subject = generateSubject(trend, options);
  const body = generateBody(trend, productDetails, options);

  return {
    subject,
    body,
    productDetails,
  };
}

/**
 * Générer le sujet de l'email
 */
function generateSubject(
  trend: TrendSignal | TrendPrediction,
  options?: { factoryName?: string }
): string {
  const productName = trend.productName || trend.productType;
  
  if (options?.factoryName) {
    return `Demande de devis - ${productName} - ${options.factoryName}`;
  }
  
  return `Demande de devis - ${productName}`;
}

/**
 * Générer le corps de l'email
 */
function generateBody(
  trend: TrendSignal | TrendPrediction,
  productDetails: SupplierEmailData['productDetails'],
  options?: {
    quantity?: number;
    targetPrice?: number;
    customMessage?: string;
    factoryName?: string;
    techPackUrl?: string;
  }
): string {
  const parts: string[] = [];

  // Salutation
  if (options?.factoryName) {
    parts.push(`Bonjour ${options.factoryName},`);
  } else {
    parts.push('Bonjour,');
  }

  parts.push('');
  parts.push('Nous souhaitons obtenir un devis pour la production du produit suivant :');
  parts.push('');

  // Détails du produit (essentiels uniquement)
  parts.push('PRODUIT');
  parts.push('─'.repeat(40));
  parts.push(`Type : ${productDetails.type}`);
  
  if (productDetails.cut) {
    parts.push(`Coupe : ${productDetails.cut}`);
  }
  
  if (productDetails.material) {
    parts.push(`Matériau : ${productDetails.material}`);
  }
  
  if (productDetails.color) {
    parts.push(`Couleur : ${productDetails.color}`);
  }

  parts.push('');

  // Quantité et prix cible
  parts.push('INFORMATIONS COMMERCIALES');
  parts.push('─'.repeat(40));
  
  if (options?.quantity) {
    parts.push(`Quantité souhaitée : ${options.quantity} pièces`);
  } else {
    parts.push('Quantité souhaitée : [À préciser]');
  }
  
  if (options?.targetPrice) {
    parts.push(`Prix cible : ${options.targetPrice.toFixed(2)}€ par pièce`);
  }

  parts.push('');

  // Tech Pack
  if (options?.techPackUrl) {
    parts.push('TECH PACK');
    parts.push('─'.repeat(40));
    parts.push(`Le tech pack détaillé est disponible ici : ${options.techPackUrl}`);
    parts.push('(Voir pièce jointe si envoyé par email)');
    parts.push('');
  }

  // Message personnalisé
  if (options?.customMessage) {
    parts.push('INFORMATIONS COMPLÉMENTAIRES');
    parts.push('─'.repeat(40));
    parts.push(options.customMessage);
    parts.push('');
  }

  // Questions standard
  parts.push('MERCI DE NOUS FOURNIR');
  parts.push('─'.repeat(40));
  parts.push('• Prix unitaire selon la quantité');
  parts.push('• Délai de production');
  parts.push('• MOQ (Minimum Order Quantity)');
  parts.push('• Échantillons disponibles');
  parts.push('• Certifications (si applicable)');
  parts.push('');

  // Fermeture
  parts.push('Nous restons à votre disposition pour toute question.');
  parts.push('');
  parts.push('Cordialement,');
  parts.push('[Votre Nom]');
  parts.push('[Votre Marque]');

  return parts.join('\n');
}

/**
 * Générer un email court (version concise)
 */
export function generateShortSupplierEmail(
  trend: TrendSignal | TrendPrediction,
  quantity: number,
  targetPrice?: number,
  techPackUrl?: string
): string {
  const productName = trend.productName || trend.productType;
  
  let email = `Bonjour,

Nous souhaitons produire : ${productName}
${trend.cut ? `Coupe : ${trend.cut}` : ''}
${trend.material ? `Matériau : ${trend.material}` : ''}

Quantité : ${quantity} pièces
${targetPrice ? `Prix cible : ${targetPrice.toFixed(2)}€` : ''}
${techPackUrl ? `\nTech pack : ${techPackUrl}` : ''}

Pouvez-vous nous envoyer un devis avec :
- Prix unitaire
- Délai de production
- MOQ

Merci,
[Votre Nom]`;

  return email;
}
