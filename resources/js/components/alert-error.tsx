import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

export default function AlertError({ errors, title }: {errors: string[]; title?: string;}) {
    return (
        <Alert
            variant="destructive"
            className="
                border-destructive/20 bg-destructive/10 text-destructive
                dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive
            "
        >
            <AlertCircleIcon className="h-5 w-5 shrink-0 opacity-90 dark:opacity-95" />

            <div className="flex flex-col gap-1">
                <AlertTitle className="font-semibold">
                    {title || 'Une erreur est survenue.'}
                </AlertTitle>

                <AlertDescription>
                    <ul className="list-inside list-disc text-sm text-destructive/90">
                        {Array.from(new Set(errors)).map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </AlertDescription>
            </div>
        </Alert>
    );
}
