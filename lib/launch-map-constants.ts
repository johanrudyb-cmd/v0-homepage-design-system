/** Constantes des phases du Launch Map — fichier léger pour éviter de charger les composants lourds dans le layout */
export const LAUNCH_MAP_PHASES = [
  { id: 0, title: 'Identité', subtitle: 'Identité de marque', description: 'Nom de la marque et produit principal recommandé' },
  { id: 1, title: 'Stratégie marketing', subtitle: 'Marque d’inspiration', description: 'Choisissez une grande marque dans votre style et calquez sa stratégie' },
  { id: 2, title: 'Mockup', subtitle: 'Création visuelle', description: 'Apprenez à créer votre design et téléchargez votre pack de mockup' },
  { id: 3, title: 'Tech Pack', subtitle: 'Fiche technique', description: 'Transformez votre mockup en fiche technique et définissez les dimensions' },
  { id: 4, title: 'Sourcing', subtitle: 'Demande de devis', description: 'Contactez au moins 2 usines du Hub pour obtenir des devis' },
  { id: 5, title: 'Création du site', subtitle: 'Boutique Shopify', description: 'Connectez votre compte Shopify pour lancer votre boutique' },
] as const;
