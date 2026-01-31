/**
 * Matcher pour associer les types de produits aux spécialités des usines
 * 
 * Permet de filtrer automatiquement les usines selon le type de produit
 */

// Mapping des types de produits vers les spécialités d'usines
const PRODUCT_TYPE_TO_SPECIALTIES: Record<string, string[]> = {
  // Tops
  'T-shirt': ['Jersey', 'Cotton', 'Knitwear'],
  'Shirt': ['Cotton', 'Shirting', 'Woven'],
  'Polo': ['Pique', 'Cotton', 'Knitwear'],
  'Hoodie': ['Fleece', 'Jersey', 'Knitwear'],
  'Sweatshirt': ['Fleece', 'Jersey', 'Knitwear'],
  'Sweater': ['Knitwear', 'Wool', 'Cashmere'],
  'Tank Top': ['Jersey', 'Cotton'],
  
  // Bottoms
  'Jeans': ['Denim', 'Cotton'],
  'Cargo': ['Cotton', 'Canvas', 'Technical'],
  'Chinos': ['Cotton', 'Woven'],
  'Shorts': ['Cotton', 'Jersey', 'Woven'],
  'Trousers': ['Cotton', 'Woven', 'Technical'],
  'Joggers': ['Jersey', 'Fleece', 'Technical'],
  
  // Outerwear
  'Jacket': ['Technical', 'Canvas', 'Nylon', 'Polyester'],
  'Coat': ['Wool', 'Cashmere', 'Technical'],
  'Bomber': ['Nylon', 'Polyester', 'Technical'],
  'Parka': ['Technical', 'Nylon', 'Polyester'],
  'Blazer': ['Wool', 'Cotton', 'Woven'],
  
  // Accessories
  'Cap': ['Cotton', 'Canvas', 'Technical'],
  'Beanie': ['Knitwear', 'Wool', 'Acrylic'],
  'Bag': ['Canvas', 'Leather', 'Nylon'],
  'Backpack': ['Nylon', 'Polyester', 'Technical'],
  
  // Underwear
  'Underwear': ['Cotton', 'Modal', 'Bamboo'],
  'Socks': ['Cotton', 'Wool', 'Bamboo'],
};

// Mapping des matériaux vers les spécialités
const MATERIAL_TO_SPECIALTIES: Record<string, string[]> = {
  'Cotton': ['Cotton', 'Jersey', 'Woven'],
  'Denim': ['Denim'],
  'Wool': ['Wool', 'Knitwear'],
  'Cashmere': ['Cashmere', 'Knitwear'],
  'Leather': ['Leather'],
  'Nylon': ['Nylon', 'Technical'],
  'Polyester': ['Polyester', 'Technical'],
  'Jersey': ['Jersey', 'Knitwear'],
  'Fleece': ['Fleece', 'Knitwear'],
  'Canvas': ['Canvas', 'Technical'],
  'Modal': ['Modal', 'Cotton'],
  'Bamboo': ['Bamboo', 'Cotton'],
};

/**
 * Trouver les spécialités correspondant à un type de produit
 */
export function getSpecialtiesForProductType(productType: string): string[] {
  const typeLower = productType.toLowerCase();
  
  // Chercher une correspondance exacte
  for (const [key, specialties] of Object.entries(PRODUCT_TYPE_TO_SPECIALTIES)) {
    if (key.toLowerCase() === typeLower) {
      return specialties;
    }
  }
  
  // Chercher une correspondance partielle
  for (const [key, specialties] of Object.entries(PRODUCT_TYPE_TO_SPECIALTIES)) {
    if (typeLower.includes(key.toLowerCase()) || key.toLowerCase().includes(typeLower)) {
      return specialties;
    }
  }
  
  // Par défaut, retourner des spécialités générales
  return ['Cotton', 'Jersey', 'Woven'];
}

/**
 * Trouver les spécialités correspondant à un matériau
 */
export function getSpecialtiesForMaterial(material: string | null): string[] {
  if (!material) return [];
  
  const materialLower = material.toLowerCase();
  
  // Chercher une correspondance exacte
  for (const [key, specialties] of Object.entries(MATERIAL_TO_SPECIALTIES)) {
    if (key.toLowerCase() === materialLower) {
      return specialties;
    }
  }
  
  // Chercher une correspondance partielle
  for (const [key, specialties] of Object.entries(MATERIAL_TO_SPECIALTIES)) {
    if (materialLower.includes(key.toLowerCase()) || key.toLowerCase().includes(materialLower)) {
      return specialties;
    }
  }
  
  return [];
}

/**
 * Filtrer les usines selon un type de produit
 */
export function filterFactoriesByProduct<T extends { specialties: string[] }>(
  factories: T[],
  productType: string,
  material?: string | null
): T[] {
  const typeSpecialties = getSpecialtiesForProductType(productType);
  const materialSpecialties = material ? getSpecialtiesForMaterial(material) : [];
  
  // Combiner les spécialités (type + matériau)
  const allSpecialties = [...new Set([...typeSpecialties, ...materialSpecialties])];
  
  // Filtrer les usines qui ont au moins une spécialité correspondante
  return factories.filter((factory) => {
    return factory.specialties.some((specialty) => {
      const specialtyLower = specialty.toLowerCase();
      return allSpecialties.some((requiredSpecialty) => {
        return specialtyLower.includes(requiredSpecialty.toLowerCase()) ||
               requiredSpecialty.toLowerCase().includes(specialtyLower);
      });
    });
  });
}

/**
 * Obtenir les spécialités recommandées pour un produit
 */
export function getRecommendedSpecialties(
  productType: string,
  material?: string | null
): string[] {
  const typeSpecialties = getSpecialtiesForProductType(productType);
  const materialSpecialties = material ? getSpecialtiesForMaterial(material) : [];
  
  return [...new Set([...typeSpecialties, ...materialSpecialties])];
}
