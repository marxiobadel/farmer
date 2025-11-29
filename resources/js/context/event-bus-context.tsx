import { createContext, useContext, useRef, type PropsWithChildren } from "react";

type EventCallback = (data: any) => void;
type OnOptions = { replay?: boolean; once?: boolean };
type EmitOptions = { persist?: boolean }; // persist → aussi en sessionStorage si souhaité

interface EventBusContextType {
    emit: (name: string, data: any, opts?: EmitOptions) => void;
    on: (name: string, cb: EventCallback, opts?: OnOptions) => () => void;
    clearLast?: (name?: string) => void;
}

const EventBusContext = createContext<EventBusContextType | null>(null);

export const EventBusProvider = ({ children }: PropsWithChildren) => {
    const eventsRef = useRef<Record<string, EventCallback[]>>({});
    const lastRef = useRef<Record<string, any>>({});

    const emit = (name: string, data: any, opts?: EmitOptions) => {
        // garder en mémoire pour replay
        lastRef.current[name] = data;

        // option de persistance dans sessionStorage (pratique si refresh/navigation non-SPA)
        if (opts?.persist) {
            try {
                sessionStorage.setItem(`event:${name}`, JSON.stringify(data));
            } catch { }
        }

        const cbs = eventsRef.current[name];
        if (cbs?.length) {
            // appeler une copie pour sécurité si callbacks modifient la liste
            cbs.slice().forEach((cb) => {
                try { cb(data); } catch (e) { console.error(e); }
            });
        }
    };

    const on = (name: string, cb: EventCallback, opts?: OnOptions) => {
        if (!eventsRef.current[name]) eventsRef.current[name] = [];

        // wrapper si once demandé
        let wrapper: EventCallback | null = null;
        if (opts?.once) {
            wrapper = (data: any) => {
                try { cb(data); } catch (e) { console.error(e); }
                // unsubscribe
                eventsRef.current[name] = eventsRef.current[name].filter((c) => c !== wrapper);
            };
            eventsRef.current[name].push(wrapper);
        } else {
            eventsRef.current[name].push(cb);
        }

        // replay immédiat si demandé et si on a un last event
        if (opts?.replay) {
            // prioriser mémoire en-ram
            if (name in lastRef.current) {
                try { (opts?.once ? wrapper ?? cb : cb)(lastRef.current[name]); } catch (e) { console.error(e); }
            } else {
                // fallback sur sessionStorage si present
                try {
                    const raw = sessionStorage.getItem(`event:${name}`);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        try { (opts?.once ? wrapper ?? cb : cb)(parsed); } catch (e) { console.error(e); }
                    }
                } catch { }
            }
        }

        // unsubscribe function
        return () => {
            eventsRef.current[name] = eventsRef.current[name].filter((c) => c !== (wrapper ?? cb));
        };
    };

    const clearLast = (name?: string) => {
        if (name) {
            delete lastRef.current[name];
            try { sessionStorage.removeItem(`event:${name}`); } catch { }
        } else {
            Object.keys(lastRef.current).forEach(k => delete lastRef.current[k]);
            try {
                // optionnel : nettoyer tous les keys event:*
                Object.keys(sessionStorage).forEach(k => { if (k.startsWith("event:")) sessionStorage.removeItem(k); });
            } catch { }
        }
    };

    return (
        <EventBusContext.Provider value={{ emit, on, clearLast }}>
            {children}
        </EventBusContext.Provider>
    );
};

export const useEventBus = () => {
    const ctx = useContext(EventBusContext);
    if (!ctx) throw new Error("useEventBus must be used within an EventBusProvider");
    return ctx;
};
