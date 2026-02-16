'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      router.push('/auth/signin?registered=true&redirect=/auth/choose-plan');
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col justify-center items-center bg-gradient-to-br from-background via-muted/20 to-background px-4 py-12 safe-area-padding overflow-y-auto">
      <div className="w-full max-w-md space-y-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2 ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <Card className="w-full border-2 shadow-modern-lg">
          <CardHeader className="space-y-4 text-center">
            <div>
              <CardTitle className="text-3xl font-bold">Créer un compte</CardTitle>
              <div className="w-12 h-1 bg-gradient-to-r from-primary via-secondary to-accent mx-auto mt-3 rounded-full"></div>
            </div>
            <CardDescription className="text-base font-medium">
              Commencez votre parcours vers votre première marque
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
                type="text"
                label="Nom"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

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

              <Input
                type="password"
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="default"
                className="w-full shadow-modern-lg"
                loading={loading}
              >
                Créer mon compte
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground font-medium">
              <span>Déjà un compte ? </span>
              <Link
                href="/auth/signin"
                className="text-primary hover:underline font-semibold"
              >
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
