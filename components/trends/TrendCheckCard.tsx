'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

export function TrendCheckCard() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    matchInZones: string[];
    analysis?: { cut: string; productSignature: string };
    message: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append('image', uploadFile);
      const res = await fetch('/api/trends/check-trend-image', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadResult({
          matchInZones: data.matchInZones || [],
          analysis: data.analysis,
          message: data.message || '',
        });
      } else {
        setUploadResult({ matchInZones: [], message: data.error || 'Erreur' });
      }
    } catch (e) {
      setUploadResult({
        matchInZones: [],
        message: e instanceof Error ? e.message : 'Erreur',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg">Est-ce une tendance ?</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Uploadez une image produit ; le système indique si c&apos;est une tendance (Europe, USA, Asie).
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setUploadFile(e.target.files?.[0] ?? null);
              setUploadResult(null);
            }}
            className="text-sm max-w-[220px]"
          />
          <Button
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
            size="sm"
            className="gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Analyser
          </Button>
        </div>
        {uploadResult && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-medium">{uploadResult.message}</p>
            {uploadResult.matchInZones?.length > 0 && (
              <p className="text-primary mt-1">Zones : {uploadResult.matchInZones.join(', ')}</p>
            )}
            {uploadResult.analysis && (
              <p className="text-muted-foreground mt-1">
                Coupe : {uploadResult.analysis.cut} · Signature : {uploadResult.analysis.productSignature}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
