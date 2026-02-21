/** Mots-clés pour exclure chaussures / baskets / chaussettes (vêtements uniquement). */
export const EXCLUDE_SHOES_KEYWORDS = [
    'basket', 'baskets', 'chaussure', 'chaussures', 'sneaker', 'sneakers',
    'shoe', 'shoes', 'bottine', 'bottines', 'sandale', 'sandales', 'botte', 'bottes',
    'bottes de neige', 'botte de neige', 'escarpin', 'escarpins', 'running', 'trainer', 'trainers', 'footwear',
    'boot', 'boots', 'loafer', 'loafers', 'mule', 'mules', 'slip-on', 'tuff terra', 'snow boot',
    'chaussons', 'chausson', 'chaussette', 'chaussettes', 'sock', 'socks',
    'derby', 'derbies', 'ballerine', 'ballerines', 'mocassin', 'mocassins', 'bottillon', 'bottillons', 'richelieu', 'sabot', 'sabots',
    'talons', 'heels', 'clog', 'clogs', 'tennis', 'pantoufle', 'slippers',
    'cuissarde', 'cuissardes', 'thigh high', 'over the knee',
];

/** Sous-vêtements et maillots de bain à exclure. */
export const EXCLUDE_UNDERWEAR_KEYWORDS = [
    'sous-vêtement', 'sous-vetement', 'slip homme', 'slip femme', ' slip ', 'slip ',
    'boxer short', 'boxers short', 'boxeur', 'boxeurs', 'boxer ',
    'lot de boxer', 'lot boxer', 'lots de boxer', 'lots boxer', 'lot boxers',
    'caleçon', 'calecon', 'caleçons', 'calecons',
    'culotte homme', 'culotte femme', ' culotte', 'culotte ',
    'string homme', ' string ', 'string ',
    'brief ', 'underwear',
    'maillot de bain', 'maillot de bains', 'maillot bain', 'maillots de bain',
    'bikini', 'bikinis',
    'soutien-gorge', 'soutien gorge', 'brassière', 'brassiere', 'pyjama ', 'nuisette',
];

/** Sacs à exclure (pas "bag" seul : exclurait "baggy"). */
export const EXCLUDE_BAG_KEYWORDS = [
    'sac à main', 'sac a main', 'sac à dos', 'sac a dos', 'sac bandoulière', 'sac bandouliere',
    'tote bag', 'backpack', 'portefeuille', 'porte-monnaie', 'porte monnaie',
    'cabas', 'sac cabas', 'shopping bag', 'sac shopping',
    ' sac ', 'sac à ', 'sac a ', 'sac main', 'sac ', ' sac',
    'bag ', ' bag ', ' bag', 'bags', 'handbag', 'handbags', 'clutch',
    'sacoche', 'shoulder bag', 'messenger bag', 'satchel', 'crossbody', 'waist bag', 'fanny pack', 'banane', 'bum bag',
    'pochette', 'wallet', 'purse', 'trousse', 'case',
];

/** Parfums à exclure. */
export const EXCLUDE_PERFUME_KEYWORDS = [
    'parfum', 'parfums', 'perfume', 'perfumes', 'eau de toilette', 'eau de parfum',
    'fragrance', 'fragrances', 'flacon', 'spray', 'scent', 'cologne', 'mist', 'brume',
    ' edp', ' edt', 'edp ', 'edt ', ' eau ',
];

/** Accessoires à exclure (on garde vêtements uniquement). */
export const EXCLUDE_ACCESSORIES_KEYWORDS = [
    'lunettes', 'lunette de soleil', 'montre', 'montres', 'ceinture', 'ceintures',
    'bijou', 'bijoux', 'accessoire', 'accessoires', 'accessories', 'necklace',
    'bracelet', 'bracelets', 'belt', 'watch', 'glasses', 'casquette', 'chapeau',
    'cap ', ' hat ', 'écharpe', 'echarpe', 'scarf', 'gants', 'gant ', ' gant ', 'gloves', 'glove', 'collier',
    'moufle', 'moufles', 'mitten', 'mittens',
    'bag bandoulière', 'sac bandoulière', 'autres accessoires', 'maroquinerie',
    'petite maroquinerie', 'cache-oreilles', 'cache oreilles',
    'sunglasses', 'eyewear', 'beanie', 'bonnet', 'tie', 'cravate', 'umbrella', 'parapluie',
    'casquettes', 'caps', 'hats', 'chapeaux', 'beret', 'bob ', 'bucket hat',
    'lunette', 'glasses', 'sunglasses', 'eyewear', 'monture', 'montures', 'lunetier',
    'masque', 'mask', 'masques',
];

