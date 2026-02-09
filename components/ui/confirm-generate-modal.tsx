'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ConfirmGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Libellé de l'action (ex. "Générer les scripts") */
  actionLabel: string;
  /** Utilisations restantes (−1 = illimité) */
  remaining: number;
  /** Limite totale du mois */
  limit: number;
  loading?: boolean;
  /** Message supplémentaire (ex. "Cela se déduit de vos quotas. La stratégie restera consultable pendant 1 mois.") */
  extraMessage?: string;
  /** Libellé du bouton de confirmation (défaut: "Générer") */
  confirmLabel?: string;
}

/**
 * Modal de confirmation avant génération IA.
 * Affiche "Êtes-vous sûr ?" + nombre d'utilisations restantes.
 */
export function ConfirmGenerateModal({
  open,
  onClose,
  onConfirm,
  actionLabel,
  remaining,
  limit,
  loading = false,
  extraMessage,
  confirmLabel = 'Générer',
}: ConfirmGenerateModalProps) {
  if (!open) return null;

  const isUnlimited = remaining < 0 || limit >= 999;
  const remainingText = isUnlimited
    ? 'Utilisation illimitée'
    : `${remaining} utilisation${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} sur ${limit} ce mois`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-background shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold pr-8 mb-2">Confirmer la génération</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Êtes-vous sûr de lancer &quot;{actionLabel}&quot; ?
        </p>
        <div className="rounded-lg bg-muted/50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-foreground">
            {remainingText}
          </p>
        </div>
        {extraMessage && (
          <p className="text-sm text-muted-foreground mb-6">{extraMessage}</p>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Chargement…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
