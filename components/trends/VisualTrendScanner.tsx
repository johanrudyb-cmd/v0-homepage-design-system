'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Sparkles, Loader2, Target, Zap, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AnalysisResult {
    category: string;
    style: string;
    tags: string[];
    materials: string[];
    colors: string[];
    trendScore: number;
    analysis: string;
    cyclePhase: 'emergent' | 'croissance' | 'pic' | 'declin';
    marketAdvice: string;
    dbMatches: any[];
}

export function VisualTrendScanner() {
    const [image, setImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setImage(base64);
            setResult(null);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleScan = async () => {
        if (!image) return;
        setIsScanning(true);
        setError(null);

        try {
            const res = await fetch('/api/trends/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de l'analyse");

            setResult(data.analysis);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const reset = () => {
        setImage(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                    <Camera className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Analyseur de tendances visuel</h2>
                <p className="text-muted-foreground text-lg max-w-2xl font-light">
                    Uploadez une photo d&apos;un vêtement ou d&apos;un accessoire. Notre IA l&apos;analyse et la croise avec notre base de tendances mondiale pour vous donner un verdict.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Zone d'Upload / Preview */}
                <div className="space-y-6">
                    <Card className="overflow-hidden border-2 border-dashed border-black/10 bg-black/[0.01] hover:bg-black/[0.02] transition-colors">
                        <CardContent className="p-0">
                            {image ? (
                                <div className="relative aspect-[3/4] group">
                                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Changer</Button>
                                        <Button variant="destructive" onClick={reset}>Supprimer</Button>
                                    </div>
                                    {isScanning && (
                                        <div className="absolute inset-x-0 h-1 bg-primary shadow-[0_0_15px_rgba(0,122,255,0.8)] animate-visual-scan z-10" />
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="aspect-[3/4] flex flex-col items-center justify-center cursor-pointer p-12"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-20 h-20 rounded-full bg-white shadow-apple flex items-center justify-center mb-6">
                                        <Upload className="w-8 h-8 text-primary" />
                                    </div>
                                    <p className="text-xl font-semibold mb-2">Cliquez pour uploader</p>
                                    <p className="text-muted-foreground text-sm">PNG, JPG ou WEBP jusqu&apos;à 10MB</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                    />

                    {image && !result && (
                        <Button
                            className="w-full h-14 text-lg font-bold rounded-2xl gap-3 shadow-apple-lg hover:shadow-apple-xl transition-all"
                            onClick={handleScan}
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Analyse par l&apos;IA en cours...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Lancer l&apos;analyse visuelle
                                </>
                            )}
                        </Button>
                    )}

                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {/* Résultats */}
                <div className="space-y-6">
                    {result ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            {/* Score Card */}
                            <Card className="bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] text-white border-none shadow-apple-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Target className="w-32 h-32" />
                                </div>
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                                            <span className="text-4xl font-bold">{result.trendScore}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold">Trend Score</h3>
                                            <p className="text-white/60">Potentiel de marché actuel</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                            result.cyclePhase === 'emergent' ? "bg-blue-500" :
                                                result.cyclePhase === 'croissance' ? "bg-green-500" :
                                                    result.cyclePhase === 'pic' ? "bg-orange-500" : "bg-red-500"
                                        )}>
                                            {result.cyclePhase}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10">
                                            {result.style}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tags & Colors */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-white shadow-apple border-black/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold opacity-50 uppercase tracking-tighter">Matières</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.materials.map(m => (
                                                <span key={m} className="px-2 py-1 rounded-md bg-muted text-[10px] font-bold">{m}</span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white shadow-apple border-black/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold opacity-50 uppercase tracking-tighter">Palette</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.colors.map(c => (
                                                <div key={c} className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.toLowerCase() }} />
                                                    <span className="text-[10px] font-bold">{c}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* AI Analysis */}
                            <Card className="bg-white shadow-apple border-black/5">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-primary" />
                                        Analyse Business IA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-[#1D1D1F]/70 leading-relaxed italic">"{result.analysis}"</p>
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="text-xs font-bold text-primary mb-1 uppercase">Conseil Stratégique</p>
                                        <p className="text-sm font-medium">{result.marketAdvice}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* DB Matches */}
                            {result.dbMatches.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-tighter opacity-50">Produits similaires détectés</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {result.dbMatches.map((match: any) => (
                                            <div key={match.id} className="flex items-center gap-3 p-2 rounded-xl bg-white border border-black/5 shadow-apple-sm">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                                    <img src={match.imageUrl} alt={match.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold truncate leading-tight">{match.name}</p>
                                                    <p className="text-[10px] text-green-600 font-bold">{match.trendScore}% Trend</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={reset}>
                                Nouvelle analyse
                            </Button>
                        </div>
                    ) : (
                        <Card className="h-full border-none bg-black/[0.03] flex flex-col items-center justify-center p-12 text-center">
                            <Sparkles className="w-12 h-12 text-black/10 mb-6" />
                            <p className="text-muted-foreground">Une fois l&apos;image uploadée, notre IA scannera chaque détail visuel, recoupera les données avec les ventes en Europe et vous donnera un score de viabilité commerciale.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
