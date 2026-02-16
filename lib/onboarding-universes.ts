
import { Sparkles, Zap, Leaf, Moon, ShieldCheck } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface FashionUniverse {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    keywords: string[];
    target: string;
    style: string;
}

export const FASHION_UNIVERSES: FashionUniverse[] = [
    {
        id: 'streetwear',
        name: 'Streetwear Essentials',
        description: 'Coupes oversize, graphismes forts et culture urbaine.',
        icon: Zap,
        color: 'text-orange-500',
        keywords: ['streetwear', 'oversize', 'urbain', 'hoodie', 'communauté'],
        target: 'Génération Z et Millennials urbains',
        style: 'Décontracté, graphique et audacieux'
    },
    {
        id: 'minimalist',
        name: 'Modern Minimalism',
        description: 'Lignes épurées, tons neutres et élégance discrète.',
        icon: Moon,
        color: 'text-slate-900',
        keywords: ['minimalisme', 'épure', 'neutre', 'intemporel', 'qualité'],
        target: 'Professionnels créatifs et amateurs de design épuré',
        style: 'Sobre, élégant et sophistiqué'
    },
    {
        id: 'outdoor',
        name: 'Performance & Techwear',
        description: 'Matériaux techniques, utilité et esthétique futuriste.',
        icon: ShieldCheck,
        color: 'text-blue-600',
        keywords: ['techwear', 'utilitaire', 'fonctionnel', 'futuriste', 'résistance'],
        target: 'Passionnés de technologie et de plein air urbain',
        style: 'Technique, fonctionnel et structuré'
    },
    {
        id: 'eco',
        name: 'Éco-responsable Premium',
        description: 'Matières naturelles, durabilité et éthique.',
        icon: Leaf,
        color: 'text-emerald-600',
        keywords: ['bio', 'durable', 'éthique', 'naturel', 'conscience'],
        target: 'Consommateurs conscients et amateurs de matières bio',
        style: 'Naturel, doux et engagé'
    },
    {
        id: 'premium',
        name: 'Luxe Accessibles',
        description: 'Détails soignés, finitions haut de gamme et exclusivité.',
        icon: Sparkles,
        color: 'text-purple-600',
        keywords: ['premium', 'luxe', 'exclusif', 'détails', 'prestige'],
        target: 'Clientèle exigeante cherchant l\'exclusivité abordable',
        style: 'Haut de gamme, soigné et prestigieux'
    }
];
