'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Le mot de passe doit faire au moins 8 caractères');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/signin');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <h2 className="text-xl font-bold text-error mb-4">Lien invalide</h2>
                    <p className="text-muted-foreground mb-6">Ce lien de réinitialisation est incomplet ou expiré.</p>
                    <Button onClick={() => router.push('/auth/forgot-password')}>
                        Demander un nouveau lien
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4 py-8 safe-area-padding">
            <div className="w-full max-w-md">
                <Card className="w-full border-2 shadow-modern-lg">
                    <CardHeader className="space-y-4 text-center">
                        <CardTitle className="text-2xl font-bold">Nouveau mot de passe</CardTitle>
                        <CardDescription>
                            Choisissez un mot de passe sécurisé pour votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="space-y-6 text-center">
                                <div className="p-4 text-sm text-green-600 bg-green-50 border-2 border-green-100 rounded-lg font-medium">
                                    Mot de passe réinitialisé avec succès ! Redirection vers la connexion...
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 text-sm text-error bg-error/10 border-2 border-error/20 rounded-lg font-medium">
                                        {error}
                                    </div>
                                )}

                                <Input
                                    type="password"
                                    label="Nouveau mot de passe"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />

                                <Input
                                    type="password"
                                    label="Confirmer le mot de passe"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />

                                <Button
                                    type="submit"
                                    variant="default"
                                    className="w-full shadow-modern-lg min-h-[48px]"
                                    loading={loading}
                                >
                                    Valider le changement
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
