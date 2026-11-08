import { motion } from "framer-motion";

export const BackgroundGlow = () => {
    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {/* Precision Dots Canvas */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "28px 28px",
                }}
            />
            {/* Primary Ambient Aura */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.15, 0.28, 0.15],
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-32 -right-32 h-[550px] w-[550px] rounded-full bg-primary/20 blur-[130px]"
            />
            {/* Secondary Neutral Aura */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.08, 0.18, 0.08],
                }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-32 -left-20 h-[480px] w-[480px] rounded-full bg-accent blur-[120px]"
            />
        </div>
    );
};

export const Farm3DVisual = () => {
    return (
        <div className="relative aspect-square w-full rounded-3xl bg-card/50 p-6 shadow-md border border-border backdrop-blur-sm">
            {/* Animated Orbit Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
                    className="h-[340px] w-[340px] rounded-full border border-dashed border-primary/25"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute h-[270px] w-[270px] rounded-full border border-border/80"
                />
            </div>

            <svg
                viewBox="0 0 400 400"
                className="relative z-10 h-full w-full drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Volumetric Radial Gradients */}
                    <radialGradient id="eggPrimary3D" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="var(--card)" />
                        <stop offset="45%" stopColor="var(--primary)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--primary)" />
                    </radialGradient>

                    <radialGradient id="eggNeutral3D" cx="32%" cy="28%" r="75%">
                        <stop offset="0%" stopColor="var(--card)" />
                        <stop offset="65%" stopColor="var(--secondary)" />
                        <stop offset="100%" stopColor="var(--border)" />
                    </radialGradient>

                    <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="10" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Ambient Backlight */}
                <circle cx="200" cy="200" r="120" fill="var(--primary)" fillOpacity="0.08" filter="url(#softBlur)" />

                {/* Golden Egg (Primary) */}
                <motion.g
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ellipse cx="250" cy="300" rx="42" ry="10" fill="currentColor" className="text-foreground/10" />
                    <path
                        d="M 250 160 C 290 160 305 230 305 270 C 305 300 280 315 250 315 C 220 315 195 300 195 270 C 195 230 210 160 250 160 Z"
                        fill="url(#eggPrimary3D)"
                    />
                    <ellipse cx="236" cy="210" rx="12" ry="26" transform="rotate(-20 236 210)" fill="white" fillOpacity="0.4" />
                </motion.g>

                {/* Neutral Egg */}
                <motion.g
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                    <ellipse cx="160" cy="315" rx="38" ry="9" fill="currentColor" className="text-foreground/10" />
                    <path
                        d="M 160 190 C 195 190 208 250 208 285 C 208 310 185 325 160 325 C 135 325 112 310 112 285 C 112 250 125 190 160 190 Z"
                        fill="url(#eggNeutral3D)"
                    />
                    <ellipse cx="146" cy="235" rx="9" ry="22" transform="rotate(-18 146 235)" fill="white" fillOpacity="0.6" />
                </motion.g>

                {/* Hen Crest Silhouette */}
                <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <path
                        d="M190 115 C185 102 195 96 200 100 C205 90 218 90 220 104 C225 95 235 98 230 115 Z"
                        className="fill-destructive"
                    />
                    <polygon points="245,133 263,140 245,147" className="fill-primary" />
                    <circle cx="230" cy="132" r="4" className="fill-foreground" />
                    <circle cx="231.5" cy="130.5" r="1.3" className="fill-background" />
                </motion.g>
            </svg>
        </div>
    );
};
