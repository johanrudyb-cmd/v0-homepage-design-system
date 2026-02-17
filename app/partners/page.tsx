import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, DollarSign, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Cette action sera exécutée côté serveur
async function getOrCreateAffiliateProfile(userId: string, userName: string) {
    'use server';

    const existingProfile = await prisma.affiliateProfile.findUnique({
        where: { userId },
    });

    if (existingProfile) return existingProfile;

    // Créer un code unique basé sur le nom (JOHAN123)
    const baseCode = userName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    const referralCode = `${baseCode}${randomSuffix}`;

    return await prisma.affiliateProfile.create({
        data: {
            userId,
            referralCode,
        },
    });
}

// Données simulées pour la démo (le temps de connecter le vrai n8n)
const VIDEOS_TO_CLIP = [
    {
        id: 1,
        title: "Podcast : Comment lancer sa marque en 2026",
        thumbnail: "/images/video-thumb-1.jpg",
        driveUrl: "#",
        category: "Business",
        duration: "12:00"
    },
    {
        id: 2,
        title: "Tuto : Tech Pack IA en 2 min",
        thumbnail: "/images/video-thumb-2.jpg",
        driveUrl: "#",
        category: "Tutoriel",
        duration: "03:45"
    },
    {
        id: 3,
        title: "Pourquoi le Dropshipping est MORT",
        thumbnail: "/images/video-thumb-3.jpg",
        driveUrl: "#",
        category: "Opinion",
        duration: "08:10"
    }
];

export default async function PartnersPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin?callbackUrl=/partners');
    }

    // Récupérer ou Créer le Profil Affilié
    const affiliate = await getOrCreateAffiliateProfile(user.id, user.name || 'PARTNER');
    const referralLink = `https://outfity.fr?ref=${affiliate.referralCode}`;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl tracking-tight text-green-600">OUTFITY PARTNERS</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">Code: {affiliate.referralCode}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                        {affiliate.referralCode.substring(0, 1)}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Partenaire</h1>
                        <p className="text-gray-500 mt-1">Générez des revenus en partageant OUTFITY.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" /> Kit Média
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                            <DollarSign className="w-4 h-4" /> Demander un Paiement
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Clics Totaux</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" /> +0% ce mois
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Inscriptions (Free)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Clients Payants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">Commissions (EUR)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">0,00 €</div>
                            <p className="text-xs text-green-700 mt-1">Payable le 1er du mois</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="links" className="w-full">
                    <TabsList className="bg-white border mb-6 p-1 h-auto rounded-xl">
                        <TabsTrigger value="links" className="px-6 py-2 rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-black">Mes Liens</TabsTrigger>
                        <TabsTrigger value="resources" className="px-6 py-2 rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-black">Vidéos à Clipper 🎥</TabsTrigger>
                        <TabsTrigger value="academy" className="px-6 py-2 rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-black">Académie Affilié 🎓</TabsTrigger>
                    </TabsList>

                    {/* TAB: LIENS */}
                    <TabsContent value="links" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Votre Lien Unique</CardTitle>
                                <CardDescription>Partagez ce lien sur TikTok, Instagram ou YouTube. Le cookie est valide 30 jours.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input value={referralLink} readOnly className="bg-gray-50 font-mono text-sm" />
                                    <Button variant="outline" className="shrink-0 gap-2">
                                        <Copy className="w-4 h-4" /> Copier
                                    </Button>
                                </div>
                                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                                    💡 <strong>Astuce Pro :</strong> Ajoutez <code>&s=tiktok1</code> à la fin de votre lien pour tracker d'où vient le clic (ex: tiktok1, insta_bio, youtube_desc).
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB: RESSOURCES (CLIPPING) */}
                    <TabsContent value="resources">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {VIDEOS_TO_CLIP.map((video) => (
                                <Card key={video.id} className="overflow-hidden group hover:shadow-lg transition-all cursor-pointer">
                                    <div className="aspect-video bg-gray-200 relative">
                                        {/* Placeholder Thumbnail */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                                            <Video className="w-12 h-12 opacity-50" />
                                        </div>
                                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            {video.duration}
                                        </div>
                                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold uppercase">
                                            {video.category}
                                        </div>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <Button className="w-full mt-2 gap-2" variant="secondary">
                                            <Download className="w-4 h-4" /> Télécharger Master
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="mt-8 text-center p-8 border-2 border-dashed rounded-xl bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Bientôt : L'IA de Clipping Automatique</h3>
                            <p className="text-gray-500 mt-2">Nous travaillons sur un outil qui découpe automatiquement les meilleurs moments pour vous.</p>
                        </div>
                    </TabsContent>

                    {/* TAB: ACADEMY */}
                    <TabsContent value="academy">
                        <Card>
                            <CardHeader>
                                <CardTitle>Formation "De 0 à 1000€/mois"</CardTitle>
                                <CardDescription>Apprenez les stratégies secrètes de nos meilleurs affiliés.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">1</div>
                                        <div>
                                            <h4 className="font-semibold">Le Mindset du Super-Affilié</h4>
                                            <p className="text-sm text-gray-500">Comprendre la psychologie de vente OUTFITY.</p>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 ml-auto text-gray-400" />
                                    </div>
                                    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">2</div>
                                        <div>
                                            <h4 className="font-semibold">La Structure Virale TikTok</h4>
                                            <p className="text-sm text-gray-500">Comment faire 100k vues avec nos clips.</p>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 ml-auto text-gray-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
