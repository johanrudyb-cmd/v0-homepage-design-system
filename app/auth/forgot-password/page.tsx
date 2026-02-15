'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added useRouter import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter(); // Added useRouter initialization
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4 py-8 safe-area-padding overflow-y-auto">
            <div className="w-full max-w-md my-auto">
                <Link
                    href="/auth/signin"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Retour à la connexion
                </Link>

                <Card className="w-full border-2 shadow-modern-lg">
                    <CardHeader className="space-y-4 text-center px-4 sm:px-6 pt-6 sm:pt-8">
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-bold">Récupération</CardTitle>
                            <div className="w-12 h-1 bg-gradient-to-r from-primary via-secondary to-accent mx-auto mt-3 rounded-full"></div>
                        </div>
                        <CardDescription className="text-sm sm:text-base font-medium">
                            Saisissez votre email pour réinitialiser votre mot de passe
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-8">
                        {success ? (
                            <div className="space-y-6 text-center">
                                <div className="p-4 text-sm text-green-600 bg-green-50 border-2 border-green-100 rounded-lg font-medium">
                                    Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé.
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Vérifiez vos spams si vous ne recevez rien d'ici quelques minutes.
                                </p>
                                <Button variant="outline" className="w-full shadow-sm" onClick={() => router.push('/auth/signin')}>
                                    Revenir à la connexion
                                </Button>
                                {/* Added the new button as per instruction, assuming it's an additional option */}
                                <Button onClick={() => router.push('/auth/forgot-password')}>
                                    Demander un nouveau lien
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                    className="bg-background/50"
                                />

                                <Button
                                    type="submit"
                                    variant="default"
                                    className="w-full shadow-modern-lg min-h-[48px]"
                                    loading={loading}
                                >
                                    Envoyer le lien
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
