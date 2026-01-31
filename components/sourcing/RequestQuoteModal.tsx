'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Mail, Eye } from 'lucide-react';

interface Factory {
  id: string;
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

interface RequestQuoteModalProps {
  factory: Factory;
  brandId: string;
  onClose: () => void;
  onSuccess: () => void;
  preFilledMessage?: string;
  preFilledSubject?: string;
}

export function RequestQuoteModal({
  factory,
  brandId,
  onClose,
  onSuccess,
  preFilledMessage,
  preFilledSubject,
}: RequestQuoteModalProps) {
  const [message, setMessage] = useState(preFilledMessage || '');
  const [designId, setDesignId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');

    try {
      // Si un designId est fourni, récupérer l'URL du tech pack
      let techPackUrl = undefined;
      if (designId) {
        try {
          const designResponse = await fetch(`/api/designs/${designId}`);
          if (designResponse.ok) {
            const designData = await designResponse.json();
            // Le tech pack peut être dans designData.techPack ou designData.flatSketchUrl
            techPackUrl = designData.design?.techPack?.url || designData.design?.flatSketchUrl;
          }
        } catch (err) {
          console.warn('Impossible de récupérer le tech pack:', err);
        }
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          factoryId: factory.id,
          designId: designId || undefined,
          message: message || undefined,
          techPackUrl: techPackUrl || undefined,
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
            {preFilledSubject && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  Sujet de l'email :
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  {preFilledSubject}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Design associé (optionnel)
              </label>
              <Input
                type="text"
                value={designId}
                onChange={(e) => setDesignId(e.target.value)}
                placeholder="ID du design (pour inclure le tech pack)"
                className="mb-4"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-stone-700">
                  Message pour le fournisseur
                </label>
                {preFilledMessage && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmailPreview(!showEmailPreview)}
                      className="gap-1 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      {showEmailPreview ? 'Masquer' : 'Aperçu'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(message);
                        alert('Message copié dans le presse-papier !');
                      }}
                      className="gap-1 text-xs"
                    >
                      <Copy className="w-3 h-3" />
                      Copier
                    </Button>
                    {factory.contactEmail && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const subject = preFilledSubject || 'Demande de devis';
                          const body = encodeURIComponent(message);
                          window.open(`mailto:${factory.contactEmail}?subject=${encodeURIComponent(subject)}&body=${body}`);
                        }}
                        className="gap-1 text-xs"
                      >
                        <Mail className="w-3 h-3" />
                        Ouvrir Email
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {showEmailPreview && preFilledMessage && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Aperçu de l'email :
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                    {message}
                  </div>
                </div>
              )}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre projet, quantité souhaitée, etc."
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[150px]"
              />
              {preFilledMessage && (
                <div className="mt-1 text-xs text-muted-foreground">
                  💡 Message pré-rempli depuis la tendance détectée. Vous pouvez le modifier.
                </div>
              )}
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
