import { handlers } from '@/lib/auth';

// Forcer Node.js runtime pour éviter les problèmes avec Edge Runtime
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
