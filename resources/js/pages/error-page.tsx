import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({ status }: { status: number }) {
    const title = {
        503: 'Service Indisponible',
        500: 'Erreur du Serveur',
        404: 'Page Introuvable',
        403: 'Interdit',
    }[status] ?? 'Erreur Inconnue';

    const description = {
        503: 'Désolé, nous effectuons actuellement une maintenance. Veuillez revenir bientôt.',
        500: 'Oups, une erreur est survenue sur nos serveurs.',
        404: 'Désolé, la page que vous recherchez est introuvable.',
        403: "Désolé, vous n'êtes pas autorisé à accéder à cette page.",
    }[status] ?? 'Une erreur inattendue est survenue.';

    return (
        <>
            <Head title={title} />
            <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-12">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="flex items-center justify-center text-primary">
                        <AlertTriangle className="w-12 h-12" />
                    </div>

                    <div>
                        <h1 className="text-4xl font-semibold tracking-tight">{status}</h1>
                        <h2 className="text-xl font-medium mt-2">{title}</h2>
                        <p className="text-muted-foreground mt-2">{description}</p>
                    </div>

                    <Link
                        href={home()}
                        className="inline-flex items-center justify-center rounded-xl bg-primary text-white px-6 py-2 text-sm font-medium shadow hover:bg-primary transition-colors"
                    >
                        ← Retour à l'accueil
                    </Link>
                </div>
            </main>
        </>
    );
}
