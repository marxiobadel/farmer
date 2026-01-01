import { Footer } from '@/components/ecommerce/footer';
import { Header } from '@/components/ecommerce/header';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-primary/20 selection:text-primary">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
