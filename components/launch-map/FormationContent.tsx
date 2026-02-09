'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  PlayCircle,
  Calendar,
  Sparkles,
  Video,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FORMATION_CONFIG } from '@/lib/formation-config';
import type { FormationModule } from '@/lib/formation-config';

function getEmbedUrl(url: string): string | null {
  try {
    const u = url.trim();
    const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  } catch {
    return null;
  }
}

function FormationVideoEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;
  return (
    <iframe
      src={embedUrl}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="absolute inset-0 w-full h-full"
    />
  );
}

function ModuleCard({ module, isOpen, onToggle }: { module: FormationModule; isOpen: boolean; onToggle: () => void }) {
  const hasVideo = module.videoUrl && getEmbedUrl(module.videoUrl);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-transform',
          isOpen ? 'bg-primary text-primary-foreground rotate-0' : 'bg-muted text-muted-foreground'
        )}>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{module.title}</span>
            {module.duration && (
              <Badge variant="outline" className="text-xs font-normal">
                {module.duration}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{module.description}</p>
        </div>
        <Video className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </button>
      {isOpen && (
        <div className="border-t border-border px-4 pb-4 pt-2">
          <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
          {hasVideo ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border border-border">
              <FormationVideoEmbed url={module.videoUrl} title={module.title} />
            </div>
          ) : (
            <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
              <div className="text-center px-4">
                <PlayCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Vidéo à venir</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Ajoutez l&apos;URL dans <code className="bg-muted px-1 rounded">formation-config.ts</code>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FormationContent() {
  const config = FORMATION_CONFIG;
  const [openModuleId, setOpenModuleId] = useState<string | null>(config.modules[0]?.id ?? null);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
        {/* Hero */}
        <Card className="overflow-hidden border-2 border-primary/20">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
              <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl bg-primary/20 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{config.title}</h1>
                <p className="text-lg font-medium text-primary/90 mb-2">{config.tagline}</p>
                <p className="text-muted-foreground mb-4">{config.description}</p>
                <Badge variant="secondary" className="text-sm px-3 py-1.5">
                  {config.modules.length} modules · Mini formation gratuite
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Modules avec vidéos (style Skool) */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">Modules de la formation</h2>
            <p className="text-sm text-muted-foreground">
              Suivez les modules dans l&apos;ordre pour poser les bases de votre personal branding.
            </p>
          </div>
          <div className="space-y-2">
            {config.modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isOpen={openModuleId === module.id}
                onToggle={() => setOpenModuleId((prev) => (prev === module.id ? null : module.id))}
              />
            ))}
          </div>
        </div>

        {/* Coaching personnalisé (optionnel) */}
        <Card className="border-2 border-primary/25 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {config.coachingTitle} — {config.coachingPrice} €/mois
            </CardTitle>
            <CardDescription>
              {config.coachingDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Optionnel : si vous souhaitez un accompagnement personnalisé pour appliquer concrètement votre stratégie.
              </p>
              {config.coachingUrl ? (
                <Link href={config.coachingUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <Sparkles className="w-5 h-5" />
                    Réserver mon coaching
                  </Button>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 px-4 py-2 bg-muted/30">
                  <p className="text-muted-foreground text-xs">
                    Ajoutez le lien de paiement dans <code className="bg-muted px-1 rounded">formation-config.ts</code> (coachingUrl)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Réserver un appel Calendly */}
        <Card className="border-2 border-primary/15">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Des questions ?
                </h2>
                <p className="text-muted-foreground text-sm">
                  Réservez un appel gratuit pour poser vos questions et en savoir plus.
                </p>
              </div>
              {config.calendlyUrl ? (
                <Link href={config.calendlyUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                    <Calendar className="w-5 h-5" />
                    Réserver un appel
                  </Button>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 px-4 py-2 bg-muted/30">
                  <p className="text-muted-foreground text-xs">
                    Ajoutez votre lien Calendly dans <code className="bg-muted px-1 rounded">formation-config.ts</code>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
