import { AppleLoader } from '@/components/ui/apple-loader';

export default function LaunchMapLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 animate-in fade-in duration-500">
            <AppleLoader size="lg" />
            <p className="mt-4 text-sm text-muted-foreground font-medium animate-pulse">
                Chargement de votre parcours...
            </p>
        </div>
    );
}
