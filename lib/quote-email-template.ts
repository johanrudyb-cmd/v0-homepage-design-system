/**
 * Template email demande de devis — premier contact professionnel.
 * Remplace les placeholders par les infos du vêtement (type, coupe, matière).
 */

const FRENCH_COUNTRIES = ['France', 'Portugal', 'FR', 'PT', 'france', 'portugal'];

export function isForeignSupplier(country: string): boolean {
  const c = (country || '').trim().toLowerCase();
  return !FRENCH_COUNTRIES.some((fc) => fc.toLowerCase() === c);
}

export interface QuoteTemplateInput {
  type: string;           // hoodie, t-shirt, etc.
  cut?: string | null;
  material?: string | null;
  factoryName: string;
  brandName?: string;
  useEnglish: boolean;
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function buildQuoteEmail(input: QuoteTemplateInput): { subject: string; body: string } {
  const type = capitalize(input.type || 'produit');
  const brand = input.brandName || '[Votre Marque]';

  if (input.useEnglish) {
    return {
      subject: `Quote request - ${type}`,
      body: `Dear ${input.factoryName},

We are ${brand}, a fashion brand, and we are looking for a production partner for our upcoming collection.

We would like to request a quote for the following item:

PRODUCT
${'─'.repeat(40)}
Type: ${type}
${input.cut ? `Cut: ${input.cut}\n` : ''}${input.material ? `Material: ${input.material}\n` : ''}
Please find the technical pack for this ${type.toLowerCase()} attached to this email (PDF).

COMMERCIAL INFORMATION
${'─'.repeat(40)}
Quantity: [To be specified]
Target price per unit: [To be specified]

We would appreciate if you could provide:
• Unit price according to quantity
• Production lead time
• MOQ (Minimum Order Quantity)
• Sample availability
• Certifications (if applicable)

Thank you for your time. We look forward to hearing from you.

Best regards,
[Your Name]
${brand}`,
    };
  }

  // Français
  return {
    subject: `Demande de devis - ${type}`,
    body: `Bonjour ${input.factoryName},

Nous sommes ${brand}, une marque de mode, et nous recherchons un partenaire de production pour notre prochaine collection.

Nous souhaiterions obtenir un devis pour le produit suivant :

PRODUIT
${'─'.repeat(40)}
Type : ${type}
${input.cut ? `Coupe : ${input.cut}\n` : ''}${input.material ? `Matière : ${input.material}\n` : ''}
Veuillez trouver le tech pack détaillé pour ce ${type.toLowerCase()} en pièce jointe (PDF).

INFORMATIONS COMMERCIALES
${'─'.repeat(40)}
Quantité : [À préciser]
Prix cible unitaire : [À préciser]

Nous vous serions reconnaissants de nous communiquer :
• Prix unitaire selon la quantité
• Délai de production
• MOQ (Quantité minimale de commande)
• Disponibilité d'échantillons
• Certifications (le cas échéant)

Merci pour votre attention. Nous restons à votre disposition pour toute question.

Cordialement,
[Votre Nom]
${brand}`,
  };
}
