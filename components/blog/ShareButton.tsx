'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface ShareButtonProps {
    title: string;
    text?: string;
    className?: string;
    iconClassName?: string;
}

export function ShareButton({ title, text, className, iconClassName }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleShare = async () => {
        const url = window.location.href;

        // Essayer l'API native de partage (mobile / supporté)
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
                return;
            } catch (err) {
                // Ignorer l'erreur d'annulation ou non-support, fallback vers clipboard
                console.log('Share canceled or not supported, falling back to clipboard');
            }
        }

        // Fallback : copier dans le presse-papier
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast({
                title: "Lien copié !",
                message: "L'URL de l'article a été copiée dans votre presse-papier.",
                duration: 2000,
                type: 'success',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            toast({
                title: "Erreur",
                message: "Impossible de copier le lien.",
                type: "error",
            });
        }
    };

    return (
        <button
            onClick={handleShare}
            className={cn(
                "rounded-full border border-black/5 flex items-center justify-center transition-all shadow-apple-sm",
                className
            )}
            aria-label="Partager l'article"
        >
            {copied ? (
                <Check className={cn("text-green-500", iconClassName)} />
            ) : (
                <Share2 className={iconClassName} />
            )}
        </button>
    );
}
