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
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      // Connexion réussie : redirection vers onboarding si demandé, sinon dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      window.location.href = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      setError('Une erreur est survenue. Vérifiez votre connexion.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4">
      <Card className="w-full max-w-md border-2 shadow-modern-lg">
        <CardHeader className="space-y-4 text-center">
          <div>
            <CardTitle className="text-3xl font-bold">Connexion</CardTitle>
            <div className="w-12 h-1 bg-gradient-to-r from-primary via-secondary to-accent mx-auto mt-3 rounded-full"></div>
          </div>
          <CardDescription className="text-base font-medium">
            Accédez à votre compte OUTFITY
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            />

            <Input
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="default"
              className="w-full shadow-modern-lg"
              loading={loading}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground font-medium">
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
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-muted/20">Chargement…</div>}>
      <SignInContent />
    </Suspense>
  );
}
