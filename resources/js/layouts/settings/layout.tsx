import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState, type PropsWithChildren } from 'react';

const baseMenu = [
    { id: 'general', label: 'Général' },
    { id: 'account', label: 'Mon compte' },
    { id: 'appearance', label: 'Apparence' },
    { id: 'password', label: 'Mot de passe' },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    let menu = [...baseMenu];

    // 🧭 On construit les liens après les modifications
    const menuItems = menu.map((item) => ({
        ...item,
        href: admin.settings.page({ page: item.id }).url,
    }));

    const getActiveIdFromUrl = () =>
        menuItems.find((item) => item.href.endsWith(url))?.id || 'account';

    const [activeItem, setActiveItem] = useState(getActiveIdFromUrl);

    const handleNavigate = (id: string) => {
        const item = menuItems.find((i) => i.id === id);
        if (item) {
            setActiveItem(item.id);
            router.visit(item.href);
        }
    };

    useEffect(() => {
        setActiveItem(getActiveIdFromUrl());
    }, [url]);

    if (typeof window === 'undefined') return null;

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
            {/* Header */}
            <header className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4 p-4">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Paramètres
                </h1>
            </header>

            <div className="flex flex-col md:flex-row w-full relative rounded-2xl overflow-hidden border border-[#dfe1e7] bg-white dark:bg-neutral-900">
                {/* Sidebar desktop */}
                <nav
                    role="navigation"
                    aria-label="Account settings navigation"
                    className="
        hidden md:flex flex-col min-w-[225px] items-start gap-2 p-4
        border-r border-[#dfe1e7]
        dark:border-neutral-800
    "
                >
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            aria-current={activeItem === item.id ? 'page' : undefined}
                            className={cn(
                                "w-full text-sm text-left px-3 py-2 rounded-lg transition-colors",

                                activeItem === item.id
                                    ? [
                                        // Light
                                        "bg-gray-50 border border-[#dfe1e7] font-semibold text-gray-900",

                                        // Dark
                                        "dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    ]
                                    : [
                                        // Light
                                        "text-gray-500 hover:bg-gray-50",

                                        // Dark
                                        "dark:text-gray-400 dark:hover:bg-neutral-800"
                                    ]
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>


                {/* Select mobile */}
                <div className="md:hidden w-full border-b border-[#dfe1e7] px-4 py-2">
                    <select
                        className="w-full rounded-lg border border-[#dfe1e7] p-2 text-sm focus:ring-2 focus:ring-primary"
                        value={activeItem}
                        onChange={(e) => handleNavigate(e.target.value)}
                    >
                        {menuItems.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Main content */}
                <div className="flex flex-col flex-1">{children}</div>
            </div>
        </div>
    );
}
