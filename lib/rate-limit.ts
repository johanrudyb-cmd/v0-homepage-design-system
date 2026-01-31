/**
 * Rate Limiting pour les routes API
 * Protection contre les abus et les attaques
 */

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number; // Fenêtre en millisecondes
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Store en mémoire (pour développement)
// En production, utiliser Redis (Upstash) pour la persistance
const store: RateLimitStore = {};

/**
 * Rate limiting simple en mémoire
 * Pour production, utiliser Upstash Redis
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const key = identifier;
  
  // Nettoyer les entrées expirées (garde seulement les 1000 dernières)
  if (Object.keys(store).length > 1000) {
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
  }

  // Vérifier si la clé existe
  if (!store[key] || store[key].resetTime < now) {
    // Nouvelle fenêtre
    store[key] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: store[key].resetTime,
    };
  }

  // Incrémenter le compteur
  store[key].count += 1;

  if (store[key].count > options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    };
  }

  return {
    success: true,
    remaining: options.maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  };
}

/**
 * Rate limiting par utilisateur
 */
export async function rateLimitByUser(
  userId: string,
  endpoint: string,
  options: RateLimitOptions
) {
  return rateLimit(`${userId}:${endpoint}`, options);
}

/**
 * Rate limiting par IP
 */
export async function rateLimitByIP(
  ip: string,
  endpoint: string,
  options: RateLimitOptions
) {
  return rateLimit(`${ip}:${endpoint}`, options);
}

/**
 * Helper pour extraire l'IP depuis une requête
 */
export function getClientIP(request: Request): string {
  // Vérifier les headers proxy (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
