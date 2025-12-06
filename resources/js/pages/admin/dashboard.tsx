import { NumberTicker } from '@/components/ui/number-ticker';
import { useCurrencyFormatter } from '@/hooks/use-currency';
import AppLayout from '@/layouts/app-layout';
import { generateImage } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Currency, User2, UserCheck2, UserCircle } from 'lucide-react';

interface UsersStats {
    admins_count: number;
    customers_count: number;
    visitors_count: number;
}

interface DashboardProps {
    usersStats: UsersStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: dashboard().url,
    },
];

export default function Dashboard({ usersStats }: DashboardProps) {
    const formatCurrency = useCurrencyFormatter();

    const adminCards = [
        {
            icon: Currency,
            title: formatCurrency(Number(0)),
            subtitle: 'Revenu total',
            cardHref: '#'
        },
        {
            icon: User2,
            title: <NumberTicker value={usersStats?.visitors_count ?? 0} />,
            subtitle: 'Total des visiteurs',
            cardHref: '#'
        },
        {
            icon: UserCheck2,
            title: <NumberTicker value={usersStats?.customers_count ?? 0} />,
            subtitle: 'Total des clients',
            cardHref: '#'
        },
        {
            icon: UserCircle,
            title: <NumberTicker value={usersStats?.admins_count ?? 0} />,
            subtitle: 'Total des admins',
            cardHref: '#'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />
            <div id="dashboard-capture" className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <header className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4 sm:gap-0 relative p-4">
                    <h1 className="text-base sm:text-xl leading-snug relative w-fit font-semibold text-greyscale-900">
                        Tableau de bord
                    </h1>

                    <button
                        type="button"
                        onClick={generateImage}
                        aria-label="Générer le rapport"
                        className="cursor-pointer inline-flex w-full sm:w-auto h-10 items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-greyscale-100 hover:bg-foundation-bluelight-hover"
                    >
                        <span className="text-sm sm:text-base font-semibold text-greyscale-900 whitespace-nowrap">
                            Générer le rapport
                        </span>
                    </button>
                </header>
                <div className="grid auto-rows-min gap-4 md:grid-cols-4 sm:grid-cols-2">
                    {adminCards.map((card, index) => (
                        <div
                            key={index}
                            className="
                                flex flex-col items-start justify-center gap-4 px-4 py-3.5 relative
                                bg-white rounded-xl border border-solid border-[rgb(223,225,231)]
                                dark:bg-gray-800 dark:border-gray-700
                            "
                        >
                            <div className="inline-flex items-center gap-4 relative flex-[0_0_auto] bg-transparent">
                                <div
                                    className="
                                        flex w-10 h-10 items-center justify-center gap-2 p-2 relative
                                        bg-primary rounded-lg dark:bg-amber-900
                                        border-none before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg
                                        before:[background:linear-gradient(180deg,rgba(255,255,255,.12)_0%),rgba(255,255,255,0)_100%)]
                                        before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
                                        before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                                >
                                    <card.icon className="!relative !h5 !w5 text-white" />
                                </div>
                                <div className="inline-flex flex-col items-start justify-center gap-0.5 relative flex-[0_0_auto]">
                                    <div
                                        className="
                                            relative w-fit mt-[-1.00px] [font-family: 'Inter_Tight-SemiBold', Helvetica]
                                            font-semibold text-[rgb(13,13,18)] text-xl tracking-[0] leading-[27px] whitespace-nowrap
                                            dark:text-gray-100
                                        "
                                    >
                                        {card.title}
                                    </div>
                                    <div
                                        className="
                                            [font-family:'Manrope-Regular',Helvetica] font-normal relative w-fit
                                            text-[rgb(102,109,128)] text-sm tracking-[.28px] leading-[21px] whitespace-nowrap
                                            dark:text-gray-400
                                        "
                                    >
                                        {card.subtitle}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border-t-1 border-dashed border-gray-300 my-2 dark:border-gray-600"></div>
                            <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto] bg-transparent">
                                <Link
                                    href={card.cardHref}
                                    className="
                                        mt-[1px] [font-family:'Inter_Tight-Medium', Helvetica] font-medium relative w-fit
                                        text-[rgb(102,109,128)] text-sm tracking-[0.28px] leading-[21px] whitespace-nowrap
                                        dark:text-gray-400
                                    "
                                >
                                    Afficher les détails
                                </Link>
                                <ChevronRight className="!relative dark:text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
