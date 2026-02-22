'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    BookOpen,
    FileText,
    Video,
    Download,
    ArrowRight,
    Users,
    Sparkles,
    ArrowLeft,
    ChevronRight,
    Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const resources = [
    {
        category: 'Ebooks & Guides',
        title: 'Le Guide du Sourcing 2026',
        description: 'Apprenez à trouver et négocier avec les meilleures usines sans vous faire avoir.',
        icon: BookOpen,
        color: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        type: 'PDF • 45 pages',
        buttonText: 'Télécharger le Guide',
    },
    {
        category: 'Outils & Templates',
        title: 'Template Tech Pack Pro',
        description: 'Le modèle exact utilisé par les grandes marques pour communiquer avec leurs ateliers.',
        icon: FileText,
        color: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        type: 'Excel & PDF',
        buttonText: 'Récupérer le Template',
    },
    {
        category: 'Masterclass',
        title: 'De 0 à 10k€ avec sa marque',
        description: '45 minutes de vidéo intensive sur la stratégie marketing à adopter cette année.',
        icon: Video,
        color: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        type: 'Vidéo HD',
        buttonText: 'Regarder la Masterclass',
    },
    {
        category: 'Stratégie',
        title: 'Calendrier Editorial 365j',
        description: 'Un an de contenus programmés pour Instagram et TikTok pour ne jamais manquer d\'idées.',
        icon: Sparkles,
        color: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        type: 'Notion & PDF',
        buttonText: 'Accéder au Calendrier',
    }
];

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#007AFF] selection:text-white">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F2F2F2]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 text-[#86868b] group-hover:text-[#007AFF] transition-colors" />
                        <span className="text-sm font-medium text-[#86868b] group-hover:text-[#007AFF] transition-colors">Retour au site</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Image src="/icon.png" width={32} height={32} alt="Logo" className="rounded-lg" />
                        <span className="font-bold text-lg tracking-tight">Communauté</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/signin">
                            <Button variant="ghost" className="hidden sm:flex rounded-full px-6">Connexion</Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-full px-6 shadow-sm">S'insérer</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="bg-white/50 border-[#007AFF]/20 text-[#007AFF] px-4 py-1.5 rounded-full mb-6">
                            Outils & Ressources Gratuites
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1D1D1F] leading-[1.1] mb-6">
                            L'accélérateur de <br />
                            <span className="text-[#007AFF]">marques de demain.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-[#86868b] max-w-2xl mx-auto font-light leading-relaxed">
                            Nous mettons à votre disposition les meilleurs outils et ressources pour lancer et scaler votre marque de mode. Gratuitement.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <Button size="lg" className="bg-[#007AFF] hover:bg-[#0062CC] text-white h-14 px-10 text-lg rounded-full shadow-apple-lg transition-transform hover:scale-105 active:scale-95">
                            Rejoindre la Communauté
                        </Button>
                        <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full border-2 border-[#E5E5E7] hover:border-[#007AFF] hover:text-[#007AFF] transition-all">
                            Explorer les ressources
                        </Button>
                    </motion.div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 bg-radial-gradient" />
            </section>

            {/* Main Content - Resource Grid */}
            <section className="pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {resources.map((resource, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                className="group bg-white rounded-[32px] p-8 border border-[#F2F2F2] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className="absolute top-6 right-6">
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold">OFFERT</Badge>
                                </div>
                                <div className={`w-14 h-14 ${resource.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                    <resource.icon className={`w-7 h-7 ${resource.iconColor}`} />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-[#86868b] mb-1 block">
                                            {resource.category}
                                        </span>
                                        <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                                            {resource.title}
                                        </h3>
                                    </div>

                                    <p className="text-[#6e6e73] text-sm leading-relaxed min-h-[60px]">
                                        {resource.description}
                                    </p>

                                    <div className="pt-4 flex flex-col gap-4">
                                        <span className="text-xs font-medium text-[#86868b] flex items-center gap-2">
                                            <Download className="w-3 h-3" /> {resource.type}
                                        </span>
                                        <Button
                                            className="w-full bg-[#f2f2f7] hover:bg-[#007AFF] text-[#1D1D1F] hover:text-white rounded-xl shadow-none transition-all duration-300 font-bold"
                                        >
                                            {resource.buttonText}
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Special Section: Video Hub */}
                    <div className="mt-32 bg-white rounded-[48px] p-8 md:p-16 border border-[#F2F2F2] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div className="space-y-8">
                                <Badge className="bg-[#FF2D55]/10 text-[#FF2D55] border-none hover:bg-[#FF2D55]/20">MASTERCLASSES EXCLUSIVES</Badge>
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F]">
                                    Apprenez auprès des <span className="text-[#007AFF]">meilleurs experts.</span>
                                </h2>
                                <p className="text-lg text-[#6e6e73] leading-relaxed max-w-xl">
                                    Accédez à des heures de contenu vidéo stratégique pour comprendre les rouages du sourcing, du branding et de l'acquisition client en 2026.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Comment convaincre une usine majeure',
                                        'Négociation de prix et délais',
                                        'Stratégie de storytelling virale',
                                        'Ads Management pour marques de mode'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[#1D1D1F] font-semibold">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Play className="w-3 h-3 text-[#007AFF] fill-[#007AFF]" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Button size="lg" className="bg-[#1D1D1F] hover:bg-[#000000] text-white rounded-full px-8 h-14">
                                    Accéder à la bibliothèque vidéo
                                </Button>
                            </div>

                            <div className="relative group">
                                <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                                    <Image
                                        src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"
                                        alt="Video Preview"
                                        width={800}
                                        height={450}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                                            <Play className="w-8 h-8 text-[#007AFF] fill-[#007AFF] ml-1" />
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative Elements */}
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Conversion Banner */}
            <section className="bg-black py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-10">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                        Prêt à transformer vos <br />idées en réalité ?
                    </h2>
                    <p className="text-xl text-white/60 font-light max-w-xl mx-auto">
                        Utilisez les outils qu'utilisent les professionnels pour créer, sourcer et vendre vos collections.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <Link href="/auth/signup">
                            <Button size="lg" className="bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold h-16 px-12 text-lg rounded-full shadow-[0_0_50px_rgba(0,122,255,0.4)] transition-all transform hover:-translate-y-1">
                                Lancer ma marque maintenant
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-[#F2F2F2] py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Image src="/icon.png" width={28} height={28} alt="Logo" className="rounded-md" />
                        <span className="font-bold text-lg">OUTFITY</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-[#6e6e73]">
                        <Link href="/" className="hover:text-[#007AFF] transition-colors">Accueil</Link>
                        <Link href="/blog" className="hover:text-[#007AFF] transition-colors">Blog</Link>
                        <Link href="/contact" className="hover:text-[#007AFF] transition-colors">Contact</Link>
                        <Link href="/legal/terms" className="hover:text-[#007AFF] transition-colors">Mentions Légales</Link>
                    </div>
                    <div className="text-sm text-[#86868b] font-medium">
                        © 2026 OUTFITY. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}
