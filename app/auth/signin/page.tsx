'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <Card className="w-full max-w-md border border-stone-200 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-light tracking-wide text-center">
            Connexion
          </CardTitle>
          <CardDescription className="text-center text-stone-600">
            Accédez à votre compte SaaS Mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
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
              variant="primary"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-3"
              loading={loading}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-600">
            <span className="font-light">Pas encore de compte ? </span>
            <Link
              href="/auth/signup"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
