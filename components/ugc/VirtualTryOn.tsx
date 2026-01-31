'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Image as ImageIcon, Upload } from 'lucide-react';
import { UGCContentHistory } from './UGCContentHistory';

interface Design {
  id: string;
  type: string;
  flatSketchUrl: string | null;
}

interface VirtualTryOnProps {
  brandId: string;
  designs: Design[];
}

export function VirtualTryOn({ brandId, designs }: VirtualTryOnProps) {
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [garmentType, setGarmentType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSelectedDesign('');
    }
  };

  const handleGenerate = async () => {
    if (!selectedDesign && !uploadedFile) {
      setError('Veuillez sélectionner un design ou uploader un fichier');
      return;
    }

    if (!garmentType) {
      setError('Veuillez sélectionner le type de vêtement');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      let designUrl = '';

      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('brandId', brandId);

        const uploadResponse = await fetch('/api/ugc/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Erreur lors de l\'upload');
        }

        const uploadData = await uploadResponse.json();
        designUrl = uploadData.url;
      } else if (selectedDesign) {
        const design = designs.find((d) => d.id === selectedDesign);
        if (design?.flatSketchUrl) {
          designUrl = design.flatSketchUrl;
        }
      }

      if (!designUrl) {
        throw new Error('Aucune image disponible');
      }

      const response = await fetch('/api/ugc/virtual-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          designUrl,
          garmentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setResult(data.imageUrl);
      setShowHistory(false);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectFromHistory = (content: any) => {
    setResult(content.content);
    setShowHistory(false);
  };

  return (
    <div className="space-y-6">
      {/* Historique */}
      {showHistory && (
        <UGCContentHistory
          brandId={brandId}
          contentType="virtual_tryon"
          onSelect={handleSelectFromHistory}
        />
      )}

      {!showHistory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Virtual Try-On</CardTitle>
                  <CardDescription className="font-medium">
                    Générez une image de mannequin portant votre design
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(true)}
                  className="border-2"
                  size="sm"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Historique
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sélection design existant */}
              {designs.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Utiliser un design existant
                  </label>
                  <select
                    value={selectedDesign}
                    onChange={(e) => {
                      setSelectedDesign(e.target.value);
                      setUploadedFile(null);
                    }}
                    className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    disabled={isGenerating}
                  >
                    <option value="">Sélectionner un design...</option>
                    {designs.map((design) => (
                      <option key={design.id} value={design.id}>
                        {design.type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* OU Upload */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {designs.length > 0 ? 'OU' : ''} Uploader un logo/design
                </label>
                <div className="border-2 border-dashed border-input rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer bg-muted/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isGenerating}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-primary mx-auto" />
                        <div className="text-sm font-semibold text-foreground">
                          {uploadedFile.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Cliquez pour changer
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                        <div className="text-sm font-semibold text-foreground">
                          Cliquez pour uploader
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          PNG, JPG jusqu'à 10MB
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Type de vêtement */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Type de vêtement *
                </label>
                <select
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  disabled={isGenerating}
                >
                  <option value="">Sélectionner...</option>
                  <option value="T-shirt">T-shirt</option>
                  <option value="Hoodie">Hoodie</option>
                  <option value="Sweatshirt">Sweatshirt</option>
                  <option value="Pantalon">Pantalon</option>
                  <option value="Short">Short</option>
                  <option value="Veste">Veste</option>
                </select>
              </div>

              {error && (
                <div className="p-4 text-sm text-error bg-error/10 border-2 border-error/20 rounded-lg font-medium">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (!selectedDesign && !uploadedFile) || !garmentType}
                className="w-full shadow-modern-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer le Virtual Try-On'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Résultat */}
          {result && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Résultat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-border rounded-xl p-4 bg-muted/30">
                  <img
                    src={result}
                    alt="Virtual Try-On"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = result;
                      link.download = `virtual-tryon-${Date.now()}.jpg`;
                      link.click();
                    }}
                    className="shadow-modern-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(true)}
                    className="border-2"
                  >
                    Voir l'historique
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
