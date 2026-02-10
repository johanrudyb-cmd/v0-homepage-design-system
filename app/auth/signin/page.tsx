'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Inclure les cookies dans la requête (important pour cross-origin)
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Afficher l'erreur spécifique retournée par le serveur
        const errorMsg = data.error || data.details || 'Email ou mot de passe incorrect';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Stocker le header X-Auth-Cookie-Set pour vérification
      const cookieSetHeader = response.headers.get('X-Auth-Cookie-Set');

      // Connexion réussie : vérifier que le cookie est bien défini avant de rediriger
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      const target = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
      
      // En production, attendre plus longtemps pour que le cookie soit propagé
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const initialDelay = isProduction ? 1000 : 400; // Augmenté pour production
      const maxAttempts = 8; // Augmenté pour être sûr
      let attempts = 0;
      
      const checkCookieAndRedirect = () => {
        attempts++;
        const hasCookie = document.cookie.includes('auth-token');
        
        // Vérifier aussi le header X-Auth-Cookie-Set si présent (stocké dans la closure)
        const cookieConfirmed = hasCookie || cookieSetHeader === 'true';
        
        if (cookieConfirmed || attempts >= maxAttempts) {
          // Cookie présent ou max tentatives atteint : rediriger
          if (cookieConfirmed) {
            console.log('[SignIn] Cookie confirmé, redirection vers', target);
          } else {
            console.warn('[SignIn] Cookie non confirmé après', attempts, 'tentatives, redirection quand même');
          }
          router.push(target);
        } else {
          // Attendre un peu plus et réessayer
          setTimeout(checkCookieAndRedirect, 250);
        }
      };
      
      // Démarrer la vérification après le délai initial
      setTimeout(checkCookieAndRedirect, initialDelay);
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      setError('Une erreur est survenue. Vérifiez votre connexion.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4 py-8 safe-area-padding overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        <Card className="w-full border-2 shadow-modern-lg">
          <CardHeader className="space-y-4 text-center px-4 sm:px-6 pt-6 sm:pt-8">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold">Connexion</CardTitle>
              <div className="w-12 h-1 bg-gradient-to-r from-primary via-secondary to-accent mx-auto mt-3 rounded-full"></div>
            </div>
            <CardDescription className="text-sm sm:text-base font-medium">
              Accédez à votre compte OUTFITY
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-error bg-error/10 border-2 border-error/20 rounded-lg font-medium">
                  {error}
                </div>
              )}

              <Input
                type="email"
                label="Email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                type="password"
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="default"
                className="w-full shadow-modern-lg min-h-[48px]"
                loading={loading}
              >
                Se connecter
              </Button>
            </form>

            <div className="mt-6 sm:mt-8 text-center text-sm text-muted-foreground font-medium">
              <span>Pas encore de compte ? </span>
              <Link
                href="/auth/signup"
                className="text-primary hover:underline font-semibold"
              >
                Créer un compte
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-muted/20">Chargement…</div>}>
      <SignInContent />
    </Suspense>
  );
}
