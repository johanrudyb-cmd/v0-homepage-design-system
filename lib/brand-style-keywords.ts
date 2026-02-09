/**
 * Mappe les marques d'inspiration (référence) vers des mots-clés techniques de design
 * pour le prompt Ideogram (Creative Director). Aligné sur lib/constants/audience-reference-brands.
 */

export const STYLE_MAPPER: Record<string, string> = {
  // 18-24 Gen Z — Streetwear, Gorpcore, Fast-Fashion
  Corteiz: 'Brutalist, urban, high-contrast, bold outlines',
  Hellstar: 'Dark streetwear, gothic, bold typography, raw edges',
  'Jaded London': 'Y2K, bold graphics, playful streetwear, statement type',
  Trapstar: 'Urban UK, bold lettering, street credibility, high-contrast',
  'No Faith Studios': 'Streetwear, graphic bold, raw aesthetic',
  Zara: 'Clean commercial, minimalist typography, fast-fashion polish',
  'Broken Planet': 'Sustainable streetwear, bold graphics, eco-conscious',
  'Minus Two': 'Minimal streetwear, clean lines, understated bold',
  PACCBET: 'Russian streetwear, bold geometric, industrial',
  // 25-34 Millennials — Parisian Minimalist, Smart Casual, Gorpcore
  'Ami Paris': 'Parisian casual, heart motif, clean typography, accessible luxury',
  'Our Legacy': 'Scandinavian minimal, refined typography, understated',
  Arket: 'Nordic minimal, functional, clean sans-serif, muted palette',
  "Arc'teryx": 'Technical, topographic, gorpcore, functionalist',
  'Axel Arigato': 'Scandi minimal, clean lines, subtle branding',
  Nanushka: 'Soft minimal, organic shapes, sustainable luxury',
  Ganni: 'Playful Scandinavian, bold but soft, contemporary',
  'A.P.C.': 'Parisian minimal, raw denim aesthetic, understated typography',
  'Maison Kitsuné': 'Paris-Japan fusion, fox motif, preppy minimal',
  'Wood Wood': 'Scandinavian streetwear, graphic minimal, urban',
  // 35-50 actifs — Smart Casual, Quiet Luxury, Workwear
  'Massimo Dutti': 'Refined commercial, Spanish elegance, clean typography',
  'Loro Piana': 'Quiet luxury, cashmere soft, no-logo subtle',
  'Carhartt WIP': 'Workwear heritage, durable, industrial utility',
  Boglioli: 'Italian tailoring, soft structure, understated',
  Canali: 'Italian luxury tailoring, refined, classic typography',
  "Tod's": 'Italian luxury, driving shoe heritage, understated',
  Façonnable: 'French Mediterranean, nautical preppy, clean',
  Hackett: 'British tailoring, heritage, classic lettering',
  Barbour: 'British outdoor heritage, waxed jacket, country',
  Santoni: 'Italian leathercraft, refined, artisanal',
  // Femmes 18-35 — Luxe accessible, Minimaliste, Fast-Fashion
  Jacquemus: 'Parisian, airy, minimalist, organic line art',
  Sandro: 'Parisian contemporary, feminine minimal, clean',
  Maje: 'Parisian feminine, soft edge, accessible luxury',
  Rouje: 'French girl, vintage-inspired, romantic typography',
  Reformation: 'Sustainable feminine, California cool, clean type',
  COS: 'Architectural minimal, clean geometry, muted tones',
  Mango: 'Spanish commercial, modern minimal, accessible',
  'Musier Paris': 'Parisian feminine, vintage flair, soft graphics',
  'Paloma Wool': 'Artistic knitwear, organic, playful minimal',
  Staud: 'California minimal, structured bags, clean lines',
  // Femmes 35-50 — Quiet Luxury, Parisian Minimalist
  'The Row': 'Ultra minimal, luxury quiet, no branding',
  Khaite: 'Quiet luxury, sculptural, understated',
  Toteme: 'Scandinavian luxury minimal, modular, clean',
  Lemaire: 'Parisian minimal, architectural, refined',
  Loewe: 'Art-led luxury, craft, surreal minimal',
  'Old Céline': 'Phoebe Philo era, minimal, architectural',
  'Max Mara': 'Italian coat heritage, understated luxury',
  Joseph: 'British refined minimal, clean tailoring',
  'Phoebe Philo': 'Minimal architectural, quiet luxury, sculptural',
  'Jil Sander': 'Pure minimal, no-frill luxury, clean typography',
  // Hommes 18-35 — Néo-Vintage Sport, Streetwear, Gorpcore
  'Aimé Leon Dore': 'Vintage sport, elevated streetwear, warm palette',
  Represent: 'British streetwear, clean graphics, premium feel',
  Salomon: 'Trail running, technical, gorpcore utility',
  Kith: 'Lifestyle streetwear, collab culture, clean branding',
  Rhude: 'Luxury streetwear, vintage Americana, bold',
  Autry: 'Vintage American sport, retro typography',
  'Fear of God (Essentials)': 'Minimal luxury streetwear, oversized, muted',
  Stüssy: 'Heritage streetwear, surf-skate, iconic script',
  JJJJound: 'Minimal lifestyle, muted palette, no-brand aesthetic',
  // Hommes 35-50 — Smart Casual, Workwear, Industrial
  'Officine Générale': 'French workwear-inspired, refined industrial',
  'Stone Island': 'Technical fabric, badge, industrial sport',
  Dickies: 'Workwear heritage, durable, utilitarian',
  Filson: 'American heritage, outdoor utility, durable',
  'C.P. Company': 'Italian sport utility, goggle hood, technical',
  'Engineered Garments': 'American workwear, patchwork, utilitarian',
  "Drake's": 'British tailoring, sprezzatura, classic',
  Belstaff: 'British motor heritage, waxed leather, adventure',
  // Unisexe 18-30 — Streetwear, Heritage, Eco-Basics
  Supreme: 'Box logo culture, streetwear hype, bold branding',
  Palace: 'British skate, tri-ferg, playful bold',
  'Colorful Standard': 'Organic basics, soft colors, minimal',
  Vans: 'Skate heritage, checkerboard, off-the-wall',
  Converse: 'All Star heritage, classic sneaker, timeless',
  Pangaia: 'Science-led sustainable, pastel tech, eco',
  Telfar: 'Shopping bag icon, democratic luxury, bold',
  'Marine Serre': 'Crescent moon, upcycled, futuristic',
  '1989 Studio': 'Minimal unisexe, clean lines, understated',
  // Unisexe 25-45 — Minimaliste, Parisian, Eco-Basics
  'Studio Nicholson': 'Architectural minimal, unisexe, clean',
  Sunspel: 'British basics, quality cotton, understated',
  'Norse Projects': 'Scandinavian minimal, functional, clean',
  Patagonia: 'Outdoor activism, environmental, functional',
  Veja: 'Sustainable sneakers, minimal, French',
  Asket: 'Traceable minimal, no logo, reduced',
  'Margaret Howell': 'British minimal, quality, understated',
  Auralee: 'Japanese minimal, texture, soft palette',
  // Urbains 18-35 — Industrial, Gorpcore, Techwear
  'A-Cold-Wall*': 'Industrial British, concrete aesthetic, raw',
  '1017 ALYX 9SM': 'Technical hardware, buckle, industrial',
  'Nike ACG': 'All Conditions Gear, technical, outdoor',
  'Snow Peak': 'Japanese outdoor, titanium, minimal utility',
  'White Mountaineering': 'Japanese outdoor, technical minimal',
  GR10K: 'Technical minimal, performance, European',
  Affix: 'Technical wear, modular, industrial',
  'Post Archive Faction': 'Korean technical, deconstructed, avant-garde',
  // Professionnels 30-50 — Quiet Luxury, Smart Casual
  'Brunello Cucinelli': 'Italian cashmere luxury, understated',
  Zegna: 'Italian tailoring, fabric-first, refined',
  Theory: 'Modern tailoring, clean lines, urban professional',
  Vince: 'California luxury casual, soft minimal',
  SuitSupply: 'Modern tailoring, accessible, sharp',
  Reiss: 'British contemporary, smart casual',
  Dunhill: 'British luxury, heritage, refined',
  // Étudiants / J. Actifs — Fast-Fashion Tailoring, Néo-Vintage Sport
  Bershka: 'Young fast-fashion, trend-led, bold graphics',
  'Pull&Bear': 'Youth casual, relaxed, accessible',
  Weekday: 'Scandi fast-fashion, minimal, sustainable',
  'Adidas Originals': 'Sport heritage, three stripes, retro',
  'New Balance': 'Running heritage, NB logo, dad shoe',
  Uniqlo: 'Japanese basics, functional minimal, accessible',
  Reserved: 'Polish fast-fashion, modern commercial',
  'H&M': 'High-street commercial, trend-led, accessible',
  Champion: 'Sport heritage, reverse weave, casual',
  // Lifestyle premium — Luxe accessible, Design
  'Maison Margiela': 'Deconstructed, anonymous, tabi',
  'Dries Van Noten': 'Eclectic print, artistic, bold pattern',
  Prada: 'Luxury minimal, triangle logo, intellectual',
  'Miu Miu': 'Playful luxury, feminine edge, bold',
  'Rick Owens': 'Dark avant-garde, drape, gothic minimal',
  Casablanca: 'Retro glamour, silk prints, vacation',
  'Acne Studios': 'Scandinavian avant-garde, clean bold',
  // Sportifs / outdoor — Gorpcore, Sportswear, Performance
  Nike: 'Sleek, minimalist, aerodynamic, athletic vectors',
  'Under Armour': 'Performance athletic, technical, bold',
  'On Running': 'Swiss running, cloud sole, minimal',
  Haglöfs: 'Nordic outdoor, functional, reliable',
  Mammut: 'Alpine outdoor, technical, mountain',
  Descente: 'Japanese sport, technical, winter',
  Goldwin: 'Japanese outdoor, technical minimal',
  Oakley: 'Sport performance, shield logo, technical',
  Hoka: 'Maximal cushion running, bold sole',
  'District Vision': 'Mindful running, minimal, California',
};

const DEFAULT_STYLE = 'Modern streetwear';

/**
 * Retourne les mots-clés techniques pour une marque d'inspiration.
 * Insensible à la casse ; retourne le fallback si la marque n'est pas dans le mapper.
 */
export function getTechnicalStyleKeywords(inspirationBrand: string | undefined): string {
  if (!inspirationBrand || !inspirationBrand.trim()) return DEFAULT_STYLE;
  const trimmed = inspirationBrand.trim();
  const exact = STYLE_MAPPER[trimmed];
  if (exact) return exact;
  const lower = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(STYLE_MAPPER)) {
    if (key.toLowerCase() === lower) return value;
  }
  return DEFAULT_STYLE;
}
