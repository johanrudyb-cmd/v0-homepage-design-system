/**
 * Utilitaire pour proxyfier les URLs d'images externes
 * Évite les problèmes de CORS et de referrer
 */

export function proxyImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // Si l'URL est déjà une URL locale ou un data URI, la retourner telle quelle
    if (url.startsWith('/') || url.startsWith('data:')) {
        return url;
    }

    // Si l'URL est externe, la proxyfier
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    return url;
}

/**
 * Variante pour Next.js Image component qui nécessite un loader
 */
export function imageLoader({ src }: { src: string }) {
    if (src.startsWith('/') || src.startsWith('data:')) {
        return src;
    }

    if (src.startsWith('http://') || src.startsWith('https://')) {
        return `/api/proxy-image?url=${encodeURIComponent(src)}`;
    }

    return src;
}
