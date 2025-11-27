import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@images/logo.png';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const quotes = [
        { message: "La ferme est le cœur de la vie rurale.", author: "Jean Dupont" },
        { message: "Élevez vos rêves comme vous élevez vos poules.", author: "Marie Leclerc" },
        { message: "Chaque œuf raconte une histoire.", author: "Paul Martin" },
        { message: "Le secret d'une ferme prospère : patience et passion.", author: "Sophie Bernard" },
        { message: "Le chant du coq réveille l'âme du matin.", author: "Lucie Moreau" },
        { message: "L'herbe verte nourrit le corps et l'esprit.", author: "Antoine Dubois" },
        { message: "Un œuf frais vaut mieux qu'une promesse vide.", author: "Claire Fontaine" },
        { message: "La patience est la meilleure amie de l'agriculteur.", author: "Hugo Renault" },
        { message: "Chaque poule a son caractère et sa personnalité.", author: "Emma Laurent" },
        { message: "La terre bien travaillée donne toujours de beaux fruits.", author: "Mathieu Girard" }
    ];

    const [currentQuote, setCurrentQuote] = useState(quotes[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative grid min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200 px-4 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel */}
            <div className="relative hidden h-full flex-col bg-stone-800 p-10 text-stone-50 lg:flex border-r border-stone-700 enhanced-farm-panel">
                {/* Animated Farm SVG Background */}
                <div className="pointer-events-none absolute inset-0 z-10">
                    <div className="absolute right-6 top-10 animate-[float_8s_ease-in-out_infinite] origin-center scale-[1.4] drop-shadow-xl">
                        <motion.div animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }} transition={{ duration: 6, repeat: Infinity }}>
                            <Sun className="size-16 text-amber-300" />
                        </motion.div>
                    </div>
                </div>

                <Link
                    href={home()}
                    className="w-[140px] rounded-2xl bg-white duration-300 relative z-20 flex items-center justify-center p-2"
                >
                    <img src={logo} alt="Logo" className="w-[110px] object-contain" />
                </Link>

                {currentQuote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2 border-l-4 border-amber-400 pl-4">
                            <p className="text-lg italic">“{currentQuote.message}”</p>
                            <footer className="text-sm text-amber-200">{currentQuote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>

            {/* Right Panel */}
            <div className="w-full lg:p-10">
                <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[360px]">
                    <Link
                        href={home()}
                        className="w-[140px] rounded-2xl p-2 bg-white relative z-20 flex items-center justify-center gap-2 lg:hidden mx-auto"
                    >
                        <img src={logo} alt="Logo" className="w-[110px] object-contain" />
                    </Link>

                    <div className="flex flex-col items-start gap-3 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
                        <p className="text-sm text-stone-600">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