/** Bijoux et non-vêtements à exclure (vêtements uniquement). */
export const EXCLUDE_JEWELRY_KEYWORDS = [
    'boucle d\'oreille', 'boucles d\'oreille', 'boucles d’oreilles', 'earring', 'earrings',
    'bague', 'bagues', 'ring ', 'rings ', 'pendentif', 'pendentifs', 'pendant',
    'broche', 'broches', 'pin ', 'jewelry', 'jewellery', 'parure', 'parures',
    'collier', 'necklace', 'bracelet', 'bracelets', 'anklet', 'chevillère', 'bijoux',
];

/** Lots / Packs à exclure (on veut des articles unitaires). */
export const EXCLUDE_LOTS_KEYWORDS = [
    ' lot ', 'lot de ', 'lots de ', ' lot', 'lot ', ' pack ', 'pack de ', ' pack', 'pack ',
    'set de ', ' set ', 'kit ', ' x2', ' x3', ' x4', ' x5', ' x6', ' x10',
];

/** Pulls / sweats rouges à exclure (demande utilisateur). */
export const EXCLUDE_RED_PULL_KEYWORDS = [
    'pull rouge', 'pull red', 'sweat rouge', 'sweat red', 'pullover rouge', 'pullover red',
    'rouge pull', 'red pull', 'rouge sweat', 'red sweat',
];

/** Électroménager / aspirateurs / équipements à exclure (vêtements uniquement). */
export const EXCLUDE_EQUIPMENT_KEYWORDS = [
    'dyson', 'aspirateur', 'vacuum', 'équipement', 'equipment', 'gear', 'matériel',
    'électronique', 'electronic', 'gadget', 'device', 'appliance', 'mousse', 'foam',
    'yoga mat', 'tapis de yoga', 'dumbbells', 'haltères', 'poids',
];

/** Produits pour cheveux / capillaires à exclure (vêtements uniquement). */
export const EXCLUDE_HAIR_KEYWORDS = [
    'produit pour cheveux', 'produit cheveux', 'produit capillaire', 'produits capillaires',
    'soin pour cheveux', 'soins pour cheveux', 'soin capillaire', 'soins capillaires', 'soin cheveux', 'soins cheveux',
    'hair product', 'hair care', 'hair mask', 'hair oil', 'hair serum', 'hair treatment',
    'shampoo', 'shampoing', 'conditioner', 'après-shampooing', 'apres-shampooing', 'after shampoo',
    'leave-in', 'leave in', 'masque cheveux', 'masque pour les cheveux', 'huile capillaire',
    'sérum capillaire', 'serum capillaire', 'coloration capillaire', 'teinture capillaire',
    'k18', 'brosse à cheveux', 'brosse cheveux', 'brush cheveux',
    'peigne', 'peigne à cheveux', 'peigne a cheveux', 'peigne cheveux', 'comb', 'hair comb',
    'set de cheveux', 'sets de cheveux', 'set cheveux', 'sets cheveux',
    'extension de cheveux', 'extensions de cheveux', 'extension cheveux', 'extensions cheveux',
    'perruque', 'perruques', 'wig', 'wigs', 'postiche', 'postiches',
    'hair set', 'hair piece', 'hair pieces', 'hair extension', 'hair extensions',
    'mèche ', 'mèches ', 'meche ', 'meches ', 'closure',
];

