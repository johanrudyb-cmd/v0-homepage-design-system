'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BlogPostData {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    published: boolean;
    tags: string[];
    relatedBrands: string[];
}

interface BlogPostFormProps {
    initialData?: BlogPostData;
}

export function BlogPostForm({ initialData }: BlogPostFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<BlogPostData>(
        initialData || {
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            coverImage: '',
            published: false,
            tags: [],
            relatedBrands: [],
        }
    );

    const [tagsInput, setTagsInput] = useState(initialData?.tags.join(', ') || '');
    const [brandsInput, setBrandsInput] = useState(initialData?.relatedBrands.join(', ') || '');

    const handleChange = (field: keyof BlogPostData, value: string | boolean) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            if (field === 'title' && !initialData) {
                // Auto-generate slug from title only for new posts
                newData.slug = value
                    .toString()
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
                relatedBrands: brandsInput.split(',').map((b) => b.trim()).filter(Boolean),
            };

            const url = initialData?.id ? `/api/blog/${initialData.id}` : '/api/blog';
            const method = initialData?.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Une erreur est survenue');
            }

            toast({
                title: initialData ? 'Article modifié !' : 'Article créé !',
                message: 'Vos changements ont été enregistrés avec succès.',
                type: 'success',
            });

            router.push('/admin/blog');
            router.refresh();
        } catch (error) {
            toast({
                title: 'Erreur',
                message: error instanceof Error ? error.message : 'Impossible d\'enregistrer l\'article',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Link href="/admin/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la liste
                </Link>
                <div className="flex items-center gap-3">
                    {initialData?.id && (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={loading}
                            onClick={async () => {
                                if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
                                    setLoading(true);
                                    try {
                                        const res = await fetch(`/api/blog/${initialData.id}`, { method: 'DELETE' });
                                        if (res.ok) {
                                            toast({ title: 'Article supprimé', message: 'L\'article a été retiré avec succès.', type: 'success' });
                                            router.push('/admin/blog');
                                            router.refresh();
                                        }
                                    } catch (e) {
                                        toast({ title: 'Erreur', message: 'Impossible de supprimer', type: 'error' });
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                        >
                            Supprimer
                        </Button>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {initialData ? 'Mettre à jour' : 'Créer l\'article'}
                    </Button>
                </div>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold">Informations principales</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titre de l'article</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Ex: Comment lancer sa marque..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => handleChange('slug', e.target.value)}
                            placeholder="comment-lancer-sa-marque"
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="coverImage">URL Image de couverture</Label>
                        <Input
                            id="coverImage"
                            value={formData.coverImage || ''}
                            onChange={(e) => handleChange('coverImage', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sourceUrl">URL Source (Optionnel)</Label>
                        <Input
                            id="sourceUrl"
                            value={(formData as any).sourceUrl || ''}
                            onChange={(e) => handleChange('sourceUrl' as any, e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="excerpt">Extrait (SEO & Liste)</Label>
                    <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => handleChange('excerpt', e.target.value)}
                        placeholder="Un court résumé qui donne envie de lire..."
                        rows={3}
                    />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked: boolean | 'indeterminate') => handleChange('published', checked === true)}
                    />
                    <Label htmlFor="published" className="font-medium cursor-pointer">
                        Publier cet article immédiatement
                    </Label>
                </div>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold">Contenu & Métadonnées</h2>

                <div className="space-y-2">
                    <Label htmlFor="content">Contenu (Markdown supporté)</Label>
                    <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        placeholder="# Titre principal\n\nVotre contenu ici..."
                        className="min-h-[400px] font-mono text-sm"
                        required
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                        <Input
                            id="tags"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="Streetwear, Eco-responsable, Marketing"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brands">Marques liées (pour MAJ IA)</Label>
                        <Input
                            id="brands"
                            value={brandsInput}
                            onChange={(e) => setBrandsInput(e.target.value)}
                            placeholder="nike, patagonia, supreme (slugs)"
                        />
                        <p className="text-xs text-muted-foreground">
                            Liste des slugs de marques concernées par cet article.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
