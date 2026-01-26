'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Factory {
  id: string;
  name: string;
}

interface RequestQuoteModalProps {
  factory: Factory;
  brandId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestQuoteModal({
  factory,
  brandId,
  onClose,
  onSuccess,
}: RequestQuoteModalProps) {
  const [message, setMessage] = useState('');
  const [designId, setDesignId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          factoryId: factory.id,
          designId: designId || undefined,
          message: message || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-stone-200">
        <CardHeader>
          <CardTitle className="text-xl font-light tracking-wide">
            Demander un devis
          </CardTitle>
          <CardDescription className="font-light">
            {factory.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre projet, quantité souhaitée, etc."
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[100px]"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-stone-300 text-stone-700 font-light tracking-wide uppercase text-xs py-2"
                disabled={isSending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSending}
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-2"
              >
                {isSending ? 'Envoi...' : 'Envoyer la demande'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