/** Pochettes (porte-cartes, portefeuilles plats) à exclure (vêtements uniquement). */
export const EXCLUDE_POCHETTE_KEYWORDS = [
    'pochette', 'pochettes', 'porte-cartes', 'porte cartes', 'portecartes',
    'card holder', 'cardholder', 'card case',
];

/** Marques non-vêtement à exclure (cosmétiques, beauté, soins) ou marques à retirer (ex. ASOS Design). */
export const EXCLUDE_BRAND_KEYWORDS = [
    'asos design',
    'yope', 'nuxe', 'tangle teezer',
    'shiseido', 'i heart revolution', 'revolution beauty', 'korres',
    'maybelline', 'l\'oréal', 'loreal', 'estee lauder', 'estée lauder', 'clinique',
    'mac cosmetics', 'nyx', 'kiko', 'the ordinary', 'cerave', 'la roche-posay',
    'eucerin', 'bioderma', 'vichy', 'avène', 'caudalie', 'clarins', 'lancôme', 'lancome',
    'junglück',
];

/** Cosmétiques / produits de beauté / savon / crème / brosse à exclure (vêtements uniquement). */
export const EXCLUDE_COSMETICS_KEYWORDS = [
    'rouge à lèvres', 'rouge a levres', 'rouge à lèvre', 'rouge a levre',
    'lipstick', 'lip stick', 'gloss', 'lip gloss', 'gloss à lèvres', 'gloss a levres',
    'eyeshadow', 'fard', 'maquillage', 'mascara',
    'nail', 'vernis', 'crème', 'creme', 'cream', 'brush', 'brosse',
    'brosse à cheveux', 'brosse a cheveux', 'brosse cheveux', 'hair brush',
    'peigne', 'peigne à cheveux', 'peigne a cheveux', 'peigne cheveux', 'comb', 'hair comb',
    'lips', 'blush', 'highlighter', 'concealer', 'foundation', 'hydration mask',
    'repair mask', 'masque réparation',
    'savon', 'soap', 'savonnette', 'savons', 'bar soap', 'liquid soap',
    'produit de beauté', 'produits de beauté', 'beauté', 'beauty', 'cosmétique', 'cosmetic', 'cosmetics',
    'soin visage', 'soin corps', 'skincare', 'skin care', 'make-up', 'makeup', 'soin ', 'soins ',
    'sérum', 'serum', 'huile ', 'oil ', 'démaquillant', 'cleanser', 'tonique', 'moisturizer',
    'gel douche', 'shower gel', 'body wash', 'crayon à lèvres', 'crayon a levres', 'lip liner',
    'crayon yeux', 'eyeliner', 'correcteur', 'concealer', 'face mask', 'masque visage',
    'dentifrice', 'toothpaste', 'déodorant', 'deodorant', 'antiperspirant',
    'mousse à raser', 'shaving foam', 'gel', 'lait corps', 'body lotion',
    'peeling', 'peel', 'mit', 'peeling mit',
];

export function isExcludedProduct(name: string, extraExcludeKeywords: string[] = []): boolean {
    const text = (name || '').toLowerCase();
    const all = [
        ...EXCLUDE_SHOES_KEYWORDS,
        ...EXCLUDE_UNDERWEAR_KEYWORDS,
        ...EXCLUDE_BAG_KEYWORDS,
        ...EXCLUDE_PERFUME_KEYWORDS,
        ...EXCLUDE_ACCESSORIES_KEYWORDS,
        ...EXCLUDE_JEWELRY_KEYWORDS,
        ...EXCLUDE_LOTS_KEYWORDS,
        ...EXCLUDE_EQUIPMENT_KEYWORDS,
        ...EXCLUDE_HAIR_KEYWORDS,
        ...EXCLUDE_POCHETTE_KEYWORDS,
        ...EXCLUDE_BRAND_KEYWORDS,
        ...EXCLUDE_COSMETICS_KEYWORDS,
        ...EXCLUDE_RED_PULL_KEYWORDS,
        ...extraExcludeKeywords,
    ];
    return all.some((kw) => text.includes(kw));
}
