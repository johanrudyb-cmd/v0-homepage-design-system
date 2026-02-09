/**
 * Fournisseurs affichés sur la page d'accueil — liste fixe, indépendante de l'app et de la BDD.
 * Toujours les mêmes 3 exemples (Chine, Portugal, Turquie) pour illustrer le Sourcing Hub.
 */

export interface HomepageFactory {
  id: string;
  name: string;
  country: string;
  moq: number;
  specialties: string[];
  leadTime: number;
  certifications: string[];
  rating: number | null;
}

export const HOMEPAGE_FEATURED_FACTORIES: HomepageFactory[] = [
  {
    id: 'homepage-chine',
    name: 'Usine Asie Textile',
    country: 'Chine',
    moq: 500,
    specialties: ['T-shirts', 'Sweats', 'Maille'],
    leadTime: 45,
    certifications: ['OEKO-TEX', 'BSCI'],
    rating: 4.6,
  },
  {
    id: 'homepage-portugal',
    name: 'Atelier Portugal Mode',
    country: 'Portugal',
    moq: 100,
    specialties: ['Prêt-à-porter', 'Maille premium', 'Denim'],
    leadTime: 21,
    certifications: ['GOTS', 'OEKO-TEX'],
    rating: 4.8,
  },
  {
    id: 'homepage-turquie',
    name: 'Manufacture Istanbul',
    country: 'Turquie',
    moq: 200,
    specialties: ['Vestes', 'Tricots', 'Cuir'],
    leadTime: 30,
    certifications: ['BSCI', 'Sedex'],
    rating: 4.5,
  },
];
