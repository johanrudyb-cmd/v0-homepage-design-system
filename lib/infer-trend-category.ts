/**
 * Infère la catégorie d'un vêtement à partir de son nom.
 * Utilisé lors du scrape pour éviter "Autre" autant que possible.
 */
export function inferCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('hoodie') || n.includes('sweat') || n.includes('pullover')) return 'Hoodie';
  if (n.includes('t-shirt') || n.includes('tee ') || n.includes('tee-shirt')) return 'T-shirt';
  if (n.includes('polo')) return 'Polo';
  if (n.includes('cargo') || n.includes('pantalon cargo')) return 'Cargo';
  if (n.includes('pantalon') || n.includes('pant') || n.includes('chino')) return 'Pantalon';
  if (n.includes('jean') || n.includes('denim')) return 'Jean';
  if (n.includes('short')) return 'Short';
  if (n.includes('blouson') || n.includes('bomber') || n.includes('doudoune')) return 'Blouson';
  if (n.includes('veste') || n.includes('jacket') || n.includes('blazer')) return 'Veste';
  if (n.includes('pull') || n.includes('tricot') || n.includes('cardigan')) return 'Pull';
  if (n.includes('robe') || n.includes('dress')) return 'Robe';
  if (n.includes('jogging') || n.includes('jogger')) return 'Jogging';
  if (n.includes('legging') || n.includes('leggings')) return 'Legging';
  return 'Autre';
}
