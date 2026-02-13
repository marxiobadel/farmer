import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

interface FlashMessages {
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
}

export const useFlashNotifications = () => {
    // Récupération sécurisée des props flash depuis Inertia
    const { flash } = usePage<{ flash: FlashMessages }>().props;

    // Le useRef doit toujours être déclaré avant toute logique conditionnelle ou useEffect
    const lastDisplayedMessage = useRef<string | null>(null);

    useEffect(() => {
        const types: Array<keyof FlashMessages> = ['success', 'warning', 'error', 'info'];

        types.forEach((type) => {
            const message = flash[type];

            // On ne déclenche le toast que si le message existe et est différent du dernier
            if (message && message !== lastDisplayedMessage.current) {
                const title = {
                    success: 'Succès !',
                    warning: 'Avertissement !',
                    error: 'Erreur !',
                    info: 'Info !',
                }[type];

                toast[type](
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{title}</span>
                        <span className="text-sm text-muted-foreground">
                            {message}
                        </span>
                    </div>
                );

                // Enregistrement du message pour éviter la répétition au prochain rendu
                lastDisplayedMessage.current = message;
            }

            // Si le message devient nul (Inertia vide les flashs), on réinitialise la référence
            if (!message && lastDisplayedMessage.current === flash[type]) {
                lastDisplayedMessage.current = null;
            }
        });
    }, [flash]); // Dépendance directe sur l'objet flash d'Inertia
};
