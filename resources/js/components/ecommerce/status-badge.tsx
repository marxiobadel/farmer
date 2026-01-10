import { colorMap, orderDeliveryStatus } from "@/data";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
    const colorClass = colorMap[status] ?? "bg-gray-100 text-gray-700";

    const label = orderDeliveryStatus.find(s => s.value === status)?.label ?? status;

    return (
        <span className={cn("w-max inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", colorClass)}>
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60")} />
            {label}
        </span>
    );
}
